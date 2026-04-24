import { Node, Position } from '@xyflow/react';

export type Person = {
  id: string;
  fullName: string;
  maidenName?: string;

  // ── תאריכים ומיקומים ──────────────────────────────────────────
  birthYear: number;
  birthDate?: string;
  birthPlace?: string;

  deathYear?: number;
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;

  isAlive: boolean;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;

  // ── פרטי התקשרות (רלוונטי לאנשים חיים) ──────────────────────
  phoneNumber?: string;
  email?: string;
  address?: {
    country?: string;
    city?: string;
    street?: string;
  };

  // ── ביוגרפיה ─────────────────────────────────────────────────
  occupation?: string;
  bio?: string;

  // ── רשתות חברתיות ────────────────────────────────────────────
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

// ── הוספת אדם חדש לעץ ────────────────────────────────────────────

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

export type BudConfig = {
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  actionText: string;
};

export type FamilyMemberNode = Node<{
  person: Person;
  isMarried?: boolean;
  parentCount?: number;
  isOrphan?: boolean;
  buds?: BudConfig[];
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