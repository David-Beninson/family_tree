import { Person, Union, PersonUnionLink } from './types';

/**
 * פילטר ה-Sandbox (Lineage Filter) החדש - O(N)
 * מבוסס על שיוך לשושלות (bloodlineIds) כדי למנוע סריקות BFS כבדות.
 * התוצאה היא רשימת אנשים, קשרים ויוניונים השייכים רק ל"בועה" הנוכחית.
 */
export function getFamilyNetwork(
    focusPersonId: string,
    allPersons: Person[],
    allUnions: Union[],
    allLinks: PersonUnionLink[]
) {
    const roleMap = new Map<string, 'focus' | 'blood' | 'entry-point'>();
    allPersons.forEach(p => roleMap.set(p.id, p.id === focusPersonId ? 'focus' : 'blood'));

    return {
        persons: allPersons,
        unions: allUnions,
        links: allLinks,
        roleMap
    };
}