import { Person, PersonUnionLink } from './types';

// שימוש בקבועים המדויקים מהפרומפט הארכיטקטוני
export const ARCH_CONSTANTS = {
    CARD_WIDTH: 280,
    MIN_NODE_GAP: 60, // רווח בין בני זוג
    SIBLING_GAP: 40,  // רווח בין יחידות משפחתיות
    LEVEL_Y: 280
};

export const getPartnerLinks = (pId: string, links: PersonUnionLink[]) =>
    links.filter(l => l.personId === pId && l.role === 'partner');

export const getUnionPartners = (uId: string, links: PersonUnionLink[]) =>
    links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);

export const getUnionChildren = (uId: string, persons: Person[], links: PersonUnionLink[]) =>
    links.filter(l => l.unionId === uId && l.role === 'child')
        .map(l => persons.find(p => p.id === l.personId))
        .filter((p): p is Person => !!p)
        .sort((a, b) => (a.birthYear ?? Infinity) - (b.birthYear ?? Infinity));

export const getParentUnion = (pId: string, links: PersonUnionLink[]) =>
    links.find(l => l.personId === pId && l.role === 'child')?.unionId;