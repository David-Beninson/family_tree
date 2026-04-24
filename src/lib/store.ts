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
  birthYear: number;
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

  highlightedNodeId: string | null;
  setHighlightedNode: (id: string | null) => void;
}

// --- Store --------------------------------------------------------------------

export const useFamilyStore = create<FamilyState>((set, get) => ({
  highlightedNodeId: null,
  setHighlightedNode: (id) => set({ highlightedNodeId: id }),
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

    // --- Scenario: Add Partner ------------------------------------------------
    if (addContext.action === 'add_partner') {
      const sourceId = addContext.sourcePersonId;
      const newId = resolvePerson(payload.primary);
      const newUnion: Union = {
        id: uid('union'),
        status: payload.unionStatus ?? 'married',
        ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
      };
      newUnions.push(newUnion);
      newLinks.push({ id: uid('link'), personId: sourceId, unionId: newUnion.id, role: 'partner' });
      newLinks.push({ id: uid('link'), personId: newId, unionId: newUnion.id, role: 'partner' });
    }

    // --- Scenario: Add Child --------------------------------------------------
    else if (addContext.action === 'add_child') {
      const newId = resolvePerson(payload.primary);
      newLinks.push({ id: uid('link'), personId: newId, unionId: addContext.sourceUnionId, role: 'child' });
    }

    // --- Scenario: Add Parent(s) ----------------------------------------------
    else if (addContext.action === 'add_parent') {
      const childId = addContext.sourcePersonId;
      const parent1Id = resolvePerson(payload.primary);

      // Create a union even if there is only one known parent
      const newUnion: Union = {
        id: uid('union'),
        status: payload.unionStatus ?? 'married',
        ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
      };
      newUnions.push(newUnion);
      newLinks.push({ id: uid('link'), personId: parent1Id, unionId: newUnion.id, role: 'partner' });

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
      resolvePerson(payload.primary);
      // The person floats independently without any links or unions
    }

    set({ persons: newPersons, unions: newUnions, links: newLinks });
    get().rebuildGraph();
    get().closeAddDrawer();
  },
}));