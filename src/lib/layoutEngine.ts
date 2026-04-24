import { Edge, Node, Position } from '@xyflow/react';
import { Person, Union, PersonUnionLink, BudConfig } from './types';

export const SPACING = {
    CARD_WIDTH: 280,
    CARD_HEIGHT: 90,
    NODE_PADDING: 20,
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

    const unionSubtreeWidths: Record<string, number> = {};
    const subtreeWidths: Record<string, number> = {};

    const visitedHubs = new Set<string>();

    const PARTNER_OFFSET = (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP) / 2; // = 170
    const COUPLE_WIDTH = (PARTNER_OFFSET * 2) + SPACING.CARD_WIDTH;          // = 620
    const PADDED_CARD_WIDTH = SPACING.CARD_WIDTH + (2 * SPACING.NODE_PADDING);
    const CARD_CENTER_OFFSET = PADDED_CARD_WIDTH / 2;


    // --- Helpers ---
    const getPartnerLinks = (pId: string) => links.filter(l => l.personId === pId && l.role === 'partner');
    const getUnionPartners = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);
    const getUnionChildren = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'child').map(l => persons.find(p => p.id === l.personId)).filter(Boolean) as Person[];
    const getParentUnion = (pId: string) => links.find(l => l.personId === pId && l.role === 'child')?.unionId;

    // --- PASS 1: Bottom-Up Width Calculation ---
    // שתי פונקציות רקורסיביות שמחשבות רוחב נכון מלמטה למעלה.
    // כל union יודע כמה מקום הוא צריך בשביל עצמו + כל הצאצאים שלו.

    // getUnionSubtreeWidth: כמה רוחב דורש Union אחד (זוג + כל ילדיהם + כל נישואיהם)
    const getUnionSubtreeWidth = (uId: string): number => {
        if (unionSubtreeWidths[uId] !== undefined) return unionSubtreeWidths[uId];

        const children = getUnionChildren(uId);

        if (children.length === 0) {
            unionSubtreeWidths[uId] = COUPLE_WIDTH;
            return COUPLE_WIDTH;
        }

        // רוחב כולל הילדים = סכום רוחב כל ילד + מרווחים
        const childrenTotalWidth =
            children.reduce((sum, c) => sum + getPersonSubtreeWidth(c.id), 0)
            + (children.length - 1) * SPACING.SIBLING_GAP;

        unionSubtreeWidths[uId] = Math.max(COUPLE_WIDTH, childrenTotalWidth);
        return unionSubtreeWidths[uId];
    };

    // getPersonSubtreeWidth: כמה רוחב דורש אדם (כולל כל הנישואין שלו ממוקמים זה לצד זה)
    const getPersonSubtreeWidth = (pId: string): number => {
        if (subtreeWidths[pId] !== undefined) return subtreeWidths[pId];

        const myUnions = getPartnerLinks(pId);

        if (myUnions.length === 0) {
            subtreeWidths[pId] = SPACING.CARD_WIDTH;
            return SPACING.CARD_WIDTH;
        }

        // כל נישואין של האדם יושבים זה לצד זה — סכום רוחב כולם
        const totalWidth = myUnions.reduce(
            (sum, link, idx) => sum + getUnionSubtreeWidth(link.unionId) + (idx > 0 ? SPACING.SIBLING_GAP : 0),
            0
        );

        subtreeWidths[pId] = totalWidth;
        return totalWidth;
    };

    // הפעל על כולם לפני ההצבה
    persons.forEach(p => getPersonSubtreeWidth(p.id));
    unions.forEach(u => getUnionSubtreeWidth(u.id));

    // --- PASS 3: Upwards Placement ---
    const placeAncestorUnion = (uId: string, anchorCenterX: number, Y: number) => {
        if (visitedHubs.has(uId)) return;

        const partners = getUnionPartners(uId);

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

        if (!positions[pLeftId]) positions[pLeftId] = { x: finalHubX - PARTNER_OFFSET, y: Y };
        if (!positions[pRightId]) positions[pRightId] = { x: finalHubX + PARTNER_OFFSET, y: Y };

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

        if (context?.type === 'pivot' && context.direction) {
            if (context.direction === 1) {
                pLeftId = context.sourceId;
                pRightId = partners.find(id => id !== context.sourceId)!;
            } else {
                pRightId = context.sourceId;
                pLeftId = partners.find(id => id !== context.sourceId)!;
            }
        }

        const existingLeft = positions[pLeftId];
        const existingRight = positions[pRightId];

        let finalHubX = hubX;

        // 2. עיגון ה-Hub
        if (context) {
            finalHubX = hubX;
        } else {
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

        if (!existingLeft) positions[pLeftId] = { x: finalHubX - PARTNER_OFFSET, y: Y };
        if (!existingRight) positions[pRightId] = { x: finalHubX + PARTNER_OFFSET, y: Y };

        const handlePivot = (pId: string, isRight: boolean) => {
            const otherUnions = getPartnerLinks(pId).filter(l => l.unionId !== uId);
            const direction = isRight ? 1 : -1;
            const anchorX = positions[pId].x;

            let hubX = isRight
                ? anchorX + PARTNER_OFFSET
                : anchorX - PARTNER_OFFSET;

            otherUnions.forEach(link => {
                if (visitedHubs.has(link.unionId)) return;
                const uOtherWidth = getUnionSubtreeWidth(link.unionId);

                placeUnion(link.unionId, hubX, Y, { type: 'pivot', sourceId: pId, direction: direction as 1 | -1 });

                const childrenExtra = Math.max(0, uOtherWidth - COUPLE_WIDTH);
                const advance = (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP + childrenExtra) * direction;
                hubX += advance;
            });
        };


        handlePivot(pLeftId, false);
        handlePivot(pRightId, true);

        // 5. הוספת הורים (Pass 3 רקורסיבי)
        [pLeftId, pRightId].forEach(pId => {
            const parentUId = getParentUnion(pId);
            if (parentUId && !visitedHubs.has(parentUId)) {
                placeAncestorUnion(parentUId, positions[pId].x + CARD_CENTER_OFFSET, Y - SPACING.LEVEL_Y);
            }
        });

        const children = getUnionChildren(uId).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
        if (children.length > 0) {
            const totalChildrenWidth =
                children.reduce((sum, c) => sum + getPersonSubtreeWidth(c.id), 0)
                + (children.length - 1) * SPACING.SIBLING_GAP;

            let currentChildX = finalHubX - (totalChildrenWidth / 2);

            children.forEach(child => {
                const childPersonWidth = getPersonSubtreeWidth(child.id);
                const childUnions = getPartnerLinks(child.id);

                if (childUnions.length > 0 && !visitedHubs.has(childUnions[0].unionId)) {
                    const primaryUnionId = childUnions[0].unionId;
                    const primaryUnionWidth = getUnionSubtreeWidth(primaryUnionId);
                    const primaryHubX = currentChildX + PARTNER_OFFSET;

                    placeUnion(primaryUnionId, primaryHubX, Y + SPACING.LEVEL_Y, { type: 'child', sourceId: child.id });

                    // Pivot unions — ממשיכים מהקצה הימני של ה-union הראשון
                    let pivotStartX = currentChildX + primaryUnionWidth;
                    childUnions.slice(1).forEach(link => {
                        if (visitedHubs.has(link.unionId)) return;
                        const pivotUnionWidth = getUnionSubtreeWidth(link.unionId);
                        const pivotHubX = pivotStartX + PARTNER_OFFSET;
                        placeUnion(link.unionId, pivotHubX, Y + SPACING.LEVEL_Y, { type: 'pivot', sourceId: child.id, direction: 1 });
                        pivotStartX += pivotUnionWidth + SPACING.SIBLING_GAP;
                    });
                } else if (!positions[child.id]) {
                    positions[child.id] = {
                        x: currentChildX + (childPersonWidth / 2) - (SPACING.CARD_WIDTH / 2),
                        y: Y + SPACING.LEVEL_Y
                    };
                }

                currentChildX += childPersonWidth + SPACING.SIBLING_GAP;
            });
        }
    };

    // --- EXECUTION ---
    if (focusUnionId) {
        placeUnion(focusUnionId, 0, SPACING.ROOT_Y_START);
    } else {
        let currentXOffset = 0;

        const rootUnions = unions.filter(u => {
            const partners = getUnionPartners(u.id);
            return partners.every(pId => !getParentUnion(pId));
        });

        const allUnionsToProcess = [...rootUnions, ...unions];

        allUnionsToProcess.forEach(u => {
            if (!visitedHubs.has(u.id)) {
                placeUnion(u.id, currentXOffset, SPACING.ROOT_Y_START);
                const widthUsed = getUnionSubtreeWidth(u.id);
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
            data: { hasChildren, isDivorced, unionId: u.id }
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