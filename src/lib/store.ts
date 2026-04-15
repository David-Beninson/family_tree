'use client';

import { create } from 'zustand';
import { Edge, Node, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { Person, Union } from './types';

const generateMockData = () => {
  const persons: Person[] = [
    { id: 'gpa', fullName: 'אריה אברהם', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'gma', fullName: 'מיכל אברהם', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'son1', fullName: 'עומר אברהם', birthYear: 1975, isAlive: true, gender: 'male', parentUnionId: 'u1' },
    { id: 'daughter1', fullName: 'שירה אברהם', birthYear: 1980, deathYear: 2023, isAlive: false, gender: 'female', parentUnionId: 'u1' },
    { id: 'son2_divorced', fullName: 'יוסי אברהם', birthYear: 1982, isAlive: true, gender: 'male', parentUnionId: 'u1' },
    { id: 'son1_wife', fullName: 'נועה לוי', birthYear: 1978, isAlive: true, gender: 'female' },
    { id: 'son2_ex', fullName: 'דנה שמש', birthYear: 1984, isAlive: true, gender: 'female' },
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
    { id: 'u4', partner1Id: 'gs3', partner2Id: 'gs3_wife', status: 'married' },
    { id: 'u5', partner1Id: 'gs1', partner2Id: 'gs1_ex', status: 'divorced' },
  ];
  return { persons, unions };
};

// ─── פונקציה לבניית העץ מראש ───
function buildInitialGraph(persons: Person[], unions: Union[]) {
  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];
  const positions: Record<string, { x: number, y: number }> = {};
  const Y_SPACING = -250;
  const CARD_W = 280;
  const UNIT_W = 400;
  const subtreeWidths: Record<string, number> = {};

  const calculateWidth = (pId: string): number => {
    const pUnions = unions.filter(u => u.partner1Id === pId || u.partner2Id === pId);
    if (pUnions.length === 0) { subtreeWidths[pId] = UNIT_W; return UNIT_W; }
    let totalW = 0;
    pUnions.forEach(u => {
      const children = persons.filter(p => p.parentUnionId === u.id);
      if (children.length === 0) { totalW += UNIT_W * 1.8; } else {
        let childrenW = 0;
        children.forEach(c => { childrenW += calculateWidth(c.id); });
        totalW += Math.max(UNIT_W * 1.8, childrenW);
      }
    });
    subtreeWidths[pId] = totalW;
    return totalW;
  };

  const placeMember = (pId: string, centerX: number, level: number) => {
    const pUnions = unions.filter(u => u.partner1Id === pId || u.partner2Id === pId);
    if (pUnions.length === 0) { positions[pId] = { x: centerX - (CARD_W / 2), y: level * Y_SPACING }; return; }
    pUnions.forEach(u => {
      const children = persons.filter(p => p.parentUnionId === u.id).sort((a, b) => a.birthYear - b.birthYear);
      const p1 = persons.find(p => p.id === u.partner1Id);
      const p2 = persons.find(p => p.id === u.partner2Id);
      let rightP = p1?.gender === 'male' ? p1 : p2;
      let leftP = p1?.gender === 'female' ? p1 : p2;
      if (rightP) positions[rightP.id] = { x: centerX + 190 - (CARD_W / 2), y: level * Y_SPACING };
      if (leftP) positions[leftP.id] = { x: centerX - 190 - (CARD_W / 2), y: level * Y_SPACING };
      if (children.length > 0) {
        let totalChildrenW = 0;
        children.forEach(c => { totalChildrenW += subtreeWidths[c.id] || UNIT_W; });
        let currentChildX = centerX + (totalChildrenW / 2);
        children.forEach(c => {
          const childW = subtreeWidths[c.id] || UNIT_W;
          placeMember(c.id, currentChildX - (childW / 2), level + 1);
          currentChildX -= childW;
        });
      }
    });
  };

  const rootPerson = persons.find(p => !p.parentUnionId && unions.some(u => u.partner1Id === p.id || u.partner2Id === p.id));
  if (rootPerson) {
    calculateWidth(rootPerson.id);
    placeMember(rootPerson.id, 0, 0);
  }

  const treeMass = persons.length;

  // 1. כרטיסיות אנשים
  persons.forEach((p) => {
    rfNodes.push({
      id: p.id, type: 'familyMember', position: positions[p.id] || { x: 0, y: 0 },
      width: 280, height: 90, // ⟵ מונע את הקפיצה של המדידה
      draggable: false,
      data: { person: p, isMarried: unions.some(u => u.partner1Id === p.id || u.partner2Id === p.id), parentCount: p.parentUnionId ? 2 : 0 }
    });
  });

  // 2. צמתי החיבור
  unions.forEach((u) => {
    const p1Node = rfNodes.find(n => n.id === u.partner1Id);
    const p2Node = rfNodes.find(n => n.id === u.partner2Id);
    if (!p1Node || !p2Node) return;
    const isDivorced = u.status === 'divorced';
    const children = persons.filter(p => p.parentUnionId === u.id);
    const centerX = (p1Node.position.x + p2Node.position.x) / 2 + 140;
    const centerY = isDivorced ? Math.min(p1Node.position.y, p2Node.position.y) - 100 : Math.min(p1Node.position.y, p2Node.position.y) + 35;

    rfNodes.push({
      id: `union-hub-${u.id}`, type: 'union', position: { x: centerX - 10, y: centerY - 10 },
      width: 20, height: 20, // ⟵ מידות חובה
      draggable: false, data: {
        hasChildren: children.length > 0,
        isDivorced,
        partnerNames: `${persons.find(p => p.id === u.partner1Id)?.fullName} ו-${persons.find(p => p.id === u.partner2Id)?.fullName}`
      }
    });

    // ... (חלק ה-Edges נשאר בדיוק אותו דבר) ...
    const p1Person = persons.find(p => p.id === u.partner1Id);
    const p2Person = persons.find(p => p.id === u.partner2Id);
    const p1Handle = p1Person?.gender === 'male' ? 'left-out' : 'right-out';
    const p2Handle = p2Person?.gender === 'male' ? 'left-out' : 'right-out';
    if (!isDivorced) {
      rfEdges.push({ id: `e1-${u.id}`, source: u.partner1Id, target: `union-hub-${u.id}`, sourceHandle: p1Handle, targetHandle: p1Handle === 'left-out' ? 'right-in' : 'left-in', type: 'family', data: { weight: 4 } });
      rfEdges.push({ id: `e2-${u.id}`, source: u.partner2Id, target: `union-hub-${u.id}`, sourceHandle: p2Handle, targetHandle: p2Handle === 'left-out' ? 'right-in' : 'left-in', type: 'family', data: { weight: 4 } });
    } else {
      rfEdges.push({ id: `e1-${u.id}`, source: u.partner1Id, target: `union-hub-${u.id}`, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { isDivorced: true, edgeRole: 'v-arm' } });
      rfEdges.push({ id: `e2-${u.id}`, source: u.partner2Id, target: `union-hub-${u.id}`, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family', data: { isDivorced: true, edgeRole: 'v-arm' } });
    }
    children.forEach(c => {
      rfEdges.push({ id: `c-${u.id}-${c.id}`, source: `union-hub-${u.id}`, target: c.id, sourceHandle: 'top-source', targetHandle: 'bottom-target', type: 'family' });
    });
  });

  // 3. אדמה ושורשים
  const nodeXPositions = Object.values(positions).map(p => p.x);
  if (nodeXPositions.length > 0) {
    const minX = Math.min(...nodeXPositions);
    const maxX = Math.max(...nodeXPositions) + 280;
    const dragPadding = 40;
    const groundPadding = 600;
    const treeActualWidth = (maxX - minX) + (groundPadding * 2);
    const rPos = rootPerson ? positions[rootPerson.id] : { x: 0, y: 0 };

    rfNodes.push({
      id: 'dynamic-ground', type: 'ground', position: { x: minX - groundPadding, y: 320 },
      width: treeActualWidth, height: 90,
      draggable: false, selectable: false, zIndex: 5,
      data: { width: treeActualWidth, bounds: { minX: minX - dragPadding, maxX: maxX + dragPadding } }
    });

    rfNodes.push({
      id: 'massive-tree-roots', type: 'rootsDecoration',
      position: { x: rPos.x - 360, y: -150 },
      width: 1000, height: 700,
      draggable: false,
      zIndex: 10,
      style: { mixBlendMode: 'multiply' },
      data: { mass: treeMass }
    });
  }

  return { nodes: rfNodes, edges: rfEdges };
}

const initialMock = generateMockData();
// מחושב באופן סינכרוני לפני שהדף עולה
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
    const { nodes, unions } = get();
    let updatedNodes = [...nodes];
    let changed = false;
    unions.forEach(u => {
      const p1 = updatedNodes.find(n => n.id === u.partner1Id);
      const p2 = updatedNodes.find(n => n.id === u.partner2Id);
      const hubIndex = updatedNodes.findIndex(n => n.id === `union-hub-${u.id}`);
      if (p1 && p2 && hubIndex !== -1) {
        const isDivorced = u.status === 'divorced';
        const centerX = (p1.position.x + p2.position.x) / 2 + 130;
        const centerY = isDivorced ? Math.min(p1.position.y, p2.position.y) - 100 : Math.min(p1.position.y, p2.position.y) + 35;
        if (Math.abs(updatedNodes[hubIndex].position.x - centerX) > 1 || Math.abs(updatedNodes[hubIndex].position.y - centerY) > 1) {
          updatedNodes[hubIndex] = { ...updatedNodes[hubIndex], position: { x: centerX, y: centerY } };
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