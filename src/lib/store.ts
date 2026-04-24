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

// ─── helpers ──────────────────────────────────────────────────────────────────

/** יוצר ID ייחודי מבוסס timestamp + random */
function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── טיפוסים לטופס ההוספה ───────────────────────────────────────────────────

export interface PersonFormData {
  fullName: string;
  birthYear: number;
  gender: 'male' | 'female' | 'other';
  isAlive: boolean;
  // extended fields — all optional
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
  /** אם הגיע מה-autocomplete — ID של אדם קיים */
  existingPersonId?: string;
}

export interface AddFamilyMemberPayload {
  primary: PersonFormData;
  /** רלוונטי רק ב-add_partner ו-add_parent */
  unionStatus?: Union['status'];
  unionMarriageYear?: number;
  /** רלוונטי רק ב-add_parent: הורה שני (אופציונלי) */
  secondParent?: PersonFormData;
}

// ─── State ────────────────────────────────────────────────────────────────────

const initialGraph = buildGraphLayout(initialPersons, initialUnions, initialLinks);

interface FamilyState {
  nodes: Node[];
  edges: Edge[];
  persons: Person[];
  unions: Union[];
  links: PersonUnionLink[];
  focusUnionId: string | undefined;

  /** האם חלון ההוספה פתוח */
  addDrawerOpen: boolean;
  /** הקשר שפתח את חלון ההוספה */
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
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFamilyStore = create<FamilyState>((set, get) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  persons: initialPersons,
  unions: initialUnions,
  links: initialLinks,
  focusUnionId: undefined,
  addDrawerOpen: false,
  addContext: null,

  // ── node/edge handlers ──────────────────────────────────────────────────────
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
  updateUnions:  (newUnions)  => { set({ unions: newUnions   }); get().rebuildGraph(); },
  updateLinks:   (newLinks)   => { set({ links: newLinks     }); get().rebuildGraph(); },

  // ── drawer ──────────────────────────────────────────────────────────────────
  openAddDrawer:  (ctx) => set({ addDrawerOpen: true,  addContext: ctx }),
  closeAddDrawer: ()    => set({ addDrawerOpen: false, addContext: null }),

  // ── הלוגיקה המרכזית ─────────────────────────────────────────────────────────
  addFamilyMember: (payload) => {
    const { persons, unions, links, addContext } = get();

    let newPersons  = [...persons];
    let newUnions   = [...unions];
    let newLinks    = [...links];

    /** יוצר Person חדש ומוסיף לרשימה, אלא אם הגיע existingPersonId */
    const resolvePerson = (form: PersonFormData): string => {
      if (form.existingPersonId) return form.existingPersonId;
      const newPerson: Person = {
        id:        uid('person'),
        fullName:  form.fullName,
        birthYear: form.birthYear,
        isAlive:   form.isAlive,
        gender:    form.gender,
        ...(form.maidenName   && { maidenName:   form.maidenName   }),
        ...(form.birthDate    && { birthDate:    form.birthDate    }),
        ...(form.birthPlace   && { birthPlace:   form.birthPlace   }),
        ...(form.deathYear    && { deathYear:    form.deathYear    }),
        ...(form.deathDate    && { deathDate:    form.deathDate    }),
        ...(form.deathPlace   && { deathPlace:   form.deathPlace   }),
        ...(form.burialPlace  && { burialPlace:  form.burialPlace  }),
        ...(form.photoUrl     && { photoUrl:     form.photoUrl     }),
        ...(form.phoneNumber  && { phoneNumber:  form.phoneNumber  }),
        ...(form.email        && { email:        form.email        }),
        ...(form.address      && { address:      form.address      }),
        ...(form.occupation   && { occupation:   form.occupation   }),
        ...(form.bio          && { bio:          form.bio          }),
        ...(form.socialLinks  && { socialLinks:  form.socialLinks  }),
      };
      newPersons.push(newPerson);
      return newPerson.id;
    };

    if (!addContext) return;

    // ── תרחיש: הוספת בן/בת זוג ───────────────────────────────────────────────
    if (addContext.action === 'add_partner') {
      const sourceId  = addContext.sourcePersonId;
      const newId     = resolvePerson(payload.primary);
      const newUnion: Union = {
        id:     uid('union'),
        status: payload.unionStatus ?? 'married',
        ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
      };
      newUnions.push(newUnion);
      newLinks.push({ id: uid('link'), personId: sourceId, unionId: newUnion.id, role: 'partner' });
      newLinks.push({ id: uid('link'), personId: newId,    unionId: newUnion.id, role: 'partner' });
    }

    // ── תרחיש: הוספת ילד ────────────────────────────────────────────────────
    else if (addContext.action === 'add_child') {
      const newId = resolvePerson(payload.primary);
      newLinks.push({ id: uid('link'), personId: newId, unionId: addContext.sourceUnionId, role: 'child' });
    }

    // ── תרחיש: הוספת הורה/ים ────────────────────────────────────────────────
    else if (addContext.action === 'add_parent') {
      const childId    = addContext.sourcePersonId;
      const parent1Id  = resolvePerson(payload.primary);

      // יצירת union (גם אם הורה שני חסר — עדיין ניצור union עם הורה בודד)
      const newUnion: Union = {
        id:     uid('union'),
        status: payload.unionStatus ?? 'married',
        ...(payload.unionMarriageYear && { marriageYear: payload.unionMarriageYear }),
      };
      newUnions.push(newUnion);
      newLinks.push({ id: uid('link'), personId: parent1Id, unionId: newUnion.id, role: 'partner' });

      // הורה שני — אופציונלי
      if (payload.secondParent && (payload.secondParent.existingPersonId || payload.secondParent.fullName.trim())) {
        const parent2Id = resolvePerson(payload.secondParent);
        newLinks.push({ id: uid('link'), personId: parent2Id, unionId: newUnion.id, role: 'partner' });
      }

      // קישור הילד ל-union החדש
      newLinks.push({ id: uid('link'), personId: childId, unionId: newUnion.id, role: 'child' });
    }

    // ── תרחיש: הוספת שורש חדש ──────────────────────────────────────────────
    else if (addContext.action === 'add_root') {
      resolvePerson(payload.primary);
      // אין union ואין links — האדם יצוף עצמאית בעץ
    }

    set({ persons: newPersons, unions: newUnions, links: newLinks });
    get().rebuildGraph();
    get().closeAddDrawer();
  },
}));