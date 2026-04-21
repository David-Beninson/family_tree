import { Edge, Node, Position } from '@xyflow/react';
import { Person, Union, PersonUnionLink, BudConfig } from './types';

export const SPACING = {
    CARD_WIDTH: 280,
    CARD_HEIGHT: 90,
    NODE_PADDING: 20, // מרחב הגנה מסביב לכל כרטיס
    MIN_NODE_GAP: 60,
    SIBLING_GAP: 120,
    LEVEL_Y: 250,
    ROOT_Y_START: 0,
};

/**
 * Calculates current hub position for state updates (dragging)
 */
export const calculateHubPosition = (p1Pos: { x: number, y: number }, p2Pos: { x: number, y: number }, status: Union['status'], hasChildren: boolean) => {
    const centerX = (p1Pos.x + p2Pos.x) / 2 + (SPACING.CARD_WIDTH / 2);
    let centerY = p1Pos.y + (SPACING.CARD_HEIGHT / 2);

    if (status === 'divorced' && hasChildren) {
        centerY = Math.max(p1Pos.y, p2Pos.y) + SPACING.CARD_HEIGHT + 35;
    }
    return { x: centerX, y: centerY };
};

export function buildGraphLayout(
    persons: Person[],
    unions: Union[],
    links: PersonUnionLink[],
    focusUnionId?: string
): { nodes: Node[], edges: Edge[] } {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    const positions: Record<string, { x: number, y: number }> = {};
    const hubPositions: Record<string, { x: number, y: number }> = {};
    const subtreeWidths: Record<string, number> = {};
    const unionWidths: Record<string, number> = {};

    const visitedWidths = new Set<string>();
    const visitedHubs = new Set<string>();

    const PADDED_CARD_WIDTH = SPACING.CARD_WIDTH + (2 * SPACING.NODE_PADDING);
    const CARD_CENTER_OFFSET = PADDED_CARD_WIDTH / 2;
    const PARTNER_OFFSET = (PADDED_CARD_WIDTH + SPACING.MIN_NODE_GAP) / 2;

    // --- Helpers ---
    const getPartnerLinks = (pId: string) => links.filter(l => l.personId === pId && l.role === 'partner');
    const getUnionPartners = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);
    const getUnionChildren = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'child').map(l => persons.find(p => p.id === l.personId)).filter(Boolean) as Person[];
    const getParentUnion = (pId: string) => links.find(l => l.personId === pId && l.role === 'child')?.unionId;

    // --- PASS 1: Width Calculation (Robust for Shared Lineage) ---
    const calculatePersonWidth = (pId: string): number => {
        if (subtreeWidths[pId]) return subtreeWidths[pId];

        const myUnions = getPartnerLinks(pId);
        if (myUnions.length === 0) {
            subtreeWidths[pId] = SPACING.CARD_WIDTH;
            return SPACING.CARD_WIDTH;
        }

        let totalWidth = 0;
        myUnions.forEach((link, idx) => {
            const uId = link.unionId;
            const children = getUnionChildren(uId);

            const childrenWidth = children.length === 0 ? 0 :
                children.reduce((sum, c) => sum + calculatePersonWidth(c.id), 0) + (children.length - 1) * SPACING.SIBLING_GAP;

            const unionBaseWidth = (SPACING.CARD_WIDTH * 2) + SPACING.MIN_NODE_GAP;
            const unionTrueWidth = Math.max(unionBaseWidth, childrenWidth);

            unionWidths[uId] = unionTrueWidth;
            totalWidth += unionTrueWidth;
            if (idx < myUnions.length - 1) totalWidth += SPACING.SIBLING_GAP;
        });

        subtreeWidths[pId] = totalWidth;
        return totalWidth;
    };

    persons.forEach(p => calculatePersonWidth(p.id));

    // --- PASS 3: Upwards Placement ---
    const placeAncestorUnion = (uId: string, anchorCenterX: number, Y: number) => {
        if (visitedHubs.has(uId)) return;

        const partners = getUnionPartners(uId);

        // שמירה על אותה לוגיקת ימין/שמאל גם כשעולים למעלה כדי למנוע החלפת צדדים
        const sortedPartners = [...partners].sort((a, b) => a.localeCompare(b));
        let pRightId = sortedPartners[1] || partners[1];
        let pLeftId = partners.find(id => id !== pRightId)!;

        const p1HasLineage = !!getParentUnion(sortedPartners[0]);
        const p2HasLineage = !!getParentUnion(sortedPartners[1]);
        if (p1HasLineage && !p2HasLineage) {
            pRightId = sortedPartners[0];
            pLeftId = sortedPartners[1];
        } else if (!p1HasLineage && p2HasLineage) {
            pRightId = sortedPartners[1];
            pLeftId = sortedPartners[0];
        }

        const existingLeft = positions[pLeftId];
        const existingRight = positions[pRightId];

        if (existingLeft && existingRight) {
            visitedHubs.add(uId);
            hubPositions[uId] = { x: (existingLeft.x + existingRight.x) / 2, y: Y + (SPACING.CARD_HEIGHT / 2) };
            return;
        }

        let finalHubX = anchorCenterX;
        if (existingLeft && !existingRight) {
            finalHubX = existingLeft.x + PARTNER_OFFSET;
        } else if (existingRight && !existingLeft) {
            finalHubX = existingRight.x - PARTNER_OFFSET;
        }

        visitedHubs.add(uId);
        hubPositions[uId] = { x: finalHubX, y: Y + (SPACING.CARD_HEIGHT / 2) };

        const pLeftX = finalHubX - PARTNER_OFFSET;
        const pRightX = finalHubX + PARTNER_OFFSET;

        if (!positions[pLeftId]) positions[pLeftId] = { x: pLeftX, y: Y };
        if (!positions[pRightId]) positions[pRightId] = { x: pRightX, y: Y };

        [pLeftId, pRightId].forEach(pId => {
            const parentUId = getParentUnion(pId);
            if (parentUId) {
                placeAncestorUnion(parentUId, positions[pId].x + CARD_CENTER_OFFSET, Y - SPACING.LEVEL_Y);
            }
        });
    };

    // --- PASS 2: Downwards Placement with Anchoring ---
    const placeUnion = (uId: string, hubX: number, Y: number, context?: { type: 'pivot' | 'child', sourceId: string, direction?: 1 | -1 }) => {
        if (visitedHubs.has(uId)) return;

        const u = unions.find(un => un.id === uId);
        if (!u) return;

        const partners = getUnionPartners(uId);
        if (partners.length !== 2) return;

        // 1. קודם כל נחליט מי ימין ומי שמאל
        const sortedPartners = [...partners].sort((a, b) => a.localeCompare(b));
        let pLeftId = sortedPartners[0];
        let pRightId = sortedPartners[1];

        const p1HasLineage = !!getParentUnion(sortedPartners[0]);
        const p2HasLineage = !!getParentUnion(sortedPartners[1]);

        if (p1HasLineage && !p2HasLineage) {
            pRightId = sortedPartners[0];
            pLeftId = sortedPartners[1];
        } else if (!p1HasLineage && p2HasLineage) {
            pRightId = sortedPartners[1];
            pLeftId = sortedPartners[0];
        }

        // דורסים ימין/שמאל רק אם זה פיבוט, כדי לדחוף את המשפחה החוצה מהאדם המשותף
        if (context?.type === 'pivot' && context.direction) {
            if (context.direction === 1) { // פיבוט נדחף ימינה -> האדם המשותף חייב להיות משמאל
                pLeftId = context.sourceId;
                pRightId = partners.find(id => id !== context.sourceId)!;
            } else { // פיבוט נדחף שמאלה -> האדם המשותף חייב להיות מימין
                pRightId = context.sourceId;
                pLeftId = partners.find(id => id !== context.sourceId)!;
            }
        }

        const existingLeft = positions[pLeftId];
        const existingRight = positions[pRightId];

        let finalHubX = hubX;

        // 2. עיגון ה-Hub
        if (context) {
            // הגענו מפיבוט או מילד - נשתמש ב-hubX שחושב במדויק על ידי המנוע כדי לא לדרוס משפחות!
            finalHubX = hubX;
        } else {
            // הגענו מענף אחר - צריך לעגן לאדם קיים (מונע התנגשויות של נישואי קרובים)
            if (existingLeft && !existingRight) {
                finalHubX = existingLeft.x + PARTNER_OFFSET;
            } else if (existingRight && !existingLeft) {
                finalHubX = existingRight.x - PARTNER_OFFSET;
            } else if (existingLeft && existingRight) {
                finalHubX = (existingLeft.x + existingRight.x) / 2;
            }
        }

        visitedHubs.add(uId);
        hubPositions[uId] = { x: finalHubX, y: Y + (SPACING.CARD_HEIGHT / 2) };

        // 3. הצבת בני הזוג (רק אם לא הוצבו כבר!)
        if (!existingLeft) positions[pLeftId] = { x: finalHubX - PARTNER_OFFSET, y: Y };
        if (!existingRight) positions[pRightId] = { x: finalHubX + PARTNER_OFFSET, y: Y };

        // 4. המשך לנישואים נוספים (Pivot)
        const handlePivot = (pId: string, currentX: number, isRight: boolean) => {
            const otherUnions = getPartnerLinks(pId).filter(l => l.unionId !== uId);
            let direction = isRight ? 1 : -1;
            let currentPivotOffset = currentX + CARD_CENTER_OFFSET; // מתחילים ממרכז הכרטיסייה הקיים

            otherUnions.forEach(link => {
                if (visitedHubs.has(link.unionId)) return;
                const uOtherWidth = unionWidths[link.unionId] || (SPACING.CARD_WIDTH * 2 + SPACING.MIN_NODE_GAP);

                // חישוב המיקום החדש להאב תוך כדי הדיפה החוצה
                const otherHubX = currentPivotOffset + direction * (uOtherWidth / 2 + SPACING.MIN_NODE_GAP);
                placeUnion(link.unionId, otherHubX, Y, { type: 'pivot', sourceId: pId, direction: direction as 1 | -1 });

                // עדכון האופסט כדי שהאישה/הבעל השלישיים יידחפו עוד יותר החוצה ולא ידרסו את השניים!
                currentPivotOffset = otherHubX + direction * (uOtherWidth / 2);
            });
        };

        handlePivot(pLeftId, positions[pLeftId].x, false);
        handlePivot(pRightId, positions[pRightId].x, true);

        // 5. הוספת הורים (Pass 3 רקורסיבי)
        [pLeftId, pRightId].forEach(pId => {
            const parentUId = getParentUnion(pId);
            if (parentUId && !visitedHubs.has(parentUId)) {
                placeAncestorUnion(parentUId, positions[pId].x + CARD_CENTER_OFFSET, Y - SPACING.LEVEL_Y);
            }
        });

        // 6. מיקום ילדים
        const children = getUnionChildren(uId).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
        if (children.length > 0) {
            const totalChildrenWidth = children.reduce((sum, c) => sum + (subtreeWidths[c.id] || SPACING.CARD_WIDTH), 0) + (children.length - 1) * SPACING.SIBLING_GAP;
            let currentChildX = finalHubX - (totalChildrenWidth / 2);

            children.forEach(child => {
                const childUnions = getPartnerLinks(child.id);
                if (childUnions.length > 0 && !visitedHubs.has(childUnions[0].unionId)) {
                    const childHubX = currentChildX + (subtreeWidths[child.id] / 2);
                    placeUnion(childUnions[0].unionId, childHubX, Y + SPACING.LEVEL_Y, { type: 'child', sourceId: child.id });
                } else if (!positions[child.id]) {
                    positions[child.id] = { x: currentChildX, y: Y + SPACING.LEVEL_Y };
                }
                currentChildX += (subtreeWidths[child.id] || SPACING.CARD_WIDTH) + SPACING.SIBLING_GAP;
            });
        }
    };

    // --- EXECUTION ---
    if (focusUnionId) {
        // גישת ה-Focus: מציירים רק את מה שמחובר לאיחוד המרכזי
        placeUnion(focusUnionId, 0, SPACING.ROOT_Y_START);
    } else {
        // ציור כל העץ + משפחות מנותקות (Disconnected Subtrees)
        let currentXOffset = 0;

        // מציאת כל האיחודים שהם "שורשים" (לפחות לאחד מבני הזוג אין הורים במערכת)
        const rootUnions = unions.filter(u => {
            const partners = getUnionPartners(u.id);
            return partners.some(pId => !getParentUnion(pId));
        });

        // רצים על כל השורשים, וגם מוודאים שלא פספסנו איחודים מנותקים
        const allUnionsToProcess = [...rootUnions, ...unions];

        allUnionsToProcess.forEach(u => {
            if (!visitedHubs.has(u.id)) {
                placeUnion(u.id, currentXOffset, SPACING.ROOT_Y_START);
                // דוחפים את המשפחה המנותקת הבאה הרחק ימינה כדי שלא יתנגשו
                const widthUsed = unionWidths[u.id] || (SPACING.CARD_WIDTH * 3);
                currentXOffset += widthUsed + (SPACING.SIBLING_GAP * 2);
            }
        });
    }

    // --- FINAL NODE CONVERSION ---
    const currentYear = new Date().getFullYear();
    persons.forEach(p => {
        if (!positions[p.id]) return;

        const myPartnerLinks = getPartnerLinks(p.id);
        const hasActiveSpouse = myPartnerLinks.some(l => {
            const un = unions.find(u => u.id === l.unionId);
            return un && (un.status === 'married' || un.status === 'partnered');
        });

        const parentCount = getParentUnion(p.id) ? 2 : 0;
        const isAdult = p.isAlive ? (currentYear - (p.birthYear || 0) >= 18) : true;
        const buds: BudConfig[] = [];

        if (parentCount < 2) buds.push({ position: Position.Bottom, direction: 'down', actionText: 'הורה' });
        if (!hasActiveSpouse && isAdult) {
            buds.push({ position: Position.Left, direction: 'left', actionText: 'בן/בת זוג' });
        }

        rfNodes.push({
            id: p.id,
            type: 'familyMember',
            position: { x: positions[p.id].x + SPACING.NODE_PADDING, y: positions[p.id].y },
            width: SPACING.CARD_WIDTH,
            height: SPACING.CARD_HEIGHT,
            draggable: false,
            data: { person: p, isMarried: hasActiveSpouse, parentCount, buds }
        });
    });

    unions.forEach(u => {
        if (!hubPositions[u.id]) return;
        const partners = getUnionPartners(u.id);
        const children = getUnionChildren(u.id);
        const hasChildren = children.length > 0;
        const isDivorced = u.status === 'divorced';

        rfNodes.push({
            id: `union-hub-${u.id}`,
            type: 'union',
            position: { x: hubPositions[u.id].x - 10, y: hubPositions[u.id].y - 10 },
            width: 20,
            height: 20,
            draggable: false,
            data: { hasChildren, isDivorced }
        });

        const p1Nodes = rfNodes.filter(n => n.id === partners[0] || n.id === partners[1]);
        if (p1Nodes.length < 2) return;

        const node1 = p1Nodes[0];
        const node2 = p1Nodes[1];
        const p1IsRight = node1.position.x > node2.position.x;

        if (u.status === 'married' || u.status === 'partnered') {
            rfEdges.push({ id: `e1-${u.id}`, source: node1.id, target: `union-hub-${u.id}`, sourceHandle: p1IsRight ? 'left-out' : 'right-out', targetHandle: p1IsRight ? 'right-target' : 'left-target', type: 'straight' });
            rfEdges.push({ id: `e2-${u.id}`, source: node2.id, target: `union-hub-${u.id}`, sourceHandle: p1IsRight ? 'right-out' : 'left-out', targetHandle: p1IsRight ? 'left-target' : 'right-target', type: 'straight' });
        } else {
            rfEdges.push({ id: `e1-${u.id}`, source: node1.id, target: `union-hub-${u.id}`, sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight' });
            rfEdges.push({ id: `e2-${u.id}`, source: node2.id, target: `union-hub-${u.id}`, sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight' });
        }

        children.forEach(c => {
            rfEdges.push({ id: `c-${u.id}-${c.id}`, source: `union-hub-${u.id}`, target: c.id, sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'smoothstep' });
        });
    });

    return { nodes: rfNodes, edges: rfEdges };
}