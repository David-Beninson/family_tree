import { Edge, Node, Position } from '@xyflow/react';
import { Person, Union, PersonUnionLink, BudConfig } from './types';

export const SPACING = {
    CARD_WIDTH: 280,
    CARD_HEIGHT: 90,
    MIN_NODE_GAP: 60,
    SIBLING_GAP: 120,
    LEVEL_Y: 250,
    ROOT_Y_START: 0,
};

export const calculateHubPosition = (p1Pos: { x: number, y: number }, p2Pos: { x: number, y: number }, isDivorced: boolean, hasChildren: boolean) => {
    const centerX = (p1Pos.x + p2Pos.x) / 2 + (SPACING.CARD_WIDTH / 2);
    let centerY = Math.min(p1Pos.y, p2Pos.y) + (SPACING.CARD_HEIGHT / 2);

    if (hasChildren) {
        centerY = Math.max(p1Pos.y, p2Pos.y) + SPACING.CARD_HEIGHT + 35;
    }
    return { x: centerX, y: centerY };
};

export function buildGraphLayout(persons: Person[], unions: Union[], links: PersonUnionLink[]): { nodes: Node[], edges: Edge[] } {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    const positions: Record<string, { x: number, y: number }> = {};
    const nodeWidths: Record<string, number> = {};

    const getChildLink = (pId: string) => links.find(l => l.personId === pId && l.role === 'child');
    const getPartnerLinks = (pId: string) => links.filter(l => l.personId === pId && l.role === 'partner');
    const getUnionPartners = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);
    const getUnionChildren = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'child').map(l => persons.find(p => p.id === l.personId)).filter(Boolean) as Person[];

    // מציאת השורשים הראשיים (אנשים שאין להם הורים, ואינם בני זוג של מישהו שיש לו הורים בגרף)
    const findAllMainRoots = (): string[] => {
        const potentialRoots = persons.filter(p => !getChildLink(p.id));
        const mainRoots: string[] = [];

        potentialRoots.forEach(p => {
            // בדיקה האם האדם הוא רק בן/בת זוג של מישהו שהוא בעצמו לא שורש (כמו נועה לוי שנכנסת לעץ דרך עומר)
            const partnerLinks = getPartnerLinks(p.id);
            let isOnlyInlaw = false;

            if (partnerLinks.length > 0) {
                const isSpouseToNonRoot = partnerLinks.some(l => {
                    const partners = getUnionPartners(l.unionId);
                    const spouseId = partners.find(id => id !== p.id);
                    if (spouseId) {
                        const spouseHasParents = !!getChildLink(spouseId);
                        return spouseHasParents;
                    }
                    return false;
                });
                isOnlyInlaw = isSpouseToNonRoot;
            }

            if (!isOnlyInlaw) {
                mainRoots.push(p.id);
            }
        });

        // אם בטעות סיננו את כולם, נחזיר את הראשון כגיבוי
        if (mainRoots.length === 0 && potentialRoots.length > 0) {
            mainRoots.push(potentialRoots[0].id);
        }

        return mainRoots;
    };

    // --- מעבר 1: חישוב רוחב של יחידות (קבוצות מבוגרים + הילדים שלהם) ---
    const calculateSubtreeWidth = (pId: string): number => {
        if (nodeWidths[pId] !== undefined) return nodeWidths[pId];

        const partnerLinks = getPartnerLinks(pId);

        if (partnerLinks.length === 0) {
            nodeWidths[pId] = SPACING.CARD_WIDTH + SPACING.SIBLING_GAP;
            return nodeWidths[pId];
        }

        let totalWidth = 0;
        const processedUnions = new Set<string>();

        // נציב את האדם עצמו
        let adultsCount = 1;

        partnerLinks.forEach(link => {
            if (processedUnions.has(link.unionId)) return;
            processedUnions.add(link.unionId);

            adultsCount++; // הוספנו בן/בת זוג

            const children = getUnionChildren(link.unionId);
            if (children.length > 0) {
                const unionChildrenWidth = children.reduce((sum, child) => sum + calculateSubtreeWidth(child.id), 0);
                totalWidth += Math.max(0, unionChildrenWidth - (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP)); // מוסיפים רק את הרוחב העודף שהילדים דורשים מעבר להורים שלהם
            }
        });

        const adultsBaseWidth = adultsCount * SPACING.CARD_WIDTH + (adultsCount - 1) * SPACING.MIN_NODE_GAP;

        // הרוחב הסופי הוא הבסיס של המבוגרים + כל ההרחבות שנדרשות על ידי הילדים
        nodeWidths[pId] = adultsBaseWidth + totalWidth + SPACING.SIBLING_GAP;
        return nodeWidths[pId];
    };

    // --- מעבר 2: הצבת הצמתים בפועל ---
    const placeTree = (pId: string, startX: number, level: number) => {
        if (positions[pId]) return;

        const yPos = SPACING.ROOT_Y_START + level * SPACING.LEVEL_Y;
        const partnerLinks = getPartnerLinks(pId);

        if (partnerLinks.length === 0) {
            positions[pId] = { x: startX, y: yPos };
            return;
        }

        // מציאת כל המבוגרים באשכול (האדם עצמו וכל בני/בנות זוגו)
        const spouses = partnerLinks.map(l => {
            const partners = getUnionPartners(l.unionId);
            return partners.find(id => id !== pId)!;
        }).filter(Boolean);

        const adultGroup = [pId, ...spouses.filter(sId => !positions[sId])];

        // סידור האשכול לפי מין ולפי סדר הנישואין
        adultGroup.sort((a, b) => {
            const pA = persons.find(p => p.id === a);
            const pB = persons.find(p => p.id === b);

            // תמיד האדם המקורי שדרכו נכנסנו למשפחה יישאר פנימי יותר בתוך העץ
            // אבל באופן כללי נשמור: אישה שמאל, גבר ימין (אלא אם זה שובר סדר של פוליגמיה/ריבוי גירושין)
            if (a === pId) return pA?.gender === 'male' ? 1 : -1;
            if (b === pId) return pB?.gender === 'male' ? -1 : 1;
            return 0;
        });

        // מיקום קבוצת המבוגרים החל מ-startX
        let currentAdultX = startX;
        adultGroup.forEach(adultId => {
            positions[adultId] = { x: currentAdultX, y: yPos };
            currentAdultX += SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP;
        });

        // מיקום הילדים של כל חיבור
        partnerLinks.forEach(link => {
            const u = unions.find(un => un.id === link.unionId);
            if (!u) return;

            const children = getUnionChildren(u.id).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));

            if (children.length > 0) {
                const partners = getUnionPartners(u.id);
                const p1Pos = positions[partners[0]];
                const p2Pos = positions[partners[1]];

                if (p1Pos && p2Pos) {
                    // מרכזים את הילדים מתחת למרכז של שני ההורים שלהם *בלבד* (לא כל האשכול)
                    const unionCenterX = (p1Pos.x + p2Pos.x) / 2;
                    const childrenTotalWidth = children.reduce((sum, c) => sum + nodeWidths[c.id], 0);

                    let childX = unionCenterX - (childrenTotalWidth / 2) + (SPACING.CARD_WIDTH / 2);

                    children.forEach(c => {
                        placeTree(c.id, childX, level + 1);
                        childX += nodeWidths[c.id];
                    });
                }
            }
        });
    };

    // --- הפעלה ראשית ---
    const roots = findAllMainRoots();
    let currentGlobalX = 0;

    roots.forEach(rootId => {
        calculateSubtreeWidth(rootId);
        placeTree(rootId, currentGlobalX, 0);
        currentGlobalX += nodeWidths[rootId] + SPACING.SIBLING_GAP * 2;
    });

    const currentYear = new Date().getFullYear();

    persons.forEach((p) => {
        if (!positions[p.id]) return;

        const myPartnerLinks = getPartnerLinks(p.id);
        const hasActiveSpouse = myPartnerLinks.some(l => {
            const un = unions.find(u => u.id === l.unionId);
            return un && un.status === 'married';
        });

        const parentCount = getChildLink(p.id) ? 2 : 0;
        const isAdult = p.isAlive ? (currentYear - p.birthYear >= 18) : true;
        const buds: BudConfig[] = [];

        if (parentCount < 2) buds.push({ position: Position.Bottom, direction: 'down', actionText: 'הורה' });
        if (!hasActiveSpouse && isAdult) {
            const isMale = p.gender === 'male';
            buds.push({ position: isMale ? Position.Left : Position.Right, direction: isMale ? 'left' : 'right', actionText: 'בן/בת זוג' });
        }

        rfNodes.push({
            id: p.id,
            type: 'familyMember',
            position: positions[p.id],
            width: SPACING.CARD_WIDTH,
            height: SPACING.CARD_HEIGHT,
            draggable: false,
            data: { person: p, isMarried: hasActiveSpouse, parentCount, buds }
        });
    });

    unions.forEach((u) => {
        const partners = getUnionPartners(u.id);
        if (partners.length !== 2) return;

        const p1Node = rfNodes.find(n => n.id === partners[0]);
        const p2Node = rfNodes.find(n => n.id === partners[1]);
        if (!p1Node || !p2Node) return;

        const isDivorced = u.status === 'divorced';
        const children = getUnionChildren(u.id);
        const hasChildren = children.length > 0;

        if (isDivorced && !hasChildren) return;

        const hubPos = calculateHubPosition(p1Node.position, p2Node.position, isDivorced, hasChildren);
        const partnerNames = `${persons.find(p => p.id === partners[0])?.fullName} ו-${persons.find(p => p.id === partners[1])?.fullName}`;

        rfNodes.push({
            id: `union-hub-${u.id}`,
            type: 'union',
            position: { x: hubPos.x - 10, y: hubPos.y - 10 },
            width: 20,
            height: 20,
            draggable: false,
            data: { hasChildren, isDivorced, partnerNames }
        });

        const p1IsRight = p1Node.position.x > p2Node.position.x;

        if (!isDivorced && !hasChildren) {
            rfEdges.push({ id: `e1-${u.id}`, source: partners[0], target: `union-hub-${u.id}`, sourceHandle: p1IsRight ? 'left-out' : 'right-out', targetHandle: p1IsRight ? 'right-target' : 'left-target', type: 'straight' });
            rfEdges.push({ id: `e2-${u.id}`, source: partners[1], target: `union-hub-${u.id}`, sourceHandle: p1IsRight ? 'right-out' : 'left-out', targetHandle: p1IsRight ? 'left-target' : 'right-target', type: 'straight' });
        } else if (!isDivorced && hasChildren) {
            rfEdges.push({ id: `e1-${u.id}`, source: partners[0], target: `union-hub-${u.id}`, sourceHandle: 'bottom-source', targetHandle: p1IsRight ? 'right-target' : 'left-target', type: 'smoothstep' });
            rfEdges.push({ id: `e2-${u.id}`, source: partners[1], target: `union-hub-${u.id}`, sourceHandle: 'bottom-source', targetHandle: p1IsRight ? 'left-target' : 'right-target', type: 'smoothstep' });
        } else if (isDivorced && hasChildren) {
            rfEdges.push({ id: `e1-${u.id}`, source: partners[0], target: `union-hub-${u.id}`, sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight' });
            rfEdges.push({ id: `e2-${u.id}`, source: partners[1], target: `union-hub-${u.id}`, sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'straight' });
        }

        children.forEach((c) => {
            rfEdges.push({ id: `c-${u.id}-${c.id}`, source: `union-hub-${u.id}`, target: c.id, sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'smoothstep' });
        });
    });

    return { nodes: rfNodes, edges: rfEdges };
}