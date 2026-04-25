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
import { Person, Union, PersonUnionLink, AddContext } from './types';
import { initialPersons, initialUnions, initialLinks } from './mockData';
import { buildGraphLayout, calculateHubPosition } from './layoutEngine';

// --- Helpers ------------------------------------------------------------------

/** Generates a unique ID based on timestamp and random string */
function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// --- Add Form Types -----------------------------------------------------------

export interface PersonFormData {
  fullName: string;
  birthYear?: number;
  gender: 'male' | 'female' | 'other';
  isAlive: boolean;
  // Extended optional fields
  maidenName?: string;
  birthDate?: string;
  birthPlace?: string;
  deathYear?: number;
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;
  photoUrl?: string;
  phoneNumber?: string;
  email?: string;
  address?: { country?: string; city?: string; street?: string };
  occupation?: string;
  bio?: string;
  socialLinks?: { facebook?: string; instagram?: string; linkedin?: string };
  /** If selected from autocomplete, references an existing person ID */
  existingPersonId?: string;
}

export interface AddFamilyMemberPayload {
  primary: PersonFormData;
  /** Relevant only for add_partner and add_parent */
  unionStatus?: Union['status'];
  unionMarriageYear?: number;
  /** Relevant only for add_parent: The second parent (optional) */
  secondParent?: PersonFormData;
}

// --- State --------------------------------------------------------------------

const initialGraph = buildGraphLayout(initialPersons, initialUnions, initialLinks);

interface FamilyState {
  nodes: Node[];
  edges: Edge[];
  persons: Person[];
  unions: Union[];
  links: PersonUnionLink[];
  focusUnionId: string | undefined;

  /** Controls drawer visibility */
  addDrawerOpen: boolean;
  /** Context tracking what action opened the drawer */
  addContext: AddContext | null;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  rebuildGraph: () => void;
  setFocusUnion: (id: string) => void;
  updatePersons: (newPersons: Person[]) => void;
  updateUnions: (newUnions: Union[]) => void;
  updateLinks: (newLinks: PersonUnionLink[]) => void;

  openAddDrawer: (ctx: AddContext) => void;
  closeAddDrawer: () => void;
  addFamilyMember: (payload: AddFamilyMemberPayload) => void;
  connectExistingNodes: (intent: 'spouse' | 'child_to_union', sourceId: string, targetId: string) => void;

  highlightedNodeId: string | null;
  setHighlightedNode: (id: string | null) => void;
  pendingFocusNodeId: string | null;
  setPendingFocusNodeId: (id: string | null) => void;
}

// --- Store --------------------------------------------------------------------

