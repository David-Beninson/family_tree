'use client';

import { create } from 'zustand';
// 💡 הוספנו את Position לייבוא מ-xyflow!
import { Edge, Node, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, Position } from '@xyflow/react';
// 💡 הוספנו את BudConfig לייבוא מהטייפים!
import { Person, Union, BudConfig } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. הגדרות מרווחים (Spacing Configuration)
// ═══════════════════════════════════════════════════════════════════════════════
export const SPACING = {
  CARD_WIDTH: 320,
  CARD_HEIGHT: 105,
  CARD_MARGIN: 40,
  LEVEL_Y: -350,
  PARTNERS_X: 460,
  SIBLING_GAP: 150,
  ROOT_Y_START: -650,
};

// רוחב אפקטיבי – כרטיס + מרווח מוגן מכל צד
const EFFECTIVE_W = SPACING.CARD_WIDTH + 2 * SPACING.CARD_MARGIN;

const generateMockData = () => {
  const persons: Person[] = [
    { id: 'gpa', fullName: 'אריה אברהם', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'gma', fullName: 'מיכל אברהם', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'son1', fullName: 'עומר אברהם', birthYear: 1975, isAlive: true, gender: 'male', parentUnionId: 'u1' },
    { id: 'daughter1', fullName: 'שירה אברהם', birthYear: 1980, deathYear: 2023, isAlive: false, gender: 'female', parentUnionId: 'u1' },
    { id: 'son2_divorced', fullName: 'יוסי אברהם', birthYear: 1982, isAlive: true, gender: 'male', parentUnionId: 'u1' },
    { id: 'son1_wife', fullName: 'נועה לוי', birthYear: 1978, isAlive: true, gender: 'female', parentUnionId: 'u_noa_parents' },
    { id: 'noa_father', fullName: 'יצחק לוי', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'noa_mother', fullName: 'שרה לוי', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'son2_ex', fullName: 'דנה שמש', birthYear: 1984, isAlive: true, gender: 'female' },
    { id: 'son2_wife2', fullName: 'מאיה לוי', birthYear: 1985, isAlive: true, gender: 'female' },
    { id: 'gs1', fullName: 'אורי אברהם', birthYear: 2005, isAlive: true, gender: 'male', parentUnionId: 'u2' },
    { id: 'gs2', fullName: 'יעל אברהם', birthYear: 2010, isAlive: true, gender: 'female', parentUnionId: 'u2' },
    { id: 'gs3', fullName: 'דן אברהם', birthYear: 2008, isAlive: true, gender: 'male', parentUnionId: 'u3' },
    { id: 'gd1', fullName: 'נועה אברהם', birthYear: 2012, isAlive: true, gender: 'female', parentUnionId: 'u3' },
    { id: 'gs3_wife', fullName: 'רוני כהן', birthYear: 2009, isAlive: true, gender: 'female' },
    { id: 'gs1_ex', fullName: 'עדי כהן', birthYear: 2006, isAlive: true, gender: 'female' },
    { id: 'ggs1', fullName: 'נועם אברהם', birthYear: 2024, isAlive: true, gender: 'male', parentUnionId: 'u5' },
  ];
  const unions: Union[] = [
    { id: 'u1', partner1Id: 'gpa', partner2Id: 'gma', status: 'married' },
    { id: 'u2', partner1Id: 'son1', partner2Id: 'son1_wife', status: 'married' },
    { id: 'u3', partner1Id: 'son2_divorced', partner2Id: 'son2_ex', status: 'divorced' },
    { id: 'u_noa_parents', partner1Id: 'noa_father', partner2Id: 'noa_mother', status: 'married' },
    { id: 'u6', partner1Id: 'son2_divorced', partner2Id: 'son2_wife2', status: 'married' },
    { id: 'u4', partner1Id: 'gs3', partner2Id: 'gs3_wife', status: 'married' },
    { id: 'u5', partner1Id: 'gs1', partner2Id: 'gs1_ex', status: 'divorced' },
  ];
  return { persons, unions };
};

