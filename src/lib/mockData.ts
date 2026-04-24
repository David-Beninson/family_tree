import { Person, Union, PersonUnionLink } from './types';

export const initialPersons: Person[] = [
    // === דור 1: האבות המייסדים (תימן) ===
    {
        id: 'zecharia_tzobari',
        fullName: 'זכריה צוברי',
        birthYear: 1890,
        birthPlace: 'צנעא, תימן',
        deathYear: 1968,
        burialPlace: 'בית העלמין סגולה, פתח תקווה',
        isAlive: false,
        gender: 'male',
        occupation: 'צורף כסף ורב הקהילה',
        bio: 'סב המשפחה. עלה לארץ במבצע "על כנפי נשרים" עם שתי נשותיו וילדיו. היה צורף כסף מחונן שיצירותיו מוצגות היום במוזיאון ישראל.',
        photoUrl: 'https://randomuser.me/api/portraits/men/85.jpg'
    },
    {
        id: 'shoshana_tzobari',
        fullName: 'שושנה צוברי',
        maidenName: 'ערוסי',
        birthYear: 1895,
        birthPlace: 'צנעא, תימן',
        deathYear: 1950,
        isAlive: false,
        gender: 'female',
        occupation: 'עקרת בית ורוקמת',
        bio: 'אשתו הראשונה של זכריה. אישה חזקה שגידלה את ילדיה במסירות בדרך העולה לארץ ישראל, אך נפטרה זמן קצר לאחר ההגעה למעברת ראש העין.',
        photoUrl: 'https://randomuser.me/api/portraits/women/85.jpg'
    },
    {
        id: 'yonah_tzobari',
        fullName: 'יונה צוברי',
        maidenName: 'מנצורה',
        birthYear: 1905,
        birthPlace: 'שרעב, תימן',
        deathYear: 1982,
        isAlive: false,
        gender: 'female',
        occupation: 'רופאה מסורתית (מיילדת)',
        bio: 'אשתו השנייה של זכריה. צעירה משושנה, הייתה ידועה בכל האזור כמיילדת ומומחית לצמחי מרפא. גידלה את הילדים של שושנה כאילו היו שלה.',
        photoUrl: 'https://randomuser.me/api/portraits/women/70.jpg'
    },

    // === דור 2: הילדים של זכריה ===
    {
        id: 'avraham_tzobari',
        fullName: 'אברהם צוברי',
        birthYear: 1912,
        isAlive: false,
        deathYear: 1995,
        gender: 'male',
        occupation: 'חקלאי',
        bio: 'בנו הבכור של זכריה משושנה. איש אדמה שעבד בפרדסי השרון רוב ימי חייו.',
    },
    {
        id: 'mazal_tzobari',
        fullName: 'מזל צוברי',
        birthYear: 1915,
        isAlive: false,
        deathYear: 2001,
        gender: 'female',
    },
    {
        id: 'miriam_levi',
        fullName: 'מרים לוי',
        maidenName: 'צוברי',
        birthYear: 1915,
        isAlive: false,
        deathYear: 1990,
        gender: 'female',
        bio: 'בתו של זכריה (משושנה). התחתנה עם שלום לוי במחנה העולים.',
    },
    {
        id: 'shalom_levi',
        fullName: 'שלום לוי',
        birthYear: 1910,
        isAlive: false,
        deathYear: 1988,
        gender: 'male',
    },
    {
        id: 'yosef_tzobari',
        fullName: 'יוסף צוברי',
        birthYear: 1920,
        isAlive: false,
        deathYear: 2005,
        gender: 'male',
        bio: 'בנו הזקן של זכריה ושושנה.',
    },
    {
        id: 'rachel_tzobari',
        fullName: 'רחל צוברי',
        birthYear: 1928,
        isAlive: false,
        deathYear: 2010,
        gender: 'female',
    },
    {
        id: 'shimon_tzobari',
        fullName: 'שמעון צוברי',
        birthYear: 1925,
        isAlive: false,
        deathYear: 2018,
        gender: 'male',
        bio: 'בנו היחיד של זכריה מאשתו השנייה, יונה. (חצי אח של אברהם, מרים ויוסף).',
    },

    // === דור 3: נישואי תערובת בתוך המשפחה (כאן מתחיל האתגר) ===
    {
        id: 'naomi_levi',
        fullName: 'נעמי לוי',
        maidenName: 'צוברי',
        birthYear: 1935,
        isAlive: true,
        gender: 'female',
        address: { city: 'ראש העין' },
        bio: 'הבת של אברהם ומזל. התחתנה עם הבן דוד הראשון שלה, יצחק (הבן של מרים, אחות של אבא שלה).',
        photoUrl: 'https://randomuser.me/api/portraits/women/55.jpg'
    },
    {
        id: 'yitzhak_levi',
        fullName: 'יצחק לוי',
        birthYear: 1930,
        isAlive: true,
        gender: 'male',
        address: { city: 'ראש העין' },
        bio: 'הבן של מרים ושלום. התחתן עם בת הדודה נעמי. עבד עשרות שנים בתעשייה האווירית.',
        photoUrl: 'https://randomuser.me/api/portraits/men/60.jpg'
    },
    {
        id: 'rivka_tzobari',
        fullName: 'רבקה צוברי',
        birthYear: 1945,
        isAlive: true,
        gender: 'female',
        bio: 'הבת של יוסף ורחל. התחתנה עם שמעון, שהוא למעשה חצי-דוד שלה (האח למחצה של אבא שלה).',
    },

    // === דור 4: הילדים מהנישואים הפנימיים ===
    {
        id: 'david_levi',
        fullName: 'דוד לוי',
        birthYear: 1955,
        isAlive: true,
        gender: 'male',
        occupation: 'מנהל בנק',
        bio: 'הבן של יצחק ונעמי (שהם בני דודים). יצא ממעגל הנישואים הפנימי והתחתן עם שרה, עולה מארגנטינה.',
        photoUrl: 'https://randomuser.me/api/portraits/men/40.jpg'
    },
    {
        id: 'sarah_levi',
        fullName: 'שרה לוי',
        birthYear: 1960,
        isAlive: true,
        gender: 'female',
        photoUrl: 'https://randomuser.me/api/portraits/women/42.jpg'
    },
    {
        id: 'eitan_tzobari',
        fullName: 'איתן צוברי',
        birthYear: 1965,
        isAlive: true,
        gender: 'male',
        occupation: 'קבלן שיפוצים',
        bio: 'הבן של שמעון ורבקה. הוריו הם דוד ואחיינית (למחצה). התגרש ממאיה בצעירותו.',
        photoUrl: 'https://randomuser.me/api/portraits/men/35.jpg'
    },
    {
        id: 'maya_golan',
        fullName: 'מאיה גולן',
        birthYear: 1970,
        isAlive: true,
        gender: 'female',
    },

    // === דור 5: סגירת מעגל - הילדים שלהם מתחתנים ===
    {
        id: 'yael_tzobari_levi',
        fullName: 'יעל צוברי-לוי',
        birthYear: 1985,
        isAlive: true,
        gender: 'female',
        occupation: 'מתכנתת בכירה',
        bio: 'הבת של דוד ושרה. נפגשה עם נועם (שהוא קרוב משפחה רחוק שלה דרך הסבך המשפחתי) במסיבה, והם החליטו להתחתן.',
        photoUrl: 'https://randomuser.me/api/portraits/women/25.jpg'
    },
    {
        id: 'noam_tzobari',
        fullName: 'נועם צוברי',
        birthYear: 1995,
        isAlive: true,
        gender: 'male',
        occupation: 'מעצב גרפי',
        bio: 'הבן של איתן ומאיה. התחתן עם יעל.',
        photoUrl: 'https://randomuser.me/api/portraits/men/26.jpg'
    },

    // === דור 6: הנין שמחבר הכל ===
    {
        id: 'ori_tzobari',
        fullName: 'אורי צוברי',
        birthYear: 2020,
        isAlive: true,
        gender: 'male',
        bio: 'הבן של יעל ונועם. העץ שלו כל כך סבוך שהוא כנראה בן דוד של עצמו מכמה כיוונים שונים.',
        photoUrl: 'https://randomuser.me/api/portraits/lego/3.jpg'
    }
];

