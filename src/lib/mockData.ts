import { Person, Union, PersonUnionLink } from './types';

export const initialPersons: Person[] = [
    { id: 'gpa', fullName: 'אריה אברהם', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'gma', fullName: 'מיכל אברהם', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'son1', fullName: 'עומר אברהם', birthYear: 1975, isAlive: true, gender: 'male' },
    { id: 'daughter1', fullName: 'שירה אברהם', birthYear: 1980, deathYear: 2023, isAlive: false, gender: 'female' },
    { id: 'son2_divorced', fullName: 'יוסי אברהם', birthYear: 1982, isAlive: true, gender: 'male' },
    { id: 'son1_wife', fullName: 'נועה לוי', birthYear: 1978, isAlive: true, gender: 'female' },
    { id: 'noa_father', fullName: 'יצחק לוי', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'noa_mother', fullName: 'שרה לוי', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'son2_ex', fullName: 'דנה שמש', birthYear: 1984, isAlive: true, gender: 'female' },
    { id: 'son2_wife2', fullName: 'מאיה לוי', birthYear: 1985, isAlive: true, gender: 'female' },
    { id: 'gs1', fullName: 'אורי אברהם', birthYear: 2005, isAlive: true, gender: 'male' },
    { id: 'gs2', fullName: 'יעל אברהם', birthYear: 2010, isAlive: true, gender: 'female' },
    { id: 'gs3', fullName: 'דן אברהם', birthYear: 2008, isAlive: true, gender: 'male' },
    { id: 'gd1', fullName: 'נועה אברהם', birthYear: 2012, isAlive: true, gender: 'female' },
    { id: 'gs3_wife', fullName: 'רוני כהן', birthYear: 2009, isAlive: true, gender: 'female' },
    { id: 'gs1_ex', fullName: 'עדי כהן', birthYear: 2006, isAlive: true, gender: 'female' },
    { id: 'ggs1', fullName: 'נועם אברהם', birthYear: 2024, isAlive: true, gender: 'male' },
];

export const initialUnions: Union[] = [
    { id: 'u1', status: 'married', marriageYear: 1974 },
    { id: 'u_noa_parents', status: 'married', marriageYear: 1976 },
    { id: 'u2', status: 'married', marriageYear: 1998 },
    { id: 'u3', status: 'divorced', marriageYear: 2004, divorceYear: 2012 },
    { id: 'u6', status: 'married', marriageYear: 2014 },
    { id: 'u4', status: 'married', marriageYear: 2023 },
    { id: 'u5', status: 'divorced', marriageYear: 2022, divorceYear: 2024 },
];

export const initialLinks: PersonUnionLink[] = [
    { id: 'l1', personId: 'gpa', unionId: 'u1', role: 'partner' },
    { id: 'l2', personId: 'gma', unionId: 'u1', role: 'partner' },
    { id: 'l3', personId: 'son1', unionId: 'u1', role: 'child' },
    { id: 'l4', personId: 'daughter1', unionId: 'u1', role: 'child' },
    { id: 'l5', personId: 'son2_divorced', unionId: 'u1', role: 'child' },

    { id: 'l6', personId: 'noa_father', unionId: 'u_noa_parents', role: 'partner' },
    { id: 'l7', personId: 'noa_mother', unionId: 'u_noa_parents', role: 'partner' },
    { id: 'l8', personId: 'son1_wife', unionId: 'u_noa_parents', role: 'child' },

    { id: 'l9', personId: 'son1', unionId: 'u2', role: 'partner' },
    { id: 'l10', personId: 'son1_wife', unionId: 'u2', role: 'partner' },
    { id: 'l11', personId: 'gs1', unionId: 'u2', role: 'child' },
    { id: 'l12', personId: 'gs2', unionId: 'u2', role: 'child' },

    { id: 'l13', personId: 'son2_divorced', unionId: 'u3', role: 'partner' },
    { id: 'l14', personId: 'son2_ex', unionId: 'u3', role: 'partner' },
    { id: 'l15', personId: 'gs3', unionId: 'u3', role: 'child' },
    { id: 'l16', personId: 'gd1', unionId: 'u3', role: 'child' },

    { id: 'l17', personId: 'son2_divorced', unionId: 'u6', role: 'partner' },
    { id: 'l18', personId: 'son2_wife2', unionId: 'u6', role: 'partner' },

    { id: 'l19', personId: 'gs3', unionId: 'u4', role: 'partner' },
    { id: 'l20', personId: 'gs3_wife', unionId: 'u4', role: 'partner' },

    // אורי ועדי
    { id: 'l21', personId: 'gs1', unionId: 'u5', role: 'partner' },
    { id: 'l22', personId: 'gs1_ex', unionId: 'u5', role: 'partner' },
    { id: 'l23', personId: 'ggs1', unionId: 'u5', role: 'child' },
];