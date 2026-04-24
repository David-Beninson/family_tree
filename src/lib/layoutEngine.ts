import { Edge, Node } from '@xyflow/react';
import { Person, Union, PersonUnionLink } from './types';

export const SPACING = {
    CARD_WIDTH: 280,
    CARD_HEIGHT: 90,
    NODE_PADDING: 20,
    MIN_NODE_GAP: 40,  // Slightly increased for clarity
    SIBLING_GAP: 50,   // Slightly increased for clarity
    LEVEL_Y: 260,      // Increased from 200/240 as requested
    ROOT_Y_START: 0,
};

export const FAMILY_COLORS = [
    '#94a3b8', // Default Slate
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
];

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
    const visitedPersons = new Set<string>();

    const PARTNER_OFFSET = (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP) / 2;
    const COUPLE_WIDTH = (PARTNER_OFFSET * 2) + SPACING.CARD_WIDTH;

    // --- Helpers ---
    const getPartnerLinks = (pId: string) => links.filter(l => l.personId === pId && l.role === 'partner');
    const getUnionPartners = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);
    const getUnionChildren = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'child').map(l => persons.find(p => p.id === l.personId)).filter(Boolean) as Person[];
    const getParentUnion = (pId: string) => links.find(l => l.personId === pId && l.role === 'child')?.unionId;

    // Subtree tracking for shifting
    const subtreeNodes = new Map<string, { persons: Set<string>, unions: Set<string> }>();
    const registerNodeInSubtree = (uId: string, type: 'person' | 'union', id: string) => {
        if (!subtreeNodes.has(uId)) subtreeNodes.set(uId, { persons: new Set(), unions: new Set() });
        const entry = subtreeNodes.get(uId)!;
        if (type === 'person') entry.persons.add(id);
        else entry.unions.add(id);
    };

    const shiftSubtree = (uId: string, deltaX: number, visited = new Set<string>()) => {
        if (visited.has(uId)) return;
        visited.add(uId);

        const entry = subtreeNodes.get(uId);
        if (!entry) return;
        entry.persons.forEach(pId => { if (positions[pId]) positions[pId].x += deltaX; });
        entry.unions.forEach(unId => { if (hubPositions[unId]) hubPositions[unId].x += deltaX; });
        // Recurse to children's subtrees
        getUnionChildren(uId).forEach(child => {
            getPartnerLinks(child.id).forEach(l => shiftSubtree(l.unionId, deltaX, visited));
        });
    };

    // --- PASS 0: Generation Level Pre-Calculation ---
    // We use an iterative approach to ensure that:
    // 1. Children are at least max(parents_gen) + 1
    // 2. Partners in a union are at the SAME level (max of their individual levels)
    const genLevels: Record<string, number> = {};
    persons.forEach(p => genLevels[p.id] = 0);

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
        changed = false;
        iterations++;

        // Rule 1: Children below parents
        links.filter(l => l.role === 'child').forEach(l => {
            const uId = l.unionId;
            const parents = getUnionPartners(uId);
            if (parents.length > 0) {
                const maxParentGen = Math.max(...parents.map(pId => genLevels[pId]));
                if (genLevels[l.personId] < maxParentGen + 1) {
                    genLevels[l.personId] = maxParentGen + 1;
                    changed = true;
                }
            }
        });

        // Rule 2: Partners at the same level
        unions.forEach(u => {
            const partners = getUnionPartners(u.id);
            if (partners.length > 1) {
                const maxPartnerGen = Math.max(...partners.map(pId => genLevels[pId]));
                partners.forEach(pId => {
                    if (genLevels[pId] < maxPartnerGen) {
                        genLevels[pId] = maxPartnerGen;
                        changed = true;
                    }
                });
            }
        });
    }

    // --- PASS 0.5: Traversal Order ---
    // Assign a pre-order index to everyone to decide Left/Right partner order.
    const traversalIndex: Record<string, number> = {};
    let nextIndex = 0;
    const visitedForOrder = new Set<string>();

    const assignOrder = (uId: string) => {
        if (visitedForOrder.has(uId)) return;
        visitedForOrder.add(uId);

        const partners = getUnionPartners(uId).sort((a, b) => a.localeCompare(b));
        partners.forEach(pId => {
            if (traversalIndex[pId] === undefined) traversalIndex[pId] = nextIndex++;
        });

        const children = getUnionChildren(uId).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
        children.forEach(child => {
            if (traversalIndex[child.id] === undefined) traversalIndex[child.id] = nextIndex++;
            getPartnerLinks(child.id).forEach(l => assignOrder(l.unionId));
        });
    };

    // Start traversal from roots
    const rootUnions = unions.filter(u => {
        const partners = getUnionPartners(u.id);
        return partners.every(pId => !getParentUnion(pId));
    });
    rootUnions.forEach(u => assignOrder(u.id));
    // Catch disconnected
    unions.forEach(u => assignOrder(u.id));

    const sortPartners = (pIds: string[]) => {
        return [...pIds].sort((a, b) => (traversalIndex[a] ?? 0) - (traversalIndex[b] ?? 0));
    };

    // Helper: Y coordinate from a person's gen level
    const genY = (pId: string) => genLevels[pId] * SPACING.LEVEL_Y;

    // Helper: Y for a union = max gen level of its partners * LEVEL_Y
    const unionY = (uId: string): number => {
        const partners = getUnionPartners(uId);
        if (partners.length === 0) return 0;
        return Math.max(...partners.map(genY));
    };

    // --- Contour Helpers ---
    // A contour tracks the left and right extents of a subtree at each Y level.
    type Contour = { left: Record<number, number>; right: Record<number, number> };

    const getEmptyContour = (): Contour => ({ left: {}, right: {} });

    const mergeContours = (target: Contour, source: Contour, shift: number) => {
        Object.entries(source.left).forEach(([yStr, x]) => {
            const y = Number(yStr);
            const shiftedX = x + shift;
            if (target.left[y] === undefined || shiftedX < target.left[y]) target.left[y] = shiftedX;
        });
        Object.entries(source.right).forEach(([yStr, x]) => {
            const y = Number(yStr);
            const shiftedX = x + shift;
            if (target.right[y] === undefined || shiftedX > target.right[y]) target.right[y] = shiftedX;
        });
    };

    const getRequiredShift = (target: Contour, source: Contour): number => {
        let maxOverlap = 0;
        const levels = Object.keys(source.left).map(Number);
        levels.forEach(y => {
            if (target.right[y] !== undefined && source.left[y] !== undefined) {
                const overlap = (target.right[y] + SPACING.SIBLING_GAP) - source.left[y];
                if (overlap > maxOverlap) maxOverlap = overlap;
            }
        });
        return maxOverlap;
    };

    // --- PASS 3: Upwards Placement ---
    const placeAncestorUnion = (uId: string, anchorCenterX: number, _Y: number) => {
        if (visitedHubs.has(uId)) return;

        const partners = sortPartners(getUnionPartners(uId));
        if (partners.length < 2) return;

        let pLeftId = partners[0];
        let pRightId = partners[1];

        const existingLeft = positions[pLeftId];
        const existingRight = positions[pRightId];

        let finalHubX = anchorCenterX;
        if (existingLeft && existingRight) {
            finalHubX = (existingLeft.x + existingRight.x) / 2 + (SPACING.CARD_WIDTH / 2);
        } else if (existingLeft) {
            finalHubX = existingLeft.x + PARTNER_OFFSET;
        } else if (existingRight) {
            finalHubX = existingRight.x - PARTNER_OFFSET;
        }

        // Use gen-level based Y for ancestor unions too
        const ancY = unionY(uId);
        visitedHubs.add(uId);
        hubPositions[uId] = { x: finalHubX, y: ancY + (SPACING.CARD_HEIGHT / 2) };

        if (!positions[pLeftId]) {
            positions[pLeftId] = { x: finalHubX - PARTNER_OFFSET, y: genY(pLeftId) };
            visitedPersons.add(pLeftId);
        }
        if (!positions[pRightId]) {
            positions[pRightId] = { x: finalHubX + PARTNER_OFFSET, y: genY(pRightId) };
            visitedPersons.add(pRightId);
        }

        [pLeftId, pRightId].forEach(pId => {
            const parentUId = getParentUnion(pId);
            if (parentUId && !visitedHubs.has(parentUId)) {
                placeAncestorUnion(parentUId, positions[pId].x + (SPACING.CARD_WIDTH / 2), 0);
            }
        });
    };

    // --- PASS 2: Downwards Placement with Anchoring ---
    // Y is now derived from genLevels (Pass 0), not passed as a relative offset.
    const placeUnion = (uId: string, hubX: number, _Y: number, context?: { type: 'pivot' | 'child', sourceId: string, direction?: 1 | -1 }): Contour => {
        // Override Y with the absolute generation-level Y
        const Y = unionY(uId);
        if (visitedHubs.has(uId)) return getEmptyContour();

        const u = unions.find(un => un.id === uId);
        if (!u) return getEmptyContour();

        const partners = sortPartners(getUnionPartners(uId));
        if (partners.length !== 2) return getEmptyContour();

        let pLeftId = partners[0];
        let pRightId = partners[1];

        if (context?.type === 'pivot' && context.direction) {
            // Keep the pivot partner in their requested direction if possible, 
            // but traversalIndex usually handles this naturally.
        }

        const existingLeft = positions[pLeftId];
        const existingRight = positions[pRightId];

        let finalHubX = hubX;

        // Hub Anchoring
        if (existingLeft && existingRight) {
            finalHubX = (existingLeft.x + existingRight.x) / 2 + (SPACING.CARD_WIDTH / 2);
        } else if (existingLeft) {
            finalHubX = context?.direction === 1 ? Math.max(hubX, existingLeft.x + PARTNER_OFFSET) : hubX;
        } else if (existingRight) {
            finalHubX = context?.direction === -1 ? Math.min(hubX, existingRight.x - PARTNER_OFFSET) : hubX;
        }

        visitedHubs.add(uId);
        hubPositions[uId] = { x: finalHubX, y: Y + (SPACING.CARD_HEIGHT / 2) };
        registerNodeInSubtree(uId, 'union', uId);

        if (!existingLeft) {
            positions[pLeftId] = { x: finalHubX - PARTNER_OFFSET, y: genY(pLeftId) };
            visitedPersons.add(pLeftId);
            registerNodeInSubtree(uId, 'person', pLeftId);
        }
        if (!existingRight) {
            positions[pRightId] = { x: finalHubX + PARTNER_OFFSET, y: genY(pRightId) };
            visitedPersons.add(pRightId);
            registerNodeInSubtree(uId, 'person', pRightId);
        }

        const myContour = getEmptyContour();
        // Add partners to contour at their actual Y levels
        [pLeftId, pRightId].forEach(pId => {
            const py = genY(pId);
            const px = positions[pId].x;
            if (myContour.left[py] === undefined || px < myContour.left[py]) myContour.left[py] = px;
            if (myContour.right[py] === undefined || px + SPACING.CARD_WIDTH > myContour.right[py]) myContour.right[py] = px + SPACING.CARD_WIDTH;
        });
        // Add hub level to contour
        if (myContour.left[Y] === undefined || (finalHubX - 10) < myContour.left[Y]) myContour.left[Y] = finalHubX - 10;
        if (myContour.right[Y] === undefined || (finalHubX + 10) > myContour.right[Y]) myContour.right[Y] = finalHubX + 10;

        const handlePivot = (pId: string, isRight: boolean) => {
            const otherUnions = getPartnerLinks(pId).filter(l => l.unionId !== uId);
            const direction = isRight ? 1 : -1;
            let currentHubX = finalHubX + (PARTNER_OFFSET * 2) * direction;

            otherUnions.forEach(link => {
                if (visitedHubs.has(link.unionId)) return;
                const pivotContour = placeUnion(link.unionId, currentHubX, Y, { type: 'pivot', sourceId: pId, direction: direction as 1 | -1 });
                const shift = direction === 1 ? getRequiredShift(myContour, pivotContour) : -getRequiredShift(pivotContour, myContour);
                if (shift !== 0) {
                    shiftSubtree(link.unionId, shift);
                    mergeContours(myContour, pivotContour, shift);
                } else {
                    mergeContours(myContour, pivotContour, 0);
                }
            });
        };

        handlePivot(pLeftId, false);
        handlePivot(pRightId, true);

        const children = getUnionChildren(uId).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
        if (children.length > 0) {
            const childrenEntries: { contour: Contour, id: string, type: 'union' | 'person' }[] = [];
            const packedContours = getEmptyContour();

            children.forEach(child => {
                const childUnions = getPartnerLinks(child.id);
                const childY = genY(child.id);
                const idealChildX = finalHubX - (SPACING.CARD_WIDTH / 2);

                if (childUnions.length > 0 && !visitedHubs.has(childUnions[0].unionId)) {
                    const primaryUnionId = childUnions[0].unionId;
                    const partners = sortPartners(getUnionPartners(primaryUnionId));
                    const isLeftPartner = partners[0] === child.id;
                    
                    // The union hub should be shifted so the CHILD is at idealChildX
                    const idealHubX = isLeftPartner ? (idealChildX + PARTNER_OFFSET) : (idealChildX - PARTNER_OFFSET);
                    
                    const c = placeUnion(primaryUnionId, idealHubX, 0, { type: 'child', sourceId: child.id });
                    const shift = getRequiredShift(packedContours, c);
                    if (shift !== 0) shiftSubtree(primaryUnionId, shift);
                    mergeContours(packedContours, c, shift);
                    childrenEntries.push({ contour: c, id: primaryUnionId, type: 'union' });
                } else if (!visitedPersons.has(child.id)) {
                    const c = getEmptyContour();
                    c.left[childY] = idealChildX;
                    c.right[childY] = idealChildX + SPACING.CARD_WIDTH;
                    
                    const shift = getRequiredShift(packedContours, c);
                    const finalX = idealChildX + shift;
                    positions[child.id] = { x: finalX, y: childY };
                    visitedPersons.add(child.id);
                    registerNodeInSubtree(uId, 'person', child.id);
                    
                    c.left[childY] = finalX;
                    c.right[childY] = finalX + SPACING.CARD_WIDTH;
                    mergeContours(packedContours, c, 0);
                    childrenEntries.push({ contour: c, id: child.id, type: 'person' });
                }
            });

            // Centering children under parent
            const minX = Math.min(...Object.values(packedContours.left));
            const maxX = Math.max(...Object.values(packedContours.right));
            const childrenWidth = maxX - minX;
            const globalShift = finalHubX - (minX + childrenWidth / 2);
            
            if (globalShift !== 0) {
                childrenEntries.forEach(ce => {
                    if (ce.type === 'union') shiftSubtree(ce.id, globalShift);
                    else if (positions[ce.id]) positions[ce.id].x += globalShift;
                });
                mergeContours(myContour, packedContours, globalShift);
            } else {
                mergeContours(myContour, packedContours, 0);
            }
        }

        return myContour;
    };

    // --- EXECUTION ---
    if (focusUnionId) {
        placeUnion(focusUnionId, 0, SPACING.ROOT_Y_START);
    } else {
        const rootUnions = unions.filter(u => {
            const partners = getUnionPartners(u.id);
            return partners.every(pId => !getParentUnion(pId));
        });

        const overallContour = getEmptyContour();

        rootUnions.forEach(u => {
            if (!visitedHubs.has(u.id)) {
                const c = placeUnion(u.id, 0, SPACING.ROOT_Y_START);
                const shift = getRequiredShift(overallContour, c);
                if (shift !== 0) shiftSubtree(u.id, shift);
                mergeContours(overallContour, c, shift);
            }
        });

        // Catch any disconnected unions
        unions.forEach(u => {
            if (!visitedHubs.has(u.id)) {
                const c = placeUnion(u.id, 0, SPACING.ROOT_Y_START);
                const shift = getRequiredShift(overallContour, c);
                if (shift !== 0) shiftSubtree(u.id, shift);
                mergeContours(overallContour, c, shift);
            }
        });
    }

    const getUnionColor = (uId: string) => {
        const index = unions.findIndex(u => u.id === uId);
        return FAMILY_COLORS[(index + 1) % FAMILY_COLORS.length];
    };

    // --- FINAL NODE CONVERSION ---
    persons.forEach(p => {
        if (!positions[p.id]) return;

        const myPartnerLinks = getPartnerLinks(p.id);
        const hasActiveSpouse = myPartnerLinks.some(l => {
            const un = unions.find(u => u.id === l.unionId);
            return un && (un.status === 'married' || un.status === 'partnered');
        });

        const parentUId = getParentUnion(p.id);
        const parentCount = parentUId ? 2 : 0;
        const familyColor = parentUId ? getUnionColor(parentUId) : undefined;

        rfNodes.push({
            id: p.id,
            type: 'familyMember',
            position: { x: positions[p.id].x + SPACING.NODE_PADDING, y: positions[p.id].y },
            width: SPACING.CARD_WIDTH,
            height: SPACING.CARD_HEIGHT,
            draggable: false,
            data: { 
                person: p, 
                isMarried: hasActiveSpouse, 
                parentCount,
                familyColor 
            }
        });
    });

    unions.forEach(u => {
        if (!hubPositions[u.id]) return;
        const partners = sortPartners(getUnionPartners(u.id));
        const children = getUnionChildren(u.id);
        const hasChildren = children.length > 0;
        const isDivorced = u.status === 'divorced';
        const color = getUnionColor(u.id);

        rfNodes.push({
            id: `union-hub-${u.id}`,
            type: 'union',
            position: { x: hubPositions[u.id].x - 10, y: hubPositions[u.id].y },
            width: 20,
            height: 20,
            draggable: false,
            data: { hasChildren, isDivorced, unionId: u.id, color }
        });

        // Edges: Partners to Hub
        partners.forEach((pId, idx) => {
            if (!positions[pId]) return;
            const isLeft = idx === 0;
            
            if (isDivorced) {
                rfEdges.push({
                    id: `edge-${pId}-${u.id}`,
                    source: pId,
                    target: `union-hub-${u.id}`,
                    type: 'familyEdge',
                    sourceHandle: 'bottom-source',
                    targetHandle: 'top-target',
                    data: { color, routing: 'smoothstep' },
                    style: { stroke: color, strokeWidth: 3, strokeDasharray: '5,5' }
                });
            } else {
                rfEdges.push({
                    id: `edge-${pId}-${u.id}`,
                    source: pId,
                    target: `union-hub-${u.id}`,
                    type: 'familyEdge',
                    sourceHandle: isLeft ? 'right-out' : 'left-out',
                    targetHandle: isLeft ? 'left-target' : 'right-target',
                    data: { color, routing: 'straight' },
                    style: { stroke: color, strokeWidth: 3 }
                });
            }
        });

        // Edges: Hub to Children
        children.forEach(child => {
            if (!positions[child.id]) return;
            rfEdges.push({
                id: `edge-hub-${u.id}-${child.id}`,
                source: `union-hub-${u.id}`,
                target: child.id,
                type: 'familyEdge',
                sourceHandle: 'bottom-source',
                targetHandle: 'top-target',
                data: { color, routing: 'smoothstep' },
                style: { stroke: color, strokeWidth: 3 }
            });
        });
    });

    return { nodes: rfNodes, edges: rfEdges };
}