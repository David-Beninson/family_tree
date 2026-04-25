import { Person, Union, PersonUnionLink } from './types';
import { SPACING } from './layoutConstants';

export const calculateHubPosition = (p1Pos: { x: number, y: number }, p2Pos: { x: number, y: number }, status: Union['status'], hasChildren: boolean) => {
    const centerX = (p1Pos.x + p2Pos.x) / 2 + (SPACING.CARD_WIDTH / 2);
    let centerY = p1Pos.y + (SPACING.CARD_HEIGHT / 2);
    if (status === 'divorced' && hasChildren) {
        centerY = Math.max(p1Pos.y, p2Pos.y) + SPACING.CARD_HEIGHT + 100;
    }
    return { x: centerX, y: centerY };
};

export const getPartnerLinks = (pId: string, links: PersonUnionLink[]) =>
    links.filter(l => l.personId === pId && l.role === 'partner');

export const getUnionPartners = (uId: string, links: PersonUnionLink[]) =>
    links.filter(l => l.unionId === uId && l.role === 'partner').map(l => l.personId);

export const getUnionChildren = (uId: string, persons: Person[], links: PersonUnionLink[]) =>
    links.filter(l => l.unionId === uId && l.role === 'child')
        .map(l => persons.find(p => p.id === l.personId))
        .filter(Boolean)
        .sort((a, b) => (a!.birthYear ?? Infinity) - (b!.birthYear ?? Infinity)) as Person[];

export const getParentUnion = (pId: string, links: PersonUnionLink[]) =>
    links.find(l => l.personId === pId && l.role === 'child')?.unionId;

export const isPolyParent = (pId: string, links: PersonUnionLink[]) =>
    getPartnerLinks(pId, links).length >= 3;

export const calculatePersonWidth = (pId: string, visited: Set<string>, persons: Person[], links: PersonUnionLink[]): number => {
    const myUnions = getPartnerLinks(pId, links).map(l => l.unionId).filter(uId => !visited.has(uId));
    if (myUnions.length === 0) return SPACING.CARD_WIDTH;

    let totalUnionsWidth = 0;
    myUnions.forEach((uId, idx) => {
        totalUnionsWidth += calculateUnionWidth(uId, visited, persons, links);
        if (idx < myUnions.length - 1) totalUnionsWidth += SPACING.SIBLING_GAP;
    });

    return Math.max(SPACING.CARD_WIDTH, totalUnionsWidth);
};

export const calculateUnionWidth = (uId: string, visited: Set<string>, persons: Person[], links: PersonUnionLink[]): number => {
    if (visited.has(uId)) return 0;
    visited.add(uId);

    const partners = getUnionPartners(uId, links);
    const parentsWidth = partners.length * SPACING.CARD_WIDTH + Math.max(0, partners.length - 1) * SPACING.MIN_NODE_GAP;

    const children = getUnionChildren(uId, persons, links);
    if (children.length === 0) return parentsWidth;

    let childrenTotalWidth = 0;
    children.forEach((child, idx) => {
        childrenTotalWidth += calculatePersonWidth(child.id, visited, persons, links);
        if (idx < children.length - 1) childrenTotalWidth += SPACING.SIBLING_GAP;
    });

    return Math.max(parentsWidth, childrenTotalWidth);
};