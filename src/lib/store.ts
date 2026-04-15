'use client';

import { create } from 'zustand';
import { 
  Edge, 
  Node, 
  OnNodesChange, 
  OnEdgesChange, 
  applyNodeChanges, 
  applyEdgeChanges,
} from '@xyflow/react';
import { Person, Union } from './types';

// Mock Data Generator
const generateMockData = () => {
  const persons: Person[] = [
    // Gen 1: Grandparents
    { id: 'gpa', fullName: 'אריה אברהם', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'gma', fullName: 'מיכל אברהם', birthYear: 1952, isAlive: true, gender: 'female' },
    
    // Gen 2: Children
    { id: 'son1', fullName: 'עומר אברהם', birthYear: 1975, isAlive: true, gender: 'male', parentUnionId: 'u1' },
    { id: 'daughter1', fullName: 'שירה אברהם', birthYear: 1980, deathYear: 2023, isAlive: false, gender: 'female', parentUnionId: 'u1' },
    { id: 'son2_divorced', fullName: 'יוסי אברהם', birthYear: 1982, isAlive: true, gender: 'male', parentUnionId: 'u1' },

    // Gen 2 Spouses
    { id: 'son1_wife', fullName: 'נועה לוי', birthYear: 1978, isAlive: true, gender: 'female' },
    { id: 'son2_ex', fullName: 'דנה שמש', birthYear: 1984, isAlive: true, gender: 'female' },

    // Gen 3: Grandchildren
    { id: 'gs1', fullName: 'אורי אברהם', birthYear: 2005, isAlive: true, gender: 'male', parentUnionId: 'u2' }, 
    { id: 'gs2', fullName: 'יעל אברהם', birthYear: 2010, isAlive: true, gender: 'female', parentUnionId: 'u2' }, 
    { id: 'gs3', fullName: 'דן אברהם', birthYear: 2008, isAlive: true, gender: 'male', parentUnionId: 'u3' },
  ];

  const unions: Union[] = [
    { id: 'u1', partner1Id: 'gpa', partner2Id: 'gma', status: 'married' },
    { id: 'u2', partner1Id: 'son1', partner2Id: 'son1_wife', status: 'married' },
    { id: 'u3', partner1Id: 'son2_divorced', partner2Id: 'son2_ex', status: 'divorced' },
  ];

  return { persons, unions };
};

const initialMock = generateMockData();

interface FamilyState {
  nodes: Node[];
  edges: Edge[];
  persons: Person[];
  unions: Union[];
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  
  rebuildGraph: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  nodes: [],
  edges: [],
  persons: initialMock.persons,
  unions: initialMock.unions,

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  rebuildGraph: () => {
    const { persons, unions } = get();
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    const NODE_WIDTH = 280;
    const HORIZONTAL_SPACING = 340; // מרווח סטנדרטי לזוג
    const VERTICAL_SPACING = 200;

    const positions: Record<string, { x: number, y: number }> = {};
    
    // סידור ראשוני מדויק למניעת חפיפות (כמו בתמונה ששלחת)
    // דור 1:
    positions['gpa'] = { x: 0, y: 0 };
    positions['gma'] = { x: -340, y: 0 };

    // דור 2: הרחבה מאסיבית לצדדים!
    positions['son1'] = { x: 500, y: 250 };
    positions['son1_wife'] = { x: 160, y: 250 }; // שמאל מעומר (מרווח 340)

    positions['daughter1'] = { x: -170, y: 250 }; // שירה בדיוק מתחת להורים

    positions['son2_divorced'] = { x: -600, y: 250 };
    positions['son2_ex'] = { x: -940, y: 250 };

    // דור 3:
    positions['gs1'] = { x: 520, y: 500 }; // הבן של עומר
    positions['gs2'] = { x: 140, y: 500 }; // הבת של עומר
    positions['gs3'] = { x: -800, y: 500 }; // הבן של יוסי אברהם

    // יצירת הכרטיסיות (Nodes)
    persons.forEach((p) => {
      rfNodes.push({
        id: p.id,
        type: 'familyMember',
        position: positions[p.id] || { x: 0, y: 0 },
        data: { person: p }
      });
    });

    // Handle Unions
    unions.forEach((u) => {
      const p1 = rfNodes.find(n => n.id === u.partner1Id);
      const p2 = rfNodes.find(n => n.id === u.partner2Id);
      if (!p1 || !p2) return;

      const children = persons.filter(p => p.parentUnionId === u.id);
      const isDivorced = u.status === 'divorced';
      
      const centerX = (p1.position.x + p2.position.x) / 2 + (NODE_WIDTH / 2);
      const centerY = Math.max(p1.position.y, p2.position.y) + 140;

      if (children.length > 0) {
        rfNodes.push({
          id: `union-hub-${u.id}`,
          type: 'union',
          position: { x: centerX, y: centerY },
          data: {}
        });

        rfEdges.push({
          id: `hub-e1-${u.id}`,
          source: p1.id,
          target: `union-hub-${u.id}`,
          sourceHandle: 'bottom-source',
          targetHandle: 'top',
          type: 'family',
          data: { isHub: true, isDivorced },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        });

        rfEdges.push({
          id: `hub-e2-${u.id}`,
          source: p2.id,
          target: `union-hub-${u.id}`,
          sourceHandle: 'bottom-source',
          targetHandle: 'top',
          type: 'family',
          data: { isHub: true, isDivorced },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        });

        // קווים מצומת חיבור לילדים
        children.forEach(child => {
          rfEdges.push({
            id: `child-e-${u.id}-${child.id}`,
            source: `union-hub-${u.id}`,
            target: child.id,
            sourceHandle: 'bottom',
            targetHandle: 'top-target',
            type: 'family',
            data: { isChild: true, isDivorced },
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          });
        });

      } else {
        if (!isDivorced) {
          rfEdges.push({
            id: `u-direct-${u.id}`,
            source: p1.id,
            target: p2.id,
            sourceHandle: 'left-out',
            targetHandle: 'right-in',
            type: 'family',
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          });
        }
      }
    });

    set({ nodes: rfNodes, edges: rfEdges });
  },
}));
