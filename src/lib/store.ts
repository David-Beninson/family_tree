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
import { Person, Union, PersonUnionLink, AddContext, AddFamilyMemberPayload } from './types';
import { mockPersons, mockUnions, mockLinks } from './mockData';
import { buildGraphLayout } from './layoutEngine';
import { executeAddFamilyMember, executeConnectNodes } from './familyActions';
import { getFamilyNetwork } from './graphFilters';

const initialGraph = buildGraphLayout(mockPersons, mockUnions, mockLinks);

interface FamilyState {
  nodes: Node[];
  edges: Edge[];
  persons: Person[];
  unions: Union[];
  links: PersonUnionLink[];
  focusUnionId: string | undefined;
  focusPersonId: string | undefined;
  setFocusPersonId: (id: string) => void;
  addDrawerOpen: boolean;
  addContext: AddContext | null;
  highlightedNodeId: string | null;
  pendingFocusNodeId: string | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  rebuildGraph: () => void;
  setFocusUnion: (id: string) => void;
  updatePersons: (newPersons: Person[]) => void;
  updateUnions: (newUnions: Union[]) => void;
  updateLinks: (newLinks: PersonUnionLink[]) => void;
  openAddDrawer: (ctx: AddContext) => void;
  closeAddDrawer: () => void;
  setHighlightedNode: (id: string | null) => void;
  setPendingFocusNodeId: (id: string | null) => void;

  addFamilyMember: (payload: AddFamilyMemberPayload) => void;
  connectExistingNodes: (intent: 'spouse' | 'child_to_union', sourceId: string, targetId: string) => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  highlightedNodeId: null,
  setHighlightedNode: (id) => set({ highlightedNodeId: id }),
  pendingFocusNodeId: null,
  setPendingFocusNodeId: (id) => set({ pendingFocusNodeId: id }),
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  persons: mockPersons,
  unions: mockUnions,
  links: mockLinks,
  focusUnionId: undefined,
  focusPersonId: mockPersons.length > 0 ? mockPersons[0].id : undefined,
  setFocusPersonId: (id) => {
    set({ focusPersonId: id });
    get().rebuildGraph();
  },
  addDrawerOpen: false,
  addContext: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),

  rebuildGraph: () => {
    const { persons, unions, links, focusPersonId } = get();

    let dataToRender: any = { persons, unions, links, roleMap: undefined };

    if (focusPersonId) {
      // כאן נוצר ה-roleMap שמגדיר מי ה-Focus ומי ה-Entry Point
      dataToRender = getFamilyNetwork(focusPersonId, persons, unions, links);
    }

    const { nodes, edges } = buildGraphLayout(
      dataToRender.persons,
      dataToRender.unions,
      dataToRender.links,
      dataToRender.roleMap // <--- הוספה קריטית להצגת כפתורי הניווט
    );

    set({ nodes, edges });
  },

  setFocusUnion: (id) => { set({ focusUnionId: id }); get().rebuildGraph(); },
  updatePersons: (newPersons) => { set({ persons: newPersons }); get().rebuildGraph(); },
  updateUnions: (newUnions) => { set({ unions: newUnions }); get().rebuildGraph(); },
  updateLinks: (newLinks) => { set({ links: newLinks }); get().rebuildGraph(); },

  openAddDrawer: (ctx) => set({ addDrawerOpen: true, addContext: ctx }),
  closeAddDrawer: () => set({ addDrawerOpen: false, addContext: null }),

  // --- The refactored Core Logic calls ---
  addFamilyMember: (payload) => {
    const { persons, unions, links, addContext } = get();
    if (!addContext) return;

    const { newPersons, newUnions, newLinks, primaryNewId } = executeAddFamilyMember(
      { persons, unions, links, addContext },
      payload
    );

    set({ persons: newPersons, unions: newUnions, links: newLinks });
    get().rebuildGraph();
    get().closeAddDrawer();

    if (primaryNewId) {
      setTimeout(() => get().setPendingFocusNodeId(primaryNewId), 100);
    }
  },

  connectExistingNodes: (intent, sourceId, targetId) => {
    const { unions, links } = get();
    const { newUnions, newLinks, changed } = executeConnectNodes({ unions, links }, intent, sourceId, targetId);

    if (changed) {
      set({ unions: newUnions, links: newLinks });
      get().rebuildGraph();
    }
  },
}));