export const initialUnions: Union[] = [
    // חתונות האב המייסד (פוליגמיה)
    { id: 'union_zech_shosh', status: 'married', marriageYear: 1910 },
    { id: 'union_zech_yonah', status: 'married', marriageYear: 1923 },

    // חתונות הדור השני (רגילות)
    { id: 'union_avr_mazal', status: 'married', marriageYear: 1933 },
    { id: 'union_mir_shalom', status: 'married', marriageYear: 1929 },
    { id: 'union_yos_rach', status: 'married', marriageYear: 1943 },

    // חתונות הדור השלישי והרביעי (הסבך הגדול - נישואי קרובים)
    { id: 'union_yitzhak_naomi', status: 'married', marriageYear: 1953 }, // בני דודים
    { id: 'union_shimon_rivka', status: 'married', marriageYear: 1963 }, // דוד ואחיינית

    // חתונות וגירושים רגילים
    { id: 'union_david_sarah', status: 'married', marriageYear: 1982 },
    { id: 'union_eitan_maya', status: 'divorced', marriageYear: 1993, divorceYear: 2000 },

    // סגירת המעגל
    { id: 'union_yael_noam', status: 'married', marriageYear: 2018 },
];

export const initialLinks: PersonUnionLink[] = [
    // משפחת זכריה ושושנה + ילדים
    { id: 'l1', personId: 'zecharia_tzobari', unionId: 'union_zech_shosh', role: 'partner' },
    { id: 'l2', personId: 'shoshana_tzobari', unionId: 'union_zech_shosh', role: 'partner' },
    { id: 'l3', personId: 'avraham_tzobari', unionId: 'union_zech_shosh', role: 'child' },
    { id: 'l4', personId: 'miriam_levi', unionId: 'union_zech_shosh', role: 'child' },
    { id: 'l5', personId: 'yosef_tzobari', unionId: 'union_zech_shosh', role: 'child' },

    // משפחת זכריה ויונה (אישה 2) + ילדים
    { id: 'l6', personId: 'zecharia_tzobari', unionId: 'union_zech_yonah', role: 'partner' },
    { id: 'l7', personId: 'yonah_tzobari', unionId: 'union_zech_yonah', role: 'partner' },
    { id: 'l8', personId: 'shimon_tzobari', unionId: 'union_zech_yonah', role: 'child' },

    // משפחת אברהם ומזל -> נעמי
    { id: 'l9', personId: 'avraham_tzobari', unionId: 'union_avr_mazal', role: 'partner' },
    { id: 'l10', personId: 'mazal_tzobari', unionId: 'union_avr_mazal', role: 'partner' },
    { id: 'l11', personId: 'naomi_levi', unionId: 'union_avr_mazal', role: 'child' },

    // משפחת מרים ושלום -> יצחק
    { id: 'l12', personId: 'miriam_levi', unionId: 'union_mir_shalom', role: 'partner' },
    { id: 'l13', personId: 'shalom_levi', unionId: 'union_mir_shalom', role: 'partner' },
    { id: 'l14', personId: 'yitzhak_levi', unionId: 'union_mir_shalom', role: 'child' },

    // משפחת יוסף ורחל -> רבקה
    { id: 'l15', personId: 'yosef_tzobari', unionId: 'union_yos_rach', role: 'partner' },
    { id: 'l16', personId: 'rachel_tzobari', unionId: 'union_yos_rach', role: 'partner' },
    { id: 'l17', personId: 'rivka_tzobari', unionId: 'union_yos_rach', role: 'child' },

    // === נישואי קרובים 1: יצחק (בן מרים) מתחתן עם נעמי (בת אברהם) -> דוד ===
    { id: 'l18', personId: 'yitzhak_levi', unionId: 'union_yitzhak_naomi', role: 'partner' },
    { id: 'l19', personId: 'naomi_levi', unionId: 'union_yitzhak_naomi', role: 'partner' },
    { id: 'l20', personId: 'david_levi', unionId: 'union_yitzhak_naomi', role: 'child' },

    // === נישואי קרובים 2: שמעון (האח למחצה) מתחתן עם רבקה (האחיינית) -> איתן ===
    { id: 'l21', personId: 'shimon_tzobari', unionId: 'union_shimon_rivka', role: 'partner' },
    { id: 'l22', personId: 'rivka_tzobari', unionId: 'union_shimon_rivka', role: 'partner' },
    { id: 'l23', personId: 'eitan_tzobari', unionId: 'union_shimon_rivka', role: 'child' },

    // משפחת דוד ושרה -> יעל
    { id: 'l24', personId: 'david_levi', unionId: 'union_david_sarah', role: 'partner' },
    { id: 'l25', personId: 'sarah_levi', unionId: 'union_david_sarah', role: 'partner' },
    { id: 'l26', personId: 'yael_tzobari_levi', unionId: 'union_david_sarah', role: 'child' },

    // משפחת איתן ומאיה (גרושים) -> נועם
    { id: 'l27', personId: 'eitan_tzobari', unionId: 'union_eitan_maya', role: 'partner' },
    { id: 'l28', personId: 'maya_golan', unionId: 'union_eitan_maya', role: 'partner' },
    { id: 'l29', personId: 'noam_tzobari', unionId: 'union_eitan_maya', role: 'child' },

    // === סגירת הלולאה המטורפת: יעל מתחתנת עם נועם -> אורי ===
    { id: 'l30', personId: 'yael_tzobari_levi', unionId: 'union_yael_noam', role: 'partner' },
    { id: 'l31', personId: 'noam_tzobari', unionId: 'union_yael_noam', role: 'partner' },
    { id: 'l32', personId: 'ori_tzobari', unionId: 'union_yael_noam', role: 'child' },
];