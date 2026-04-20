import { Node, Position } from '@xyflow/react';

export type Person = {
  id: string;
  fullName: string;
  birthYear: number;
  deathYear?: number;
  isAlive: boolean;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;
};

export type Union = {
  id: string;
  status: 'married' | 'divorced' | 'partnered' | 'separated';
};

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