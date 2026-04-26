import { Person, Union, PersonUnionLink } from "./types";

export const mockPersons: Person[] = [
    // --- דור 1: סבא רבא וסבתא רבא (ישראלי) ---
    { id: 'p1', fullName: 'אברהם ישראלי', gender: 'male', isAlive: false, bloodlineIds: ['israeli'] },
    { id: 'p2', fullName: 'שרה ישראלי', gender: 'female', isAlive: false, bloodlineIds: ['israeli'] },

    // --- דור 2: הסבא עם ה"ממטרה" (3 נשים) ---
    { id: 'p3', fullName: 'יצחק ישראלי', gender: 'male', isAlive: true, bloodlineIds: ['israeli'] },
    { id: 'p4', fullName: 'רבקה (אישה 1)', gender: 'female', isAlive: true, bloodlineIds: ['israeli'] },
    { id: 'p5', fullName: 'לאה (אישה 2 - גרושה)', gender: 'female', isAlive: true, bloodlineIds: ['israeli'] },
    { id: 'p6', fullName: 'רחל (אישה 3)', gender: 'female', isAlive: true, bloodlineIds: ['israeli'] },

    // --- דור 3: הפוקוס שלנו, אחים ואחים חורגים ---
    { id: 'p7', fullName: 'דוד ישראלי (Focus)', gender: 'male', isAlive: true, bloodlineIds: ['israeli'] }, // הבן של רבקה
    { id: 'p8', fullName: 'יוסף ישראלי', gender: 'male', isAlive: true, bloodlineIds: ['israeli'] }, // אח של דוד
    { id: 'p9', fullName: 'דינה ישראלי', gender: 'female', isAlive: true, bloodlineIds: ['israeli'] }, // בת של לאה (אחות חורגת)

    // --- דור 3: המשפחה הרזה (שמואלוביץ') ---
    { id: 'p10', fullName: 'מיכל שמואלוביץ\'', gender: 'female', isAlive: true, bloodlineIds: ['israeli', 'shmuelovich'] }, // אשתו של דוד
    { id: 'p11', fullName: 'שמואל שמואלוביץ\'', gender: 'male', isAlive: true, bloodlineIds: ['shmuelovich'] }, // אבא של מיכל
    { id: 'p12', fullName: 'חנה שמואלוביץ\'', gender: 'female', isAlive: true, bloodlineIds: ['shmuelovich'] }, // אמא של מיכל

    // --- דור 4: הילדים של דוד ומיכל ---
    { id: 'p13', fullName: 'אריאל ישראלי', gender: 'male', isAlive: true, bloodlineIds: ['israeli'] },
];

export const mockUnions: Union[] = [
    { id: 'u1', status: 'married' }, // אברהם ושרה
    { id: 'u2', status: 'married', isSprinkler: true }, // יצחק ורבקה
    { id: 'u3', status: 'divorced', isSprinkler: true }, // יצחק ולאה (גרושים - קו מקווקו)
    { id: 'u4', status: 'married', isSprinkler: true }, // יצחק ורחל
    { id: 'u5', status: 'married' }, // דוד ומיכל
    { id: 'u6', status: 'married' }, // שמואל וחנה (הורי מיכל)
];

export const mockLinks: PersonUnionLink[] = [
    // משפחת אברהם (דור 1 -> 2)
    { id: 'l1', personId: 'p1', unionId: 'u1', role: 'partner' },
    { id: 'l2', personId: 'p2', unionId: 'u1', role: 'partner' },
    { id: 'l3', personId: 'p3', unionId: 'u1', role: 'child' }, // יצחק הבן שלהם

    // הממטרה של יצחק (דור 2 -> 3)
    { id: 'l4', personId: 'p3', unionId: 'u2', role: 'partner' }, // יצחק + רבקה
    { id: 'l5', personId: 'p4', unionId: 'u2', role: 'partner' },
    { id: 'l6', personId: 'p7', unionId: 'u2', role: 'child' },   // דוד הבן של רבקה
    { id: 'l7', personId: 'p8', unionId: 'u2', role: 'child' },   // יוסף הבן של רבקה

    { id: 'l8', personId: 'p3', unionId: 'u3', role: 'partner' }, // יצחק + לאה
    { id: 'l9', personId: 'p5', unionId: 'u3', role: 'partner' },
    { id: 'l10', personId: 'p9', unionId: 'u3', role: 'child' },  // דינה הבת של לאה

    // דוד ומיכל (דור 3 -> 4)
    { id: 'l11', personId: 'p7', unionId: 'u5', role: 'partner' },
    { id: 'l12', personId: 'p10', unionId: 'u5', role: 'partner' },
    { id: 'l13', personId: 'p13', unionId: 'u5', role: 'child' },  // אריאל הבן שלהם

    // המשפחה הרזה של מיכל
    { id: 'l14', personId: 'p11', unionId: 'u6', role: 'partner' }, // שמואל + חנה
    { id: 'l15', personId: 'p12', unionId: 'u6', role: 'partner' },
    { id: 'l16', personId: 'p10', unionId: 'u6', role: 'child' },   // מיכל הבת שלהם
];