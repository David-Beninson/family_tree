import { Edge, Node } from '@xyflow/react';
import { Person, Union, PersonUnionLink } from './types';

export const SPACING = {
    CARD_WIDTH: 280,
    CARD_HEIGHT: 90,
    MIN_NODE_GAP: 40,
    SIBLING_GAP: 60,
    LEVEL_Y: 280,
    ROOT_Y_START: 0,
};

export const FAMILY_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#6fff00ff', '#f97316',
    '#06b6d4', '#14b8a6', '#84cc16', '#6366f1',
    '#d946ef', '#f43f5e', '#0ea5e9', '#eab308',
    '#a855f7', '#1d4ed8', '#047857', '#be123c',
    '#fb923c', '#4ade80'
];

export const calculateHubPosition = (p1Pos: { x: number, y: number }, p2Pos: { x: number, y: number }, status: Union['status'], hasChildren: boolean) => {
    const centerX = (p1Pos.x + p2Pos.x) / 2 + (SPACING.CARD_WIDTH / 2);
    let centerY = p1Pos.y + (SPACING.CARD_HEIGHT / 2);
    if (status === 'divorced' && hasChildren) {
        centerY = Math.max(p1Pos.y, p2Pos.y) + SPACING.CARD_HEIGHT + 100;
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
    if (persons.length === 0) return { nodes: rfNodes, edges: rfEdges };

    const positions = new Map<string, { x: number, y: number }>();
    const hubPositions = new Map<string, { x: number, y: number }>();

    const getPartnerLinks = (pId: string) => links.filter(l => l.personId === pId && l.role === 'partner');
    const getUnionPartners = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);
    const getUnionChildren = (uId: string) => links.filter(l => l.unionId === uId && l.role === 'child').map(l => persons.find(p => p.id === l.personId)).filter(Boolean) as Person[];
    const getParentUnion = (pId: string) => links.find(l => l.personId === pId && l.role === 'child')?.unionId;
    const isPolyParent = (pId: string) => getPartnerLinks(pId).length >= 3;

    // --- PASS 1: Strict Generation Assignment (Y-Axis) ---
    const genLevels: Record<string, number> = {};
    persons.forEach(p => genLevels[p.id] = 0);

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
        changed = false;
        iterations++;

        links.filter(l => l.role === 'child').forEach(l => {
            const uId = l.unionId;
            const partners = getUnionPartners(uId);
            if (partners.length > 0) {
                const polyPartner = partners.find(p => isPolyParent(p));
                let maxParentGen = Math.max(...partners.map(pId => genLevels[pId] || 0));

                // If it's a poly union, the spouses are at polyGen + 1. The children drop below the spouses.
                if (polyPartner) {
                    maxParentGen = (genLevels[polyPartner] || 0) + 1;
                }

                if ((genLevels[l.personId] || 0) < maxParentGen + 1) {
                    genLevels[l.personId] = maxParentGen + 1;
                    changed = true;
                }
            }
        });

        unions.forEach(u => {
            const partners = getUnionPartners(u.id);
            if (partners.length > 1) {
                const polyPartner = partners.find(p => isPolyParent(p));
                if (polyPartner) {
                    const polyGen = genLevels[polyPartner] || 0;
                    partners.forEach(pId => {
                        if (pId !== polyPartner && (genLevels[pId] || 0) < polyGen + 1) {
                            genLevels[pId] = polyGen + 1;
                            changed = true;
                        }
                    });
                } else {
                    const maxPartnerGen = Math.max(...partners.map(pId => genLevels[pId] || 0));
                    partners.forEach(pId => {
                        if ((genLevels[pId] || 0) < maxPartnerGen) {
                            genLevels[pId] = maxPartnerGen;
                            changed = true;
                        }
                    });
                }
            }
        });
    }

    const genY = (pId: string) => genLevels[pId] * SPACING.LEVEL_Y;
    const unionY = (uId: string): number => {
        const partners = getUnionPartners(uId);
        return partners.length > 0 ? Math.max(...partners.map(genY)) : 0;
    };

    // --- PASS 2: Bloodline Spanning Tree ---
    interface PlacementNode {
        id: string;
        type: 'person' | 'union';
        children: PlacementNode[];
        spouses?: string[];
        relativeX: number;
        isPoly?: boolean;
        isLeftAligned?: boolean;
    }

    const visitedPersons = new Set<string>();
    const visitedUnions = new Set<string>();
    const placementNodesMap = new Map<string, PlacementNode>();

    // Determine Marriage Hubs
    const marriageBlocks = new Map<string, string>();
    const partnerAdj = new Map<string, string[]>();
    persons.forEach(p => partnerAdj.set(p.id, []));
    unions.forEach(u => {
        const partners = getUnionPartners(u.id);
        if (partners.length === 2) {
            partnerAdj.get(partners[0])!.push(partners[1]);
            partnerAdj.get(partners[1])!.push(partners[0]);
        }
    });

    const visitedForBlock = new Set<string>();
    persons.forEach(p => {
        if (!visitedForBlock.has(p.id)) {
            const comp: string[] = [];
            const q = [p.id];
            visitedForBlock.add(p.id);
            while (q.length > 0) {
                const curr = q.shift()!;
                comp.push(curr);
                partnerAdj.get(curr)!.forEach(n => {
                    if (!visitedForBlock.has(n)) {
                        visitedForBlock.add(n);
                        q.push(n);
                    }
                });
            }

            let hub = comp[0];
            let maxU = getPartnerLinks(hub).length;
            comp.forEach(id => {
                const uCount = getPartnerLinks(id).length;
                if (uCount > maxU) {
                    maxU = uCount;
                    hub = id;
                } else if (uCount === maxU) {
                    if (getParentUnion(id) && !getParentUnion(hub)) hub = id;
                }
            });

            comp.forEach(id => marriageBlocks.set(id, hub));
        }
    });

    const roots = persons.filter(p => !getParentUnion(p.id));
    if (roots.length === 0 && persons.length > 0) roots.push(persons[0]);

    const buildTree = (pId: string): PlacementNode => {
        const hubId = marriageBlocks.get(pId) || pId;
        if (visitedPersons.has(hubId)) return { id: pId, type: 'person', children: [], relativeX: 0 };
        visitedPersons.add(hubId);

        const node: PlacementNode = { id: hubId, type: 'person', children: [], relativeX: 0 };

        const myUnions = getPartnerLinks(hubId).map(l => l.unionId).sort();
        const poly = myUnions.length >= 3;
        const double = myUnions.length === 2;

        myUnions.forEach((uId, idx) => {
            if (!visitedUnions.has(uId)) {
                visitedUnions.add(uId);
                const partners = getUnionPartners(uId);
                const spouses = partners.filter(p => p !== hubId);
                spouses.forEach(s => visitedPersons.add(s));

                const uNode: PlacementNode = { id: uId, type: 'union', children: [], spouses, relativeX: 0, isPoly: poly };
                if (double) uNode.isLeftAligned = (idx === 0);

                placementNodesMap.set(uId, uNode);

                const children = getUnionChildren(uId).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
                children.forEach(c => {
                    const childHub = marriageBlocks.get(c.id) || c.id;
                    if (!visitedPersons.has(childHub)) {
                        uNode.children.push(buildTree(childHub));
                    }
                });

                node.children.push(uNode);
            }
        });
        return node;
    };

    const placementRoots: PlacementNode[] = [];
    roots.sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0)).forEach(r => {
        const hubId = marriageBlocks.get(r.id) || r.id;
        if (!visitedPersons.has(hubId)) {
            placementRoots.push(buildTree(hubId));
        }
    });
    persons.forEach(p => {
        const hubId = marriageBlocks.get(p.id) || p.id;
        if (!visitedPersons.has(hubId)) placementRoots.push(buildTree(hubId));
    });

    // --- PASS 3: Contour-Based Perfect X Calculation ---
    type Contour = Record<number, { left: number, right: number }>;

    const mergeContours = (c1: Contour, c2: Contour, shift: number) => {
        const result: Contour = {};
        const levels = new Set([...Object.keys(c1).map(Number), ...Object.keys(c2).map(Number)]);
        levels.forEach(y => {
            const l1 = c1[y]; const l2 = c2[y];
            result[y] = {
                left: Math.min(l1 ? l1.left : Infinity, l2 ? l2.left + shift : Infinity),
                right: Math.max(l1 ? l1.right : -Infinity, l2 ? l2.right + shift : -Infinity)
            };
        });
        return result;
    };

    const getShift = (leftContour: Contour, rightContour: Contour): number => {
        let maxShift = 0;
        Object.keys(leftContour).map(Number).forEach(y => {
            if (rightContour[y]) {
                const overlap = leftContour[y].right + SPACING.SIBLING_GAP - rightContour[y].left;
                if (overlap > maxShift) maxShift = overlap;
            }
        });
        return maxShift;
    };

    const placeTree = (node: PlacementNode): { contour: Contour } => {
        if (node.type === 'person') {
            const myY = genLevels[node.id];
            if (node.children.length === 0) {
                const c: Contour = {};
                c[myY] = { left: 0, right: SPACING.CARD_WIDTH };
                return { contour: c };
            }

            let overallContour: Contour = {};
            overallContour[myY] = { left: 0, right: SPACING.CARD_WIDTH };

            const isPoly = node.children.length >= 3;
            const isDouble = node.children.length === 2;

            if (isPoly) {
                let childrenContour: Contour = {};
                let childX = 0;

                node.children.forEach(uNode => {
                    const res = placeTree(uNode);
                    const shift = Math.max(childX, getShift(childrenContour, res.contour));
                    uNode.relativeX = shift;
                    childrenContour = mergeContours(childrenContour, res.contour, shift);
                    childX = shift + SPACING.SIBLING_GAP;
                });

                const childrenMinX = Math.min(...Object.keys(childrenContour).map(y => childrenContour[Number(y)].left));
                const childrenMaxX = Math.max(...Object.keys(childrenContour).map(y => childrenContour[Number(y)].right));
                const childrenTotalWidth = childrenMaxX - childrenMinX;

                const idealChildrenStartX = (SPACING.CARD_WIDTH / 2) - childrenTotalWidth / 2 - childrenMinX;

                node.children.forEach(uNode => { uNode.relativeX += idealChildrenStartX; });
                overallContour = mergeContours(overallContour, childrenContour, idealChildrenStartX);
                return { contour: overallContour };

            } else if (isDouble) {
                const uLeft = node.children[0];
                const uRight = node.children[1];

                const resLeft = placeTree(uLeft);
                const resRight = placeTree(uRight);

                const rightShift = SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP;
                uRight.relativeX = rightShift;

                const leftShift = -SPACING.MIN_NODE_GAP - 20; // 20 is hub width
                uLeft.relativeX = leftShift;

                const cRight = mergeContours({}, resRight.contour, rightShift);
                const cLeft = mergeContours({}, resLeft.contour, leftShift);

                let cPerson: Contour = {};
                cPerson[myY] = { left: 0, right: SPACING.CARD_WIDTH };
                const cLeftPerson = mergeContours(cLeft, cPerson, 0);

                const overlap = getShift(cLeftPerson, cRight);
                if (overlap > 0) {
                    const half = overlap / 2;
                    uLeft.relativeX -= half;
                    uRight.relativeX += half;
                    const cR2 = mergeContours({}, resRight.contour, uRight.relativeX);
                    const cL2 = mergeContours({}, resLeft.contour, uLeft.relativeX);
                    overallContour = mergeContours(cL2, cPerson, 0);
                    overallContour = mergeContours(overallContour, cR2, 0);
                } else {
                    overallContour = mergeContours(cLeftPerson, cRight, 0);
                }
                return { contour: overallContour };

            } else {
                let currentUnionX = SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP;
                node.children.forEach(uNode => {
                    const res = placeTree(uNode);
                    const shift = Math.max(currentUnionX, getShift(overallContour, res.contour));
                    uNode.relativeX = shift;
                    overallContour = mergeContours(overallContour, res.contour, shift);
                    currentUnionX = shift + (uNode.spouses?.length || 0) * (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP) + 20 + SPACING.SIBLING_GAP;
                });
                return { contour: overallContour };
            }
        } else {
            // UNION
            const myY = Math.max(...getUnionPartners(node.id).map(p => genLevels[p] || 0));
            const spouseCount = node.spouses?.length || 0;
            const hubWidth = 20;

            let myContour: Contour = {};
            if (node.isPoly) {
                const topWidth = spouseCount * SPACING.CARD_WIDTH + Math.max(0, spouseCount - 1) * SPACING.MIN_NODE_GAP;
                myContour[myY] = { left: 0, right: topWidth };
            } else if (node.isLeftAligned) {
                const topWidth = spouseCount * (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP);
                myContour[myY] = { left: -topWidth, right: hubWidth };
            } else {
                const topWidth = hubWidth + spouseCount * (SPACING.MIN_NODE_GAP + SPACING.CARD_WIDTH);
                myContour[myY] = { left: 0, right: topWidth };
            }

            if (node.children.length === 0) return { contour: myContour };

            let childrenContour: Contour = {};
            let childX = 0;
            node.children.forEach(cNode => {
                const res = placeTree(cNode);
                const shift = Math.max(childX, getShift(childrenContour, res.contour));
                cNode.relativeX = shift;
                childrenContour = mergeContours(childrenContour, res.contour, shift);
                childX = shift + SPACING.SIBLING_GAP;
            });

            const childrenMinX = Math.min(...Object.keys(childrenContour).map(y => childrenContour[Number(y)].left));
            const childrenMaxX = Math.max(...Object.keys(childrenContour).map(y => childrenContour[Number(y)].right));
            const childrenTotalWidth = childrenMaxX - childrenMinX;

            let idealChildrenStartX = 0;
            if (node.isPoly) {
                const topWidth = spouseCount * SPACING.CARD_WIDTH + Math.max(0, spouseCount - 1) * SPACING.MIN_NODE_GAP;
                idealChildrenStartX = topWidth / 2 - childrenTotalWidth / 2 - childrenMinX;
            } else {
                idealChildrenStartX = 10 - childrenTotalWidth / 2 - childrenMinX;
            }

            node.children.forEach(cNode => cNode.relativeX += idealChildrenStartX);
            return { contour: mergeContours(myContour, childrenContour, idealChildrenStartX) };
        }
    };

    let globalContour: Contour = {};
    let globalX = 0;
    placementRoots.forEach(r => {
        const res = placeTree(r);
        const shift = Math.max(globalX, getShift(globalContour, res.contour));
        r.relativeX = shift;
        globalContour = mergeContours(globalContour, res.contour, shift);
        globalX = shift + SPACING.CARD_WIDTH + SPACING.SIBLING_GAP;
    });

    // --- PASS 4: Absolute Coordinates Extraction ---
    const assignAbsolute = (node: PlacementNode, absoluteX: number) => {
        if (node.type === 'person') {
            positions.set(node.id, { x: absoluteX, y: genY(node.id) });
            node.children.forEach(uNode => assignAbsolute(uNode, absoluteX + uNode.relativeX));
        } else {
            const u = unions.find(un => un.id === node.id);
            const isDivorced = u?.status === 'divorced';
            const hasChildren = node.children.length > 0;

            if (node.isPoly) {
                let spouseX = absoluteX;
                node.spouses?.forEach(sId => {
                    positions.set(sId, { x: spouseX, y: genLevels[sId] * SPACING.LEVEL_Y });
                    spouseX += SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP;
                });
            } else if (node.isLeftAligned) {
                let hY = unionY(node.id) + SPACING.CARD_HEIGHT / 2 - 10;
                if (isDivorced && hasChildren) hY += SPACING.CARD_HEIGHT + 35;
                hubPositions.set(node.id, { x: absoluteX, y: hY });

                let spouseX = absoluteX - SPACING.MIN_NODE_GAP - SPACING.CARD_WIDTH;
                [...(node.spouses || [])].reverse().forEach(sId => {
                    positions.set(sId, { x: spouseX, y: genLevels[sId] * SPACING.LEVEL_Y });
                    spouseX -= SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP;
                });
            } else {
                let hY = unionY(node.id) + SPACING.CARD_HEIGHT / 2 - 10;
                if (isDivorced && hasChildren) hY += SPACING.CARD_HEIGHT + 35;
                hubPositions.set(node.id, { x: absoluteX, y: hY });

                let spouseX = absoluteX + 20 + SPACING.MIN_NODE_GAP;
                node.spouses?.forEach(sId => {
                    positions.set(sId, { x: spouseX, y: genLevels[sId] * SPACING.LEVEL_Y });
                    spouseX += SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP;
                });
            }

            node.children.forEach(cNode => assignAbsolute(cNode, absoluteX + cNode.relativeX));
        }
    };

    placementRoots.forEach(r => assignAbsolute(r, r.relativeX));

    // --- FINAL NODE CONVERSION ---
    const getUnionColor = (uId: string) => {
        const index = unions.findIndex(u => u.id === uId);
        return FAMILY_COLORS[(index + 1) % FAMILY_COLORS.length] || '#94a3b8';
    };

    persons.forEach(p => {
        const pos = positions.get(p.id);
        if (!pos) return;

        const myPartnerLinks = getPartnerLinks(p.id);
        const hasActiveSpouse = myPartnerLinks.some(l => {
            const un = unions.find(u => u.id === l.unionId);
            if (!un || (un.status !== 'married' && un.status !== 'partnered')) return false;
            // Check if union actually has a second partner
            const partners = getUnionPartners(un.id);
            return partners.length > 1;
        });

        const parentUId = getParentUnion(p.id);
        const familyColor = parentUId ? getUnionColor(parentUId) : undefined;

        rfNodes.push({
            id: p.id,
            type: 'familyMember',
            position: { x: pos.x, y: pos.y },
            width: SPACING.CARD_WIDTH,
            height: SPACING.CARD_HEIGHT,
            draggable: false,
            data: {
                person: p,
                isMarried: hasActiveSpouse,
                parentCount: parentUId ? 2 : 0,
                familyColor
            }
        });
    });

    unions.forEach(u => {
        const uNode = placementNodesMap.get(u.id);
        if (uNode?.isPoly) return; // Skip Hub for poly unions

        const pos = hubPositions.get(u.id);
        if (!pos) return;

        const children = getUnionChildren(u.id);
        rfNodes.push({
            id: `union-hub-${u.id}`,
            type: 'union',
            position: { x: pos.x, y: pos.y },
            width: 20,
            height: 20,
            draggable: false,
            data: {
                hasChildren: children.length > 0,
                isDivorced: u.status === 'divorced',
                unionId: u.id,
                color: getUnionColor(u.id)
            }
        });
    });

    // --- FINAL EDGE CONVERSION ---
    unions.forEach(u => {
        const uNode = placementNodesMap.get(u.id);
        const color = getUnionColor(u.id);
        const isDivorced = u.status === 'divorced';

        if (uNode?.isPoly) {
            // Edge from PolyParent to Wives
            const husbandId = Object.keys(genLevels).find(id => getPartnerLinks(id).map(l => l.unionId).includes(u.id) && !uNode.spouses?.includes(id));
            if (husbandId) {
                uNode.spouses?.forEach(wifeId => {
                    rfEdges.push({
                        id: `edge-${husbandId}-${wifeId}`,
                        source: husbandId,
                        target: wifeId,
                        type: 'familyEdge',
                        sourceHandle: 'bottom-source',
                        targetHandle: 'top-target',
                        data: { color, routing: 'smoothstep' },
                        style: { stroke: color, strokeWidth: 3, strokeDasharray: isDivorced ? '5,5' : 'none' }
                    });
                });
            }
            // Edge from Wives directly to Children
            getUnionChildren(u.id).forEach(c => {
                uNode.spouses?.forEach(wifeId => {
                    rfEdges.push({
                        id: `edge-${wifeId}-${c.id}`,
                        source: wifeId,
                        target: c.id,
                        type: 'familyEdge',
                        sourceHandle: 'bottom-source',
                        targetHandle: 'top-target',
                        data: { color, routing: 'smoothstep' },
                        style: { stroke: color, strokeWidth: 3 }
                    });
                });
            });
            return;
        }

        const hPos = hubPositions.get(u.id);
        if (!hPos) return;
        const hubCenterX = hPos.x + 10;
        const partners = getUnionPartners(u.id);
        const children = getUnionChildren(u.id);

        partners.forEach((pId) => {
            const pPos = positions.get(pId);
            if (!pPos) return;

            const isLeft = (pPos.x + SPACING.CARD_WIDTH / 2) < hubCenterX;

            if (isDivorced) {
                rfEdges.push({
                    id: `edge-${pId}-${u.id}`,
                    source: pId,
                    target: `union-hub-${u.id}`,
                    type: 'familyEdge',
                    sourceHandle: 'bottom-source',
                    targetHandle: 'top-target',
                    data: { color, routing: 'straight' },
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

        children.forEach(c => {
            if (!positions.has(c.id)) return;
            rfEdges.push({
                id: `edge-hub-${u.id}-${c.id}`,
                source: `union-hub-${u.id}`,
                target: c.id,
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