// פונקציית עזר לחישוב מיקום ה-Hub
const calculateHubPosition = (p1Pos: { x: number, y: number }, p2Pos: { x: number, y: number }, isDivorced: boolean, hasChildren: boolean) => {
  const centerX = (p1Pos.x + p2Pos.x) / 2 + (SPACING.CARD_WIDTH / 2);
  let centerY = Math.min(p1Pos.y, p2Pos.y) + 45;
  if (isDivorced || hasChildren) centerY = Math.min(p1Pos.y, p2Pos.y) - 70;
  return { x: centerX, y: centerY };
};

// ═══════════════════════════════════════════════════════════════════════════════
// Multi-Root Dynamic Layout Engine
// ═══════════════════════════════════════════════════════════════════════════════

function buildInitialGraph(persons: Person[], unions: Union[]) {
  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];
  const positions: Record<string, { x: number, y: number }> = {};
  const subtreeWidths: Record<string, number> = {};

  // ─── Phase 1: Find all root clusters ───
  // A "root" is a person with no parentUnionId who participates in at least one union.
  // We pick one person per root-couple (the male, by convention).
  const findAllRoots = (): string[] => {
    const roots: string[] = [];
    const visited = new Set<string>();

    persons.forEach(p => {
      if (p.parentUnionId || visited.has(p.id)) return;
      const hasUnion = unions.some(u => u.partner1Id === p.id || u.partner2Id === p.id);
      if (!hasUnion) return;

      // Find partner(s) and mark them visited so we don't add both
      const pUnions = unions.filter(u => u.partner1Id === p.id || u.partner2Id === p.id);
      pUnions.forEach(u => {
        const partnerId = u.partner1Id === p.id ? u.partner2Id : u.partner1Id;
        const partner = persons.find(pp => pp.id === partnerId);
        if (partner && !partner.parentUnionId) {
          visited.add(partnerId);
        }
      });

      visited.add(p.id);
      roots.push(p.id);
    });

    return roots;
  };

  // ─── Phase 2: Calculate widths (recursive, per-person) ───
  const calculateWidth = (pId: string): number => {
    if (subtreeWidths[pId] !== undefined) return subtreeWidths[pId];

    const pUnions = unions.filter(u => u.partner1Id === pId || u.partner2Id === pId);

    if (pUnions.length === 0) {
      subtreeWidths[pId] = EFFECTIVE_W;
      return EFFECTIVE_W;
    }

    // Count partners per side to calculate the "pair footprint"
    let leftPartners = 0;
    let rightPartners = 0;
    pUnions.forEach(u => {
      const partner = persons.find(p => p.id === (u.partner1Id === pId ? u.partner2Id : u.partner1Id));
      const isCurrentSpouse = u.status === 'married';
      const side = (partner?.gender === 'female' ? (isCurrentSpouse ? -1 : 1) : (isCurrentSpouse ? 1 : -1));
      if (side === -1) leftPartners++; else rightPartners++;
    });

    const leftEdge = leftPartners > 0 ? (SPACING.PARTNERS_X + (leftPartners - 1) * EFFECTIVE_W) : 0;
    const rightEdge = rightPartners > 0 ? (SPACING.PARTNERS_X + (rightPartners - 1) * EFFECTIVE_W) : 0;
    const partnersWidth = leftEdge + rightEdge + EFFECTIVE_W;

    // Calculate children width across all unions
    let totalChildrenW = 0;
    let childCount = 0;
    pUnions.forEach(u => {
      const children = persons.filter(p => p.parentUnionId === u.id);
      children.forEach(c => {
        totalChildrenW += calculateWidth(c.id);
        childCount++;
      });
    });
    if (childCount > 1) totalChildrenW += (childCount - 1) * SPACING.SIBLING_GAP;

    const finalW = Math.max(partnersWidth, totalChildrenW);
    subtreeWidths[pId] = finalW;
    return finalW;
  };

  // ─── Phase 3: Place members (recursive, per-cluster) ───
  const placeMember = (pId: string, centerX: number, level: number) => {
    if (positions[pId]) return; // Already placed (e.g., spouse placed by another cluster)

    const pUnions = unions.filter(u => u.partner1Id === pId || u.partner2Id === pId);
    const yPos = SPACING.ROOT_Y_START + level * SPACING.LEVEL_Y;

    // Case: single person (no unions)
    if (pUnions.length === 0) {
      positions[pId] = { x: centerX - (SPACING.CARD_WIDTH / 2), y: yPos };
      return;
    }

    // Calculate balance shift for multiple partners
    let leftCount = 0;
    let rightCount = 0;
    const sortedUnions = [...pUnions].sort((a, b) => (a.status === 'married' ? 1 : -1));

    const unionDetails = sortedUnions.map(u => {
      const partner = persons.find(p => p.id === (u.partner1Id === pId ? u.partner2Id : u.partner1Id));
      const isCurrentSpouse = u.status === 'married';
      const side = (partner?.gender === 'female' ? (isCurrentSpouse ? -1 : 1) : (isCurrentSpouse ? 1 : -1));
      const indexInSide = side === -1 ? leftCount++ : rightCount++;
      const xOffset = side * (SPACING.PARTNERS_X + (indexInSide * EFFECTIVE_W));
      return { u, partnerId: partner?.id, xOffset };
    });

    const maxLeft = leftCount > 0 ? (SPACING.PARTNERS_X + (leftCount - 1) * EFFECTIVE_W) : 0;
    const maxRight = rightCount > 0 ? (SPACING.PARTNERS_X + (rightCount - 1) * EFFECTIVE_W) : 0;
    const balanceShift = (maxRight - maxLeft) / 2;

    const personX = centerX - balanceShift;
    positions[pId] = { x: personX - (SPACING.CARD_WIDTH / 2), y: yPos };

    // Place partners and their children
    unionDetails.forEach(({ u, partnerId, xOffset }) => {
      if (partnerId && !positions[partnerId]) {
        positions[partnerId] = { x: personX + xOffset - (SPACING.CARD_WIDTH / 2), y: yPos };
      }

      const children = persons.filter(p => p.parentUnionId === u.id).sort((a, b) => a.birthYear - b.birthYear);
      if (children.length > 0) {
        let totalChildrenW = children.reduce((sum, c, i) =>
          sum + (subtreeWidths[c.id] || EFFECTIVE_W) + (i < children.length - 1 ? SPACING.SIBLING_GAP : 0), 0);

        const unionCenterX = personX + (xOffset / 2);
        let currentChildX = unionCenterX + (totalChildrenW / 2);

        children.forEach(c => {
          const childW = subtreeWidths[c.id] || EFFECTIVE_W;
          placeMember(c.id, currentChildX - (childW / 2), level + 1);
          currentChildX -= (childW + SPACING.SIBLING_GAP);
        });
      }
    });
  };

  // ─── Phase 4: Find cross-cluster anchors & stitch ───
  // An anchor is a union where p1 belongs to cluster A and p2 belongs to cluster B.
  // We find the "shared person" (a child who is placed by cluster A but whose parents are in cluster B).
  const stitchClusters = (primaryRootId: string, allRoots: string[]) => {
    const placedByPrimary = new Set(Object.keys(positions));

    allRoots.forEach(rootId => {
      if (rootId === primaryRootId) return;

      // Find the anchor: a person in this cluster who is ALSO a spouse of someone in the primary cluster
      let anchorPersonId: string | null = null;
      let anchorPartnerPos: { x: number, y: number } | null = null;
      let anchorUnion: Union | null = null;

      // Walk down from this root to find a descendant who is a spouse in the primary tree
      const findAnchorInCluster = (pId: string): boolean => {
        const pUnions = unions.filter(u => u.partner1Id === pId || u.partner2Id === pId);
        for (const u of pUnions) {
          const partnerId = u.partner1Id === pId ? u.partner2Id : u.partner1Id;
          // Check if this partner was placed by the primary cluster
          if (placedByPrimary.has(partnerId)) {
            anchorPersonId = pId;
            anchorPartnerPos = positions[partnerId];
            anchorUnion = u;
            return true;
          }
          // Otherwise, recurse into children
          const children = persons.filter(p => p.parentUnionId === u.id);
          for (const c of children) {
            if (findAnchorInCluster(c.id)) return true;
          }
        }
        return false;
      };

      // Also check: the root's children might be the spouse
      findAnchorInCluster(rootId);

      if (!anchorPersonId || !anchorPartnerPos || !anchorUnion) {
        // No anchor found – place independently with offset to the right
        const existingMaxX = Math.max(...Object.values(positions).map(p => p.x), 0);
        calculateWidth(rootId);
        placeMember(rootId, existingMaxX + EFFECTIVE_W * 3, 0);
        return;
      }

      // Build the secondary cluster at origin (0,0)
      const secondaryPositions: Record<string, { x: number, y: number }> = {};
      const origPositions = { ...positions }; // Snapshot before we add secondary

      // Temporarily use a separate positions map for this cluster
      const savedPositions = { ...positions };

      // Clear positions of secondary people to force fresh calculation
      // (the anchor person might already be placed by primary - we need to recalculate)
      calculateWidth(rootId);

      // Place secondary cluster at origin
      const tempPositions: Record<string, { x: number, y: number }> = {};
      const placeMemberTemp = (pId: string, centerX: number, level: number) => {
        if (tempPositions[pId]) return;
        const pUnions2 = unions.filter(u => u.partner1Id === pId || u.partner2Id === pId);
        const yPos = SPACING.ROOT_Y_START + level * SPACING.LEVEL_Y;

        if (pUnions2.length === 0) {
          tempPositions[pId] = { x: centerX - (SPACING.CARD_WIDTH / 2), y: yPos };
          return;
        }

        let lc = 0, rc = 0;
        const sorted = [...pUnions2].sort((a, b) => (a.status === 'married' ? 1 : -1));
        const details = sorted.map(u => {
          const partner = persons.find(p => p.id === (u.partner1Id === pId ? u.partner2Id : u.partner1Id));
          const isCurr = u.status === 'married';
          const side = (partner?.gender === 'female' ? (isCurr ? -1 : 1) : (isCurr ? 1 : -1));
          const idx = side === -1 ? lc++ : rc++;
          const xOff = side * (SPACING.PARTNERS_X + (idx * EFFECTIVE_W));
          return { u, partnerId: partner?.id, xOff };
        });

        const mxL = lc > 0 ? (SPACING.PARTNERS_X + (lc - 1) * EFFECTIVE_W) : 0;
        const mxR = rc > 0 ? (SPACING.PARTNERS_X + (rc - 1) * EFFECTIVE_W) : 0;
        const bShift = (mxR - mxL) / 2;
        const pX = centerX - bShift;
        tempPositions[pId] = { x: pX - (SPACING.CARD_WIDTH / 2), y: yPos };

        details.forEach(({ u, partnerId, xOff }) => {
          if (partnerId && !tempPositions[partnerId]) {
            tempPositions[partnerId] = { x: pX + xOff - (SPACING.CARD_WIDTH / 2), y: yPos };
          }
          const children2 = persons.filter(p => p.parentUnionId === u.id).sort((a, b) => a.birthYear - b.birthYear);
          if (children2.length > 0) {
            let tCW = children2.reduce((s, c, i) => s + (subtreeWidths[c.id] || EFFECTIVE_W) + (i < children2.length - 1 ? SPACING.SIBLING_GAP : 0), 0);
            const uCX = pX + (xOff / 2);
            let cX = uCX + (tCW / 2);
            children2.forEach(c => {
              const cW = subtreeWidths[c.id] || EFFECTIVE_W;
              placeMemberTemp(c.id, cX - (cW / 2), level + 1);
              cX -= (cW + SPACING.SIBLING_GAP);
            });
          }
        });
      };

      placeMemberTemp(rootId, 0, 0);

      // Now calculate the offset: where should the anchor person be?
      const anchorTempPos = tempPositions[anchorPersonId];
      if (!anchorTempPos) return;

      // The anchor person should be next to their partner in the primary tree
      const partnerPerson = persons.find(p => p.id === (anchorUnion!.partner1Id === anchorPersonId ? anchorUnion!.partner2Id : anchorUnion!.partner1Id));
      const anchorIsSpouseOfMale = partnerPerson?.gender === 'male';
      const anchorTargetX = anchorIsSpouseOfMale
        ? anchorPartnerPos.x - SPACING.PARTNERS_X  // Female spouse goes to the left of male
        : anchorPartnerPos.x + SPACING.PARTNERS_X; // Male spouse goes to the right of female
      const anchorTargetY = anchorPartnerPos.y; // Same level as partner

      const offsetX = anchorTargetX - anchorTempPos.x;
      const offsetY = anchorTargetY - anchorTempPos.y;

      // Apply offset to all secondary positions
      Object.entries(tempPositions).forEach(([personId, pos]) => {
        const shiftedPos = { x: pos.x + offsetX, y: pos.y + offsetY };

        // Collision detection: check against all existing positions
        let collisionShiftX = 0;
        const SAFE_DISTANCE = EFFECTIVE_W;

        Object.values(positions).forEach(existingPos => {
          if (Math.abs(shiftedPos.y - existingPos.y) < SPACING.CARD_HEIGHT + SPACING.CARD_MARGIN) {
            // Same row – check horizontal overlap
            const dist = Math.abs(shiftedPos.x + collisionShiftX - existingPos.x);
            if (dist < SAFE_DISTANCE && personId !== anchorPersonId) {
              // Push further away
              const pushDir = (shiftedPos.x + collisionShiftX > existingPos.x) ? 1 : -1;
              collisionShiftX += pushDir * (SAFE_DISTANCE - dist + SPACING.CARD_MARGIN);
            }
          }
        });

        // Only update if not already placed by primary cluster
        if (!positions[personId] || personId === anchorPersonId) {
          positions[personId] = { x: shiftedPos.x + collisionShiftX, y: shiftedPos.y };
        }
      });
    });
  };

  // ─── Execute the engine ───
  const allRoots = findAllRoots();

  // Pick the primary root (first one found, typically the "main" family)
  const primaryRootId = allRoots[0];
  if (primaryRootId) {
    calculateWidth(primaryRootId);
    placeMember(primaryRootId, 0, 0);
  }

  // Stitch secondary clusters
  if (allRoots.length > 1) {
    stitchClusters(primaryRootId, allRoots);
  }

  // Place any remaining persons that weren't reached (orphans)
  persons.forEach(p => {
    if (!positions[p.id]) {
      const existingMaxX = Object.values(positions).length > 0
        ? Math.max(...Object.values(positions).map(pos => pos.x)) + EFFECTIVE_W * 2
        : 0;
      positions[p.id] = { x: existingMaxX, y: SPACING.ROOT_Y_START };
    }
  });

  // ─── Global Collision Resolution ───
  // Groups all cards by their Y-level (row), sorts by X, and pushes overlapping cards apart.
  // Runs iteratively until no collisions remain.
  const resolveCollisions = () => {
    const MIN_DIST = EFFECTIVE_W; // Minimum horizontal distance between card left-edges
    let maxIterations = 10;

    while (maxIterations-- > 0) {
      let hadCollision = false;

      // Group positions by Y-level (cards on the same row)
      const rows: Record<number, string[]> = {};
      Object.entries(positions).forEach(([id, pos]) => {
        // Round Y to group cards on approximately the same level
        const rowKey = Math.round(pos.y / 50) * 50;
        if (!rows[rowKey]) rows[rowKey] = [];
        rows[rowKey].push(id);
      });

      // For each row, sort by X and push apart if too close
      Object.values(rows).forEach(ids => {
        if (ids.length < 2) return;

        // Sort by X position (left to right)
        ids.sort((a, b) => positions[a].x - positions[b].x);

        for (let i = 0; i < ids.length - 1; i++) {
          const currentX = positions[ids[i]].x;
          const nextX = positions[ids[i + 1]].x;
          const gap = nextX - currentX;

          if (gap < MIN_DIST) {
            // Push the right card further right
            const pushAmount = MIN_DIST - gap;
            // Push all cards from i+1 onwards to prevent chain collisions
            for (let j = i + 1; j < ids.length; j++) {
              positions[ids[j]].x += pushAmount;
            }
            hadCollision = true;
          }
        }
      });

      if (!hadCollision) break;
    }
  };

  resolveCollisions();

  const treeMass = persons.length;
  const currentYear = new Date().getFullYear();

  // 1. כרטיסיות אנשים ופיטמים
  persons.forEach((p) => {
    // בודק האם יש לו כרגע בן/בת זוג פעילים (נשוי)
    const hasActiveSpouse = unions.some(u => (u.partner1Id === p.id || u.partner2Id === p.id) && u.status === 'married');
    // 💡 בדיקה חדשה: האם הוא גרוש?
    const isDivorced = unions.some(u => (u.partner1Id === p.id || u.partner2Id === p.id) && u.status === 'divorced');

    const parentCount = p.parentUnionId ? 2 : 0;
    const isAdult = p.isAlive ? (currentYear - p.birthYear >= 18) : true;
    const buds: BudConfig[] = [];

    // ניצן להוספת הורים (למעלה)
    if (parentCount < 2) buds.push({ position: Position.Bottom, direction: 'down', actionText: 'הורה' });

    // ניצן להוספת בן/בת זוג
    // לוגיקת פיטמים חכמה לפי סטטוס
    if (!hasActiveSpouse && isAdult) {
      // ניצן להוספת בן/בת זוג: משמאל לגבר ומימין לאישה
      const isMale = p.gender === 'male';
      buds.push({
        position: isMale ? Position.Left : Position.Right,
        direction: isMale ? 'left' : 'right',
        actionText: 'בן/בת זוג'
      });
    }

    rfNodes.push({
      id: p.id, type: 'familyMember', position: positions[p.id] || { x: 0, y: 0 },
      width: SPACING.CARD_WIDTH, height: SPACING.CARD_HEIGHT,
      draggable: false,
      data: { person: p, isMarried: hasActiveSpouse, parentCount, buds }
    });
  });

  // 2. צמתי החיבור וענפים
  unions.forEach((u) => {
    const p1Node = rfNodes.find(n => n.id === u.partner1Id);
    const p2Node = rfNodes.find(n => n.id === u.partner2Id);
    if (!p1Node || !p2Node) return;

    const isDivorced = u.status === 'divorced';
    const children = persons.filter(p => p.parentUnionId === u.id);
    const hubPos = calculateHubPosition(p1Node.position, p2Node.position, isDivorced, children.length > 0);

    rfNodes.push({
      id: `union-hub-${u.id}`, type: 'union', position: { x: hubPos.x - 10, y: hubPos.y - 10 },
      width: 20, height: 20, draggable: false,
      data: { hasChildren: children.length > 0, isDivorced, partnerNames: `${persons.find(p => p.id === u.partner1Id)?.fullName} ו-${persons.find(p => p.id === u.partner2Id)?.fullName}` }
    });

    const p1Gender = persons.find(p => p.id === u.partner1Id)?.gender;
    const p2Gender = persons.find(p => p.id === u.partner2Id)?.gender;
    const p1Handle = p1Gender === 'male' ? 'left-out' : 'right-out';
    const p2Handle = p2Gender === 'male' ? 'left-out' : 'right-out';

    if (!isDivorced) {
      rfEdges.push({ id: `e1-${u.id}`, source: u.partner1Id, target: `union-hub-${u.id}`, sourceHandle: p1Handle, targetHandle: p1Handle === 'left-out' ? 'right-in' : 'left-in', type: 'family', data: { connectionType: 'married-parent', hasChildren: children.length > 0 } });
      rfEdges.push({ id: `e2-${u.id}`, source: u.partner2Id, target: `union-hub-${u.id}`, sourceHandle: p2Handle, targetHandle: p2Handle === 'left-out' ? 'right-in' : 'left-in', type: 'family', data: { connectionType: 'married-parent', hasChildren: children.length > 0 } });
    } else {
      rfEdges.push({ id: `e1-${u.id}`, source: u.partner1Id, target: `union-hub-${u.id}`, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { connectionType: 'divorced-parent', isDivorced } });
      rfEdges.push({ id: `e2-${u.id}`, source: u.partner2Id, target: `union-hub-${u.id}`, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { connectionType: 'divorced-parent', isDivorced } });
    }

    children.forEach((c, index) => {
      rfEdges.push({ id: `c-${u.id}-${c.id}`, source: `union-hub-${u.id}`, target: c.id, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { connectionType: 'child', siblingCount: children.length, siblingIndex: index, isDivorced } });
    });
  });

  // 3. אדמה ושורשים
  const nodeXPositions = Object.values(positions).map(p => p.x);
  if (nodeXPositions.length > 0) {
    const minX = Math.min(...nodeXPositions);
    const maxX = Math.max(...nodeXPositions) + 280;
    const treeActualWidth = (maxX - minX) + (600 * 2);
    const rPos = primaryRootId ? positions[primaryRootId] : { x: 0, y: 0 };

    rfNodes.push({ id: 'dynamic-ground', type: 'ground', position: { x: minX - 600, y: 320 }, width: treeActualWidth, height: 90, draggable: false, selectable: false, zIndex: 5, data: { width: treeActualWidth, bounds: { minX: minX - 40, maxX: maxX + 40 } } });

    const rootUnion = unions.find(u => !persons.find(p => p.id === u.partner1Id)?.parentUnionId && !persons.find(p => p.id === u.partner2Id)?.parentUnionId);
    if (rootUnion) {
      const p1Node = rfNodes.find(n => n.id === rootUnion.partner1Id);
      const p2Node = rfNodes.find(n => n.id === rootUnion.partner2Id);
      const hubNode = rfNodes.find(n => n.id === `union-hub-${rootUnion.id}`);

      if (p1Node && p2Node && hubNode) {
        rfNodes.push({ id: 'trunk_main', type: 'crown', position: { x: rPos.x - 360 + 500 - 10, y: -50 + 130 - 10 }, width: 20, height: 20, draggable: false, selectable: false, zIndex: 10, data: {} });
        rfNodes.push({ id: 'massive-tree-roots', type: 'rootsDecoration', position: { x: rPos.x - 360, y: -50 }, width: 1000, height: 700, draggable: false, zIndex: 10, style: { mixBlendMode: 'multiply' }, data: { mass: treeMass } });
      }
      rfEdges.push({ id: `crown-to-${p1Node?.id}`, source: 'trunk_main', target: p1Node?.id as string, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { weight: 12, connectionType: 'crown-arm' } });
      rfEdges.push({ id: `crown-to-${p2Node?.id}`, source: 'trunk_main', target: p2Node?.id as string, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { weight: 12, connectionType: 'crown-arm' } });
      rfEdges.push({ id: `crown-to-hub`, source: 'trunk_main', target: hubNode?.id as string, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { weight: 8, connectionType: 'crown-hub' } });
    }
  } else {
    rfNodes.push({ id: 'massive-tree-roots', type: 'rootsDecoration', position: { x: -360, y: -50 }, width: 1000, height: 700, draggable: false, selectable: false, zIndex: 10, style: { mixBlendMode: 'multiply' }, data: { mass: treeMass } });
  }
  return { nodes: rfNodes, edges: rfEdges };
}

