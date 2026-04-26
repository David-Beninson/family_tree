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
        .filter((p): p is Person => p !== undefined)
        .sort((a, b) => {
            const yearA = a.birthYear !== undefined && a.birthYear !== null ? a.birthYear : Infinity;
            const yearB = b.birthYear !== undefined && b.birthYear !== null ? b.birthYear : Infinity;
            return yearA - yearB;
        });
export const getParentUnion = (pId: string, links: PersonUnionLink[]) =>
    links.find(l => l.personId === pId && l.role === 'child')?.unionId;

export const isPolyParent = (pId: string, links: PersonUnionLink[]) =>
    getPartnerLinks(pId, links).length >= 3;

export const calculatePersonWidth = (pId: string, visited: Set<string>, boundingBoxes: Map<string, number>, persons: Person[], links: PersonUnionLink[]): number => {
    const myUnions = getPartnerLinks(pId, links).map(l => l.unionId).filter(uId => !visited.has(uId));
    // אדם ללא יוניון תופס בדיוק רוחב של כרטיסייה אחת
    if (myUnions.length === 0) return SPACING.CARD_WIDTH;

    let totalUnionsWidth = 0;
    myUnions.forEach((uId, idx) => {
        totalUnionsWidth += calculateUnionWidth(uId, visited, boundingBoxes, persons, links);
        if (idx < myUnions.length - 1) totalUnionsWidth += SPACING.SIBLING_GAP;
    });

    return Math.max(SPACING.CARD_WIDTH, totalUnionsWidth);
};

export const calculateUnionWidth = (uId: string, visited: Set<string>, boundingBoxes: Map<string, number>, persons: Person[], links: PersonUnionLink[]): number => {
    // 1. שימוש בזיכרון: אם כבר חישבנו את הקופסה התוחמת הזו, נחזיר אותה (ייעול אדיר לביצועים)
    if (boundingBoxes.has(uId)) return boundingBoxes.get(uId)!;

    // 2. הגנה מפני לולאות אינסופיות (מעגלים משפחתיים / נישואי קרובים)
    if (visited.has(uId)) return 0;
    visited.add(uId);

    const partners = getUnionPartners(uId, links);
    // (א) רוחב ההורים עצמם + הרווח ביניהם (MIN_NODE_GAP)
    const parentsWidth = partners.length * SPACING.CARD_WIDTH + Math.max(0, partners.length - 1) * SPACING.MIN_NODE_GAP;

    const children = getUnionChildren(uId, persons, links);

    // (ב) רוחב כל הילדים + הרווחים ביניהם (SIBLING_GAP) - חישוב רקורסיבי
    let childrenTotalWidth = 0;
    if (children.length > 0) {
        children.forEach((child, idx) => {
            childrenTotalWidth += calculatePersonWidth(child.id, visited, boundingBoxes, persons, links);
            if (idx < children.length - 1) childrenTotalWidth += SPACING.SIBLING_GAP;
        });
    }

    // 3. יחידת הבסיס מוגדרת תמיד לפי המקסימום מבין השניים (הורים מול בלוק הילדים)
    const finalUnionWidth = Math.max(parentsWidth, childrenTotalWidth);

    // 4. שמירת התוצאה במפה (Bounding Box Cache) כדי שנוכל להשתמש בזה למיקומים בציר X
    boundingBoxes.set(uId, finalUnionWidth);

    return finalUnionWidth;
};