export const useFamilyStore = create<FamilyState>((set, get) => ({
  highlightedNodeId: null,
  setHighlightedNode: (id) => set({ highlightedNodeId: id }),
  pendingFocusNodeId: null,
  setPendingFocusNodeId: (id) => set({ pendingFocusNodeId: id }),
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  persons: initialPersons,
  unions: initialUnions,
  links: initialLinks,
  focusUnionId: undefined,
  addDrawerOpen: false,
  addContext: null,

  // --- Node / Edge Handlers ---------------------------------------------------
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

  updatePersons: (newPersons) => { set({ persons: newPersons }); get().rebuildGraph(); },
  updateUnions: (newUnions) => { set({ unions: newUnions }); get().rebuildGraph(); },
  updateLinks: (newLinks) => { set({ links: newLinks }); get().rebuildGraph(); },

  // --- Drawer -----------------------------------------------------------------
  openAddDrawer: (ctx) => set({ addDrawerOpen: true, addContext: ctx }),
  closeAddDrawer: () => set({ addDrawerOpen: false, addContext: null }),

  // --- Core Business Logic ----------------------------------------------------
  addFamilyMember: (payload) => {
    const { persons, unions, links, addContext } = get();

    let newPersons = [...persons];
    let newUnions = [...unions];
    let newLinks = [...links];

    /** Creates a new Person, unless an existingPersonId is provided */
    const resolvePerson = (form: PersonFormData): string => {
      if (form.existingPersonId) return form.existingPersonId;
      const newPerson: Person = {
        id: uid('person'),
        fullName: form.fullName,
        birthYear: form.birthYear,
        isAlive: form.isAlive,
        gender: form.gender,
        ...(form.maidenName && { maidenName: form.maidenName }),
        ...(form.birthDate && { birthDate: form.birthDate }),
        ...(form.birthPlace && { birthPlace: form.birthPlace }),
        ...(form.deathYear && { deathYear: form.deathYear }),
        ...(form.deathDate && { deathDate: form.deathDate }),
        ...(form.deathPlace && { deathPlace: form.deathPlace }),
        ...(form.burialPlace && { burialPlace: form.burialPlace }),
        ...(form.photoUrl && { photoUrl: form.photoUrl }),
        ...(form.phoneNumber && { phoneNumber: form.phoneNumber }),
        ...(form.email && { email: form.email }),
        ...(form.address && { address: form.address }),
        ...(form.occupation && { occupation: form.occupation }),
        ...(form.bio && { bio: form.bio }),
        ...(form.socialLinks && { socialLinks: form.socialLinks }),
      };
      newPersons.push(newPerson);
      return newPerson.id;
    };

    if (!addContext) return;
    
    let primaryNewId: string | null = null;

    // --- Scenario: Add Partner ------------------------------------------------
    if (addContext.action === 'add_partner') {
      const sourceId = addContext.sourcePersonId;
      primaryNewId = resolvePerson(payload.primary);
      
      // Look for an existing union that has exactly 1 partner (the sourceId)
      const existingLinks = newLinks.filter(l => l.personId === sourceId && l.role === 'partner');
      const singleParentUnionLink = existingLinks.find(l => {
          const unionPartners = newLinks.filter(ul => ul.unionId === l.unionId && ul.role === 'partner');
          return unionPartners.length === 1;
      });

      if (singleParentUnionLink) {
          // If the person has a 1-partner union (created from adding a single parent), add the new spouse to it
          newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: singleParentUnionLink.unionId, role: 'partner' });
      } else {
          // Normal case: Create a new union for the marriage
          const newUnion: Union = {
            id: uid('union'),
            status: payload.unionStatus ?? 'married',
            ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
          };
          newUnions.push(newUnion);
          newLinks.push({ id: uid('link'), personId: sourceId, unionId: newUnion.id, role: 'partner' });
          newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: newUnion.id, role: 'partner' });
      }
    }

    // --- Scenario: Add Child --------------------------------------------------
    else if (addContext.action === 'add_child') {
      primaryNewId = resolvePerson(payload.primary);
      newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: addContext.sourceUnionId, role: 'child' });
    }

    // --- Scenario: Add Parent(s) ----------------------------------------------
    else if (addContext.action === 'add_parent') {
      const childId = addContext.sourcePersonId;
      primaryNewId = resolvePerson(payload.primary);

      // Create a union even if there is only one known parent
      const newUnion: Union = {
        id: uid('union'),
        status: payload.unionStatus ?? 'married',
        ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
      };
      newUnions.push(newUnion);
      newLinks.push({ id: uid('link'), personId: primaryNewId, unionId: newUnion.id, role: 'partner' });

      // Process the second parent if provided
      if (payload.secondParent && (payload.secondParent.existingPersonId || payload.secondParent.fullName.trim())) {
        const parent2Id = resolvePerson(payload.secondParent);
        newLinks.push({ id: uid('link'), personId: parent2Id, unionId: newUnion.id, role: 'partner' });
      }

      // Link the child to the newly created union
      newLinks.push({ id: uid('link'), personId: childId, unionId: newUnion.id, role: 'child' });
    }

    // --- Scenario: Add Root Node ----------------------------------------------
    else if (addContext.action === 'add_root') {
      primaryNewId = resolvePerson(payload.primary);
      // The person floats independently without any links or unions
    }

    set({ persons: newPersons, unions: newUnions, links: newLinks });
    get().rebuildGraph();
    get().closeAddDrawer();
    
    if (primaryNewId) {
      setTimeout(() => get().setPendingFocusNodeId(primaryNewId!), 100);
    }
  },

  connectExistingNodes: (intent, sourceId, targetId) => {
    const { unions, links } = get();
    let newUnions = [...unions];
    let newLinks = [...links];

    if (intent === 'spouse') {
      // Check if they are already connected
      const alreadyConnected = newLinks.some(l1 => 
        l1.personId === sourceId && l1.role === 'partner' &&
        newLinks.some(l2 => l2.personId === targetId && l2.role === 'partner' && l2.unionId === l1.unionId)
      );
      if (alreadyConnected) return;

      // Look for a single parent union on either side
      const sourceExistingLinks = newLinks.filter(l => l.personId === sourceId && l.role === 'partner');
      const targetExistingLinks = newLinks.filter(l => l.personId === targetId && l.role === 'partner');
      
      let singleParentUnionLink = sourceExistingLinks.find(l => 
        newLinks.filter(ul => ul.unionId === l.unionId && ul.role === 'partner').length === 1
      );
      
      // If source doesn't have one, check if target has one
      if (!singleParentUnionLink) {
        singleParentUnionLink = targetExistingLinks.find(l => 
          newLinks.filter(ul => ul.unionId === l.unionId && ul.role === 'partner').length === 1
        );
      }

      if (singleParentUnionLink) {
        const unionId = singleParentUnionLink.unionId;
        const personToAdd = singleParentUnionLink.personId === sourceId ? targetId : sourceId;
        newLinks.push({ id: uid('link'), personId: personToAdd, unionId, role: 'partner' });
      } else {
        const newUnion: Union = { id: uid('union'), status: 'married' };
        newUnions.push(newUnion);
        newLinks.push({ id: uid('link'), personId: sourceId, unionId: newUnion.id, role: 'partner' });
        newLinks.push({ id: uid('link'), personId: targetId, unionId: newUnion.id, role: 'partner' });
      }
    } else if (intent === 'child_to_union') {
      const alreadyConnected = newLinks.some(l => l.personId === sourceId && l.unionId === targetId && l.role === 'child');
      if (!alreadyConnected) {
        newLinks.push({ id: uid('link'), personId: sourceId, unionId: targetId, role: 'child' });
      }
    }

    set({ unions: newUnions, links: newLinks });
    get().rebuildGraph();
  },
}));