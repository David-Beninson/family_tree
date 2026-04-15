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
