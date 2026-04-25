import { Node } from '@xyflow/react';

export type Person = {
  id: string;
  fullName: string;
  maidenName?: string;

  // --- Dates and Locations ---
  birthYear?: number;
  birthDate?: string;
  birthPlace?: string;

  deathYear?: number;
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;

  isAlive: boolean;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;

  // --- Contact Information (for living persons) ---
  phoneNumber?: string;
  email?: string;
  address?: {
    country?: string;
    city?: string;
    street?: string;
  };

  // --- Biography ---
  occupation?: string;
  bio?: string;

  // --- Social Links ---
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
};

export type Union = {
  id: string;
  status: 'married' | 'divorced' | 'partnered' | 'separated';
  marriageYear?: number;
  divorceYear?: number;
};

// --- Tree Contexts ---

export type AddContext =
  | { action: 'add_partner'; sourcePersonId: string }
  | { action: 'add_child'; sourceUnionId: string }
  | { action: 'add_parent'; sourcePersonId: string }
  | { action: 'add_root' };

export type PersonUnionLink = {
  id: string;
  personId: string;
  unionId: string;
  role: 'partner' | 'child';
};

export type FamilyMemberNode = Node<{
  person: Person;
  isMarried?: boolean;
  parentCount?: number;
  isOrphan?: boolean;
}, 'familyMember'>;

export type BoundingBox = {
  width: number;
  leftX: number;
  rightX: number;
};

export type LayoutRegistry = {
  persons: Record<string, { x: number; y: number }>;
  unions: Record<string, { x: number; y: number }>;
  boundingBoxes: Record<string, BoundingBox>;
};

export interface PersonFormData {
  fullName: string;
  birthYear?: number;
  gender: 'male' | 'female' | 'other';
  isAlive: boolean;
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
  existingPersonId?: string;
}

export interface AddFamilyMemberPayload {
  primary: PersonFormData;
  unionStatus?: Union['status'];
  unionMarriageYear?: number;
  secondParent?: PersonFormData;
}