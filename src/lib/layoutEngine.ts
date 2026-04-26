import { Edge, Node } from '@xyflow/react';
import { Person, Union, PersonUnionLink } from './types';
import { SPACING, FAMILY_COLORS } from './layoutConstants';
import {
    getPartnerLinks as _getPartnerLinks,
    getUnionPartners as _getUnionPartners,
    getUnionChildren as _getUnionChildren,
    getParentUnion as _getParentUnion,
    isPolyParent as _isPolyParent,
    calculatePersonWidth as _calculatePersonWidth,
    calculateUnionWidth as _calculateUnionWidth
} from './layoutHelpers';

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

    const boundingBoxes = new Map<string, number>();

    const getPartnerLinks = (pId: string) => _getPartnerLinks(pId, links);
    const getUnionPartners = (uId: string) => _getUnionPartners(uId, links);
    const getUnionChildren = (uId: string) => _getUnionChildren(uId, persons, links);
    const getParentUnion = (pId: string) => _getParentUnion(pId, links);
    const isPolyParent = (pId: string) => _isPolyParent(pId, links);
    const calculatePersonWidth = (pId: string, visited: Set<string>) => _calculatePersonWidth(pId, visited, boundingBoxes, persons, links);
    const calculateUnionWidth = (uId: string, visited: Set<string> = new Set()) => _calculateUnionWidth(uId, visited, boundingBoxes, persons, links);

    // --- PASS 1: Strict Generation Assignment (Y-Axis) ---
    const genLevels: Record<string, number> = {};
    // אתחול דורות: דור מבוגר יקבל מספר נמוך, דורות צעירים יקבלו מספר הולך וגדל (השפעה ישירה על ה-Y)
    persons.forEach(p => { genLevels[p.id] = 0; });

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) { // הגנה מפני לולאות אינסופיות (מעגלים משפחתיים)
        changed = false;
        iterations++;

        // 1. אכיפת היררכיה: ילדים חייבים לקבל Y גדול יותר (דור צעיר יותר) מהוריהם
        links.filter(l => l.role === 'child').forEach(l => {
            const uId = l.unionId;
            const partners = getUnionPartners(uId);
            if (partners.length > 0) {
                const polyPartner = partners.find(p => isPolyParent(p));
                let maxParentGen = Math.max(...partners.map(pId => genLevels[pId] || 0));

                if (polyPartner) {
                    maxParentGen = (genLevels[polyPartner] || 0) + 1;
                }

                if ((genLevels[l.personId] || 0) < maxParentGen + 1) {
                    genLevels[l.personId] = maxParentGen + 1;
                    changed = true;
                }
            }
        });

        // 2. סימטריה זוגית: בני זוג מקבלים את אותו Y (למעט שיטת הממטרה שתטופל בשלבי ה-Pivot)
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

    // פונקציות העזר להמרת "דור" לקואורדינטת Y על המסך
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

                const children = getUnionChildren(uId);
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

    const unionWidths = new Map<string, number>();
    unions.forEach(u => unionWidths.set(u.id, calculateUnionWidth(u.id, new Set())));
    const personWidths = new Map<string, number>();
    persons.forEach(p => personWidths.set(p.id, calculatePersonWidth(p.id, new Set())));

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
                    const uWidth = unionWidths.get(uNode.id) || 0;
                    const shift = Math.max(currentUnionX, getShift(overallContour, res.contour));
                    uNode.relativeX = shift;
                    overallContour = mergeContours(overallContour, res.contour, shift);
                    currentUnionX = shift + uWidth + SPACING.SIBLING_GAP;
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
                const pWidth = personWidths.get(cNode.id) || 0;
                const shift = Math.max(childX, getShift(childrenContour, res.contour));
                cNode.relativeX = shift;
                childrenContour = mergeContours(childrenContour, res.contour, shift);
                childX = shift + pWidth + SPACING.SIBLING_GAP;
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
            const isPoly = getPartnerLinks(node.id).length >= 3;
            const yOffset = isPoly ? -SPACING.LEVEL_Y * 0.5 : 0;
            positions.set(node.id, { x: absoluteX, y: genY(node.id) + yOffset });
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
            } else {
                const uNode = placementNodesMap.get(node.id);
                const isLeftAligned = uNode?.isLeftAligned;

                const hubX = absoluteX;
                const hubCenterX = hubX + 10;
                const partners = getUnionPartners(node.id);
                let hY = unionY(node.id) + SPACING.CARD_HEIGHT / 2 - 10;
                if (isDivorced && hasChildren) hY += SPACING.CARD_HEIGHT + 35;
                hubPositions.set(node.id, { x: hubX, y: hY });

                const offset = (SPACING.CARD_WIDTH + SPACING.MIN_NODE_GAP) / 2;
                const parent1Id = partners.find(pId => !node.spouses?.includes(pId));

                if (parent1Id) {
                    const p1X = isLeftAligned
                        ? hubCenterX + offset - (SPACING.CARD_WIDTH / 2)
                        : hubCenterX - offset - (SPACING.CARD_WIDTH / 2);
                    positions.set(parent1Id, { x: p1X, y: genLevels[parent1Id] * SPACING.LEVEL_Y });
                }

                node.spouses?.forEach(sId => {
                    const sX = isLeftAligned
                        ? hubCenterX - offset - (SPACING.CARD_WIDTH / 2)
                        : hubCenterX + offset - (SPACING.CARD_WIDTH / 2);
                    positions.set(sId, { x: sX, y: genLevels[sId] * SPACING.LEVEL_Y });
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
            // Edge from PolyParent to Spouses
            const polyParentId = Object.keys(genLevels).find(id => getPartnerLinks(id).map(l => l.unionId).includes(u.id) && !uNode.spouses?.includes(id));
            if (polyParentId) {
                uNode.spouses?.forEach(spouseId => {
                    rfEdges.push({
                        id: `edge-${polyParentId}-${spouseId}`,
                        source: polyParentId,
                        target: spouseId,
                        type: 'familyEdge',
                        sourceHandle: 'bottom-source',
                        targetHandle: 'top-target',
                        data: { color, routing: 'smoothstep' },
                        style: { stroke: color, strokeWidth: 3, strokeDasharray: isDivorced ? '5,5' : 'none' }
                    });
                });
            }
            // Edge from Spouses directly to Children
            getUnionChildren(u.id).forEach(c => {
                uNode.spouses?.forEach(spouseId => {
                    rfEdges.push({
                        id: `edge-${spouseId}-${c.id}`,
                        source: spouseId,
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

            rfEdges.push({
                id: `edge-${pId}-${u.id}`,
                source: pId,
                target: `union-hub-${u.id}`,
                type: 'familyEdge',
                sourceHandle: isDivorced ? 'bottom-source' : (isLeft ? 'right-out' : 'left-out'),
                targetHandle: isDivorced ? 'top-target' : (isLeft ? 'left-target' : 'right-target'),
                data: { color, routing: isDivorced ? 'smoothstep' : 'straight' },
                style: { stroke: color, strokeWidth: 3, strokeDasharray: isDivorced ? '5,5' : 'none' }
            });
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