const initialMock = generateMockData();
const initialGraph = buildInitialGraph(initialMock.persons, initialMock.unions);

interface FamilyState {
  nodes: Node[]; edges: Edge[]; persons: Person[]; unions: Union[];
  onNodesChange: OnNodesChange; onEdgesChange: OnEdgesChange;
  rebuildGraph: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  persons: initialMock.persons,
  unions: initialMock.unions,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    const { nodes, unions, persons } = get();
    let updatedNodes = [...nodes];
    let changed = false;

    unions.forEach(u => {
      const p1 = updatedNodes.find(n => n.id === u.partner1Id);
      const p2 = updatedNodes.find(n => n.id === u.partner2Id);
      const hubIndex = updatedNodes.findIndex(n => n.id === `union-hub-${u.id}`);

      if (p1 && p2 && hubIndex !== -1) {
        const hubPos = calculateHubPosition(p1.position, p2.position, u.status === 'divorced', persons.some(p => p.parentUnionId === u.id));
        if (Math.abs(updatedNodes[hubIndex].position.x - hubPos.x) > 1 || Math.abs(updatedNodes[hubIndex].position.y - hubPos.y) > 1) {
          updatedNodes[hubIndex] = { ...updatedNodes[hubIndex], position: { x: hubPos.x - 10, y: hubPos.y - 10 } };
          changed = true;
        }
      }
    });
    if (changed) set({ nodes: updatedNodes });
  },
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  rebuildGraph: () => {
    const { persons, unions } = get();
    const { nodes, edges } = buildInitialGraph(persons, unions);
    set({ nodes, edges });
  },
}));