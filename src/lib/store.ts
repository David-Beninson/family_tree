'use client';

import { create } from 'zustand';
import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';
import { Person, Union, PersonUnionLink } from './types';
import { initialPersons, initialUnions, initialLinks } from './mockData';
import { buildGraphLayout, calculateHubPosition } from './layoutEngine';

const initialGraph = buildGraphLayout(initialPersons, initialUnions, initialLinks);

interface FamilyState {
  nodes: Node[];
  edges: Edge[];
  persons: Person[];
  unions: Union[];
  links: PersonUnionLink[];
  focusUnionId: string | undefined;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  rebuildGraph: () => void;
  setFocusUnion: (id: string) => void;
  updatePersons: (newPersons: Person[]) => void;
  updateUnions: (newUnions: Union[]) => void;
  updateLinks: (newLinks: PersonUnionLink[]) => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  persons: initialPersons,
  unions: initialUnions,
  links: initialLinks,
  focusUnionId: undefined,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });

    const { nodes, unions, links } = get();
    let updatedNodes = [...nodes];
    let changed = false;

    unions.forEach(u => {
      const partners = links.filter(l => l.unionId === u.id && l.role === 'partner').map(l => l.personId);
      if (partners.length !== 2) return;

      const p1Node = updatedNodes.find(n => n.id === partners[0]);
      const p2Node = updatedNodes.find(n => n.id === partners[1]);
      const hubIndex = updatedNodes.findIndex(n => n.id === `union-hub-${u.id}`);

      if (p1Node && p2Node && hubIndex !== -1) {
        const hasChildren = links.some(l => l.unionId === u.id && l.role === 'child');

        const newHubPos = calculateHubPosition(p1Node.position, p2Node.position, u.status, hasChildren);

        if (
          Math.abs(updatedNodes[hubIndex].position.x - (newHubPos.x - 10)) > 0.5 ||
          Math.abs(updatedNodes[hubIndex].position.y - (newHubPos.y - 10)) > 0.5
        ) {
          updatedNodes[hubIndex] = {
            ...updatedNodes[hubIndex],
            position: { x: newHubPos.x - 10, y: newHubPos.y - 10 }
          };
          changed = true;
        }
      }
    });

    if (changed) set({ nodes: updatedNodes });
  },

  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  rebuildGraph: () => {
    const { persons, unions, links, focusUnionId } = get();
    const { nodes, edges } = buildGraphLayout(persons, unions, links, focusUnionId || undefined);
    set({ nodes, edges });
  },

  setFocusUnion: (id) => {
    set({ focusUnionId: id });
    get().rebuildGraph();
  },

  updatePersons: (newPersons) => {
    set({ persons: newPersons });
    get().rebuildGraph();
  },

  updateUnions: (newUnions) => {
    set({ unions: newUnions });
    get().rebuildGraph();
  },

  updateLinks: (newLinks) => {
    set({ links: newLinks });
    get().rebuildGraph();
  },
}));