import { Person, Union } from './types';

export const initialPersons: Person[] = [
  { id: 'gpa', fullName: 'אריה אברהם', birthYear: 1950, isAlive: true, gender: 'male' },
  { id: 'gma', fullName: 'מיכל אברהם', birthYear: 1952, isAlive: true, gender: 'female' },
  { id: 'son1', fullName: 'עומר אברהם', birthYear: 1975, isAlive: true, gender: 'male', parentUnionId: 'u1' },
  { id: 'daughter1', fullName: 'שירה אברהם', birthYear: 1980, deathYear: 2023, isAlive: false, gender: 'female', parentUnionId: 'u1' },
  { id: 'son2_divorced', fullName: 'יוסי אברהם', birthYear: 1982, isAlive: true, gender: 'male', parentUnionId: 'u1' },
  { id: 'son1_wife', fullName: 'נועה לוי', birthYear: 1978, isAlive: true, gender: 'female', parentUnionId: 'u_noa_parents' },
  { id: 'noa_father', fullName: 'יצחק לוי', birthYear: 1950, isAlive: true, gender: 'male' },
  { id: 'noa_mother', fullName: 'שרה לוי', birthYear: 1952, isAlive: true, gender: 'female' },
  { id: 'son2_ex', fullName: 'דנה שמש', birthYear: 1984, isAlive: true, gender: 'female' },
  { id: 'son2_wife2', fullName: 'מאיה לוי', birthYear: 1985, isAlive: true, gender: 'female' },
  { id: 'gs1', fullName: 'אורי אברהם', birthYear: 2005, isAlive: true, gender: 'male', parentUnionId: 'u2' },
  { id: 'gs2', fullName: 'יעל אברהם', birthYear: 2010, isAlive: true, gender: 'female', parentUnionId: 'u2' },
  { id: 'gs3', fullName: 'דן אברהם', birthYear: 2008, isAlive: true, gender: 'male', parentUnionId: 'u3' },
  { id: 'gd1', fullName: 'נועה אברהם', birthYear: 2012, isAlive: true, gender: 'female', parentUnionId: 'u3' },
  { id: 'gs3_wife', fullName: 'רוני כהן', birthYear: 2009, isAlive: true, gender: 'female' },
  { id: 'gs1_ex', fullName: 'עדי כהן', birthYear: 2006, isAlive: true, gender: 'female' },
  { id: 'ggs1', fullName: 'נועם אברהם', birthYear: 2024, isAlive: true, gender: 'male', parentUnionId: 'u5' },
];

export const initialUnions: Union[] = [
  { id: 'u1', partner1Id: 'gpa', partner2Id: 'gma', status: 'married' },
  { id: 'u2', partner1Id: 'son1', partner2Id: 'son1_wife', status: 'married' },
  { id: 'u3', partner1Id: 'son2_divorced', partner2Id: 'son2_ex', status: 'divorced' },
  { id: 'u_noa_parents', partner1Id: 'noa_father', partner2Id: 'noa_mother', status: 'married' },
  { id: 'u6', partner1Id: 'son2_divorced', partner2Id: 'son2_wife2', status: 'married' },
  { id: 'u4', partner1Id: 'gs3', partner2Id: 'gs3_wife', status: 'married' },
  { id: 'u5', partner1Id: 'gs1', partner2Id: 'gs1_ex', status: 'divorced' },
];
