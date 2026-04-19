import { Node, Position } from '@xyflow/react';

export type Person = {
  id: string;
  fullName: string;
  birthYear: number;
  deathYear?: number;
  isAlive: boolean;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;
  parentUnionId?: string;
};

export type Union = {
  id: string;
  partner1Id: string;
  partner2Id?: string;
  status: 'married' | 'divorced' | 'partnered' | 'separated';
};

// יצרנו טייפ מיוחד שמגדיר בדיוק איך נראה ניצן
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
  buds?: BudConfig[]; // עכשיו אנחנו משתמשים בטייפ הנקי שיצרנו!
}, 'familyMember'>;