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

    // --- PASS 1: Width Calculation ---
    const calculatePersonWidth = (pId: string): number => {
        if (visitedWidths.has(pId)) return subtreeWidths[pId] || SPACING.CARD_WIDTH;
        visitedWidths.add(pId);

        const myUnions = getPartnerLinks(pId);
        if (myUnions.length === 0) {
            subtreeWidths[pId] = PADDED_CARD_WIDTH;
            return PADDED_CARD_WIDTH;
        }

        let totalWidth = 0;
        myUnions.forEach((link, idx) => {
            const uId = link.unionId;
            const children = getUnionChildren(uId);

            const childrenWidth = children.length === 0 ? 0 :
                children.reduce((sum, c) => sum + calculatePersonWidth(c.id), 0) + (children.length - 1) * SPACING.SIBLING_GAP;

            const unionBaseWidth = (PADDED_CARD_WIDTH * 2) + SPACING.MIN_NODE_GAP;
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
        visitedHubs.add(uId);

        const u = unions.find(un => un.id === uId);
        if (!u) return;

        hubPositions[uId] = { x: anchorCenterX, y: Y + (SPACING.CARD_HEIGHT / 2) };

        const partners = getUnionPartners(uId);
        if (partners.length !== 2) return;

        // Ancestors are always P1=Left, P2=Right unless we have gender logic
        const pLeftId = partners[0];
        const pRightId = partners[1];

        const pLeftX = anchorCenterX - PARTNER_OFFSET;
        const pRightX = anchorCenterX + PARTNER_OFFSET;

        if (!positions[pLeftId]) positions[pLeftId] = { x: pLeftX, y: Y };
        if (!positions[pRightId]) positions[pRightId] = { x: pRightX, y: Y };

        // Recurse up from both parents
        [pLeftId, pRightId].forEach(pId => {
            const parentUId = getParentUnion(pId);
            if (parentUId) {
                const pCenterX = positions[pId].x + CARD_CENTER_OFFSET;
                placeAncestorUnion(parentUId, pCenterX, Y - SPACING.LEVEL_Y);
            }
        });
    };

    // --- PASS 2: Downwards Placement ---
    const placeUnion = (uId: string, hubX: number, Y: number, pIdToPositionAtOffset?: string) => {
        if (visitedHubs.has(uId)) return;
        visitedHubs.add(uId);

        const u = unions.find(un => un.id === uId);
        if (!u) return;

        hubPositions[uId] = { x: hubX, y: Y + (SPACING.CARD_HEIGHT / 2) };

        const partners = getUnionPartners(uId);
        if (partners.length !== 2) return;

        // Identify descendant (Right) vs spouse (Left)
        let pRightId = pIdToPositionAtOffset || partners[1];
        let pLeftId = partners.find(id => id !== pRightId)!;

        // If we didn't have a hint, check lineage
        if (!pIdToPositionAtOffset) {
            const p1HasLineage = !!getParentUnion(partners[0]);
            if (p1HasLineage) {
                pRightId = partners[0];
                pLeftId = partners[1];
            }
        }

        const pLeftX = hubX - PARTNER_OFFSET;
        const pRightX = hubX + PARTNER_OFFSET;

        // Place them (Don't overwrite if already placed by a more primary branch)
        if (!positions[pLeftId]) positions[pLeftId] = { x: pLeftX, y: Y };
        if (!positions[pRightId]) positions[pRightId] = { x: pRightX, y: Y };

        // Handle Pivots (Other Unions)
        const handlePivot = (pId: string, currentX: number, isRight: boolean) => {
            const otherUnions = getPartnerLinks(pId).filter(l => l.unionId !== uId);
            let direction = isRight ? 1 : -1;

            otherUnions.forEach(link => {
                const uOtherId = link.unionId;
                const uOtherWidth = unionWidths[uOtherId] || (PADDED_CARD_WIDTH * 2 + SPACING.MIN_NODE_GAP);
                // Center the other family to the side
                const otherHubX = currentX + CARD_CENTER_OFFSET + direction * (uOtherWidth / 2 + SPACING.MIN_NODE_GAP);
                placeUnion(uOtherId, otherHubX, Y, pId);
            });
        };

        handlePivot(pLeftId, positions[pLeftId].x, false);
        handlePivot(pRightId, positions[pRightId].x, true);

        // Ancestors for both
        [pLeftId, pRightId].forEach(pId => {
            const parentUId = getParentUnion(pId);
            if (parentUId && !visitedHubs.has(parentUId)) {
                const pCenterX = (positions[pId]?.x || 0) + CARD_CENTER_OFFSET;
                placeAncestorUnion(parentUId, pCenterX, Y - SPACING.LEVEL_Y);
            }
        });

        // Place Children
        const children = getUnionChildren(uId).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
        if (children.length > 0) {
            const totalChildrenWidth = children.reduce((sum, c) => sum + (subtreeWidths[c.id] || SPACING.CARD_WIDTH), 0) + (children.length - 1) * SPACING.SIBLING_GAP;
            let currentChildX = hubX - (totalChildrenWidth / 2);

            children.forEach(child => {
                const childUnions = getPartnerLinks(child.id);
                if (childUnions.length > 0) {
                    // Child is a pivot, center their first union under their allocated space
                    const childHubX = currentChildX + (subtreeWidths[child.id] / 2);
                    placeUnion(childUnions[0].unionId, childHubX, Y + SPACING.LEVEL_Y, child.id);
                } else {
                    positions[child.id] = { x: currentChildX, y: Y + SPACING.LEVEL_Y };
                }
                currentChildX += (subtreeWidths[child.id] || PADDED_CARD_WIDTH) + SPACING.SIBLING_GAP;
            });
        }
    };

    // --- EXECUTION ---
    let startUnionId = focusUnionId;
    if (!startUnionId) {
        const potentialRoots = unions.find(u => {
            const partners = getUnionPartners(u.id);
            return partners.some(pId => !getParentUnion(pId));
        });
        startUnionId = potentialRoots?.id || unions[0]?.id;
    }

    if (startUnionId) {
        placeUnion(startUnionId, 0, SPACING.ROOT_Y_START);
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