import { Person, Union, PersonUnionLink } from './types';

export const initialPersons: Person[] = [
    // === דור 0: הורי המייסדים (כדי לסבך את העץ למעלה) ===
    {
        id: 'mori_salem_arusi', fullName: 'מארי שלום ערוסי', birthYear: 1860, isAlive: false, gender: 'male',
        bio: 'אביהן של שושנה ובדרה.', photoUrl: 'https://randomuser.me/api/portraits/men/90.jpg'
    },
    {
        id: 'rumia_arusi', fullName: 'רומיה ערוסי', birthYear: 1865, isAlive: false, gender: 'female'
    },
    {
        id: 'yihye_ozeri', fullName: 'יחיא עוזרי', birthYear: 1888, isAlive: false, gender: 'male',
        bio: 'ראש משפחת עוזרי. שתי בנותיו נישאו לשני בניו של זכריה.'
    },
    {
        id: 'saada_ozeri', fullName: 'סעדה עוזרי', birthYear: 1894, isAlive: false, gender: 'female'
    },
    {
        id: 'amram_levi', fullName: 'עמרם לוי', birthYear: 1885, isAlive: false, gender: 'male'
    },

    // === דור 1: האבות המייסדים ===
    {
        id: 'zecharia_tzobari', fullName: 'זכריה צוברי', birthYear: 1890, deathYear: 1968, isAlive: false, gender: 'male', occupation: 'צורף כסף ורב הקהילה', bio: 'סב המשפחה. נשוי לשתי נשים במקביל.', photoUrl: 'https://randomuser.me/api/portraits/men/85.jpg'
    },
    {
        id: 'shoshana_tzobari', fullName: 'שושנה צוברי', maidenName: 'ערוסי', birthYear: 1895, deathYear: 1950, isAlive: false, gender: 'female', photoUrl: 'https://randomuser.me/api/portraits/women/85.jpg'
    },
    {
        id: 'yonah_tzobari', fullName: 'יונה צוברי', maidenName: 'מנצורה', birthYear: 1905, deathYear: 1982, isAlive: false, gender: 'female', occupation: 'מיילדת', photoUrl: 'https://randomuser.me/api/portraits/women/70.jpg'
    },
    {
        id: 'badra_levi', fullName: 'בדרה לוי', maidenName: 'ערוסי', birthYear: 1892, isAlive: false, gender: 'female', bio: 'אחותה של שושנה. נישאה לעמרם לוי.'
    },

    // === דור 2: הילדים של המייסדים ===
    {
        id: 'avraham_tzobari', fullName: 'אברהם צוברי', birthYear: 1912, deathYear: 1995, isAlive: false, gender: 'male'
    },
    {
        id: 'mazal_tzobari', fullName: 'מזל צוברי', maidenName: 'עוזרי', birthYear: 1915, deathYear: 2001, isAlive: false, gender: 'female', bio: 'בתו של יחיא. נישאה לאברהם בעוד אחותה רחל נישאה לאחיו יוסף.'
    },
    {
        id: 'miriam_levi', fullName: 'מרים לוי', maidenName: 'צוברי', birthYear: 1915, deathYear: 1990, isAlive: false, gender: 'female'
    },
    {
        id: 'shalom_levi', fullName: 'שלום לוי', birthYear: 1910, deathYear: 1988, isAlive: false, gender: 'male', bio: 'בן דוד ראשון של אשתו מרים (אמא שלו ואמא שלה אחיות).'
    },
    {
        id: 'ezra_levi', fullName: 'עזרא לוי', birthYear: 1912, isAlive: false, gender: 'male', bio: 'אחיו של שלום. היגר לארגנטינה בשנות ה-30.'
    },
    {
        id: 'rosa_levi', fullName: 'רוזה לוי', birthYear: 1915, isAlive: false, gender: 'female'
    },
    {
        id: 'yosef_tzobari', fullName: 'יוסף צוברי', birthYear: 1920, deathYear: 2005, isAlive: false, gender: 'male'
    },
    {
        id: 'rachel_tzobari', fullName: 'רחל צוברי', maidenName: 'עוזרי', birthYear: 1928, deathYear: 2010, isAlive: false, gender: 'female'
    },
    {
        id: 'shimon_tzobari', fullName: 'שמעון צוברי', birthYear: 1925, deathYear: 2018, isAlive: false, gender: 'male', bio: 'בנו של זכריה מיונה. התאלמן מאשתו הראשונה צביה, ונישא לאחייניתו רבקה.'
    },
    {
        id: 'zvia_tzobari', fullName: 'צביה צוברי', birthYear: 1928, deathYear: 1960, isAlive: false, gender: 'female', bio: 'אשתו הראשונה של שמעון. נפטרה צעירה.'
    },

    // === דור 3: נישואים מורכבים וילדים ===
    {
        id: 'naomi_levi', fullName: 'נעמי לוי', maidenName: 'צוברי', birthYear: 1935, isAlive: true, gender: 'female', photoUrl: 'https://randomuser.me/api/portraits/women/55.jpg'
    },
    {
        id: 'yitzhak_levi', fullName: 'יצחק לוי', birthYear: 1930, isAlive: true, gender: 'male', photoUrl: 'https://randomuser.me/api/portraits/men/60.jpg'
    },
    {
        id: 'rivka_tzobari', fullName: 'רבקה צוברי', birthYear: 1945, isAlive: true, gender: 'female'
    },
    {
        id: 'hannah_goldberg', fullName: 'חנה גולדברג', maidenName: 'לוי', birthYear: 1938, isAlive: true, gender: 'female', bio: 'בתו של עזרא מארגנטינה.'
    },
    {
        id: 'carlos_goldberg', fullName: 'קרלוס גולדברג', birthYear: 1935, isAlive: true, gender: 'male'
    },
    {
        id: 'tamar_golan', fullName: 'תמר גולן', maidenName: 'צוברי', birthYear: 1945, isAlive: true, gender: 'female', bio: 'בתו של שמעון מנישואיו הראשונים לצביה.'
    },
    {
        id: 'baruch_golan', fullName: 'ברוך גולן', birthYear: 1940, isAlive: true, gender: 'male'
    },

    // === דור 4: הילדים הסוגרים מעגלים ===
    {
        id: 'david_levi', fullName: 'דוד לוי', birthYear: 1955, isAlive: true, gender: 'male', photoUrl: 'https://randomuser.me/api/portraits/men/40.jpg'
    },
    {
        id: 'sarah_levi', fullName: 'שרה לוי', maidenName: 'גולדברג', birthYear: 1960, isAlive: true, gender: 'female', bio: 'חזרה מארגנטינה ונישאה לדוד (שהוא קרוב משפחה רחוק שלה מצד משפחת לוי).', photoUrl: 'https://randomuser.me/api/portraits/women/42.jpg'
    },
    {
        id: 'eitan_tzobari', fullName: 'איתן צוברי', birthYear: 1965, isAlive: true, gender: 'male', photoUrl: 'https://randomuser.me/api/portraits/men/35.jpg'
    },
    {
        id: 'maya_golan', fullName: 'מאיה גולן', birthYear: 1970, isAlive: true, gender: 'female', bio: 'הבת של תמר. התגרשה מאיתן, למרות שהוא למעשה חצי-דוד שלה!'
    },

    // === דור 5 ו-6 ===
    {
        id: 'yael_tzobari_levi', fullName: 'יעל צוברי-לוי', birthYear: 1985, isAlive: true, gender: 'female', photoUrl: 'https://randomuser.me/api/portraits/women/25.jpg'
    },
    {
        id: 'noam_tzobari', fullName: 'נועם צוברי', birthYear: 1995, isAlive: true, gender: 'male', photoUrl: 'https://randomuser.me/api/portraits/men/26.jpg'
    },
    {
        id: 'ori_tzobari', fullName: 'אורי צוברי', birthYear: 2020, isAlive: true, gender: 'male', photoUrl: 'https://randomuser.me/api/portraits/lego/3.jpg'
    }
];

export const initialUnions: Union[] = [
    // דור 0
    { id: 'u_salem_rumia', status: 'married', marriageYear: 1880 },
    { id: 'u_yihye_saada', status: 'married', marriageYear: 1905 },
    { id: 'u_amram_badra', status: 'married', marriageYear: 1908 },

    // דור 1
    { id: 'union_zech_shosh', status: 'married', marriageYear: 1910 },
    { id: 'union_zech_yonah', status: 'married', marriageYear: 1923 },

    // דור 2
    { id: 'union_avr_mazal', status: 'married', marriageYear: 1933 },
    { id: 'union_yos_rach', status: 'married', marriageYear: 1943 },
    { id: 'union_mir_shalom', status: 'married', marriageYear: 1929 },
    { id: 'union_ezra_rosa', status: 'married', marriageYear: 1935 },
    { id: 'union_shimon_zvia', status: 'married', marriageYear: 1943 }, // נישואים ראשונים לשמעון

    // דור 3
    { id: 'union_yitzhak_naomi', status: 'married', marriageYear: 1953 },
    { id: 'union_carlos_hannah', status: 'married', marriageYear: 1958 },
    { id: 'union_shimon_rivka', status: 'married', marriageYear: 1963 }, // נישואים שניים לשמעון
    { id: 'union_baruch_tamar', status: 'married', marriageYear: 1965 },

    // דור 4
    { id: 'union_david_sarah', status: 'married', marriageYear: 1982 },
    { id: 'union_eitan_maya', status: 'divorced', marriageYear: 1993, divorceYear: 2000 },

    // דור 5
    { id: 'union_yael_noam', status: 'married', marriageYear: 2018 },
];

export const initialLinks: PersonUnionLink[] = [
    // === חיבורי דור 0 ===
    { id: 'l_01', personId: 'mori_salem_arusi', unionId: 'u_salem_rumia', role: 'partner' },
    { id: 'l_02', personId: 'rumia_arusi', unionId: 'u_salem_rumia', role: 'partner' },
    { id: 'l_03', personId: 'shoshana_tzobari', unionId: 'u_salem_rumia', role: 'child' },
    { id: 'l_04', personId: 'badra_levi', unionId: 'u_salem_rumia', role: 'child' },

    { id: 'l_05', personId: 'amram_levi', unionId: 'u_amram_badra', role: 'partner' },
    { id: 'l_06', personId: 'badra_levi', unionId: 'u_amram_badra', role: 'partner' },
    { id: 'l_07', personId: 'shalom_levi', unionId: 'u_amram_badra', role: 'child' },
    { id: 'l_08', personId: 'ezra_levi', unionId: 'u_amram_badra', role: 'child' },

    { id: 'l_09', personId: 'yihye_ozeri', unionId: 'u_yihye_saada', role: 'partner' },
    { id: 'l_10', personId: 'saada_ozeri', unionId: 'u_yihye_saada', role: 'partner' },
    { id: 'l_11', personId: 'mazal_tzobari', unionId: 'u_yihye_saada', role: 'child' },
    { id: 'l_12', personId: 'rachel_tzobari', unionId: 'u_yihye_saada', role: 'child' },

    // === חיבורי זכריה ===
    { id: 'l_13', personId: 'zecharia_tzobari', unionId: 'union_zech_shosh', role: 'partner' },
    { id: 'l_14', personId: 'shoshana_tzobari', unionId: 'union_zech_shosh', role: 'partner' },
    { id: 'l_15', personId: 'avraham_tzobari', unionId: 'union_zech_shosh', role: 'child' },
    { id: 'l_16', personId: 'miriam_levi', unionId: 'union_zech_shosh', role: 'child' },
    { id: 'l_17', personId: 'yosef_tzobari', unionId: 'union_zech_shosh', role: 'child' },

    { id: 'l_18', personId: 'zecharia_tzobari', unionId: 'union_zech_yonah', role: 'partner' },
    { id: 'l_19', personId: 'yonah_tzobari', unionId: 'union_zech_yonah', role: 'partner' },
    { id: 'l_20', personId: 'shimon_tzobari', unionId: 'union_zech_yonah', role: 'child' },

    // === אחים שמתחתנים עם אחיות ===
    { id: 'l_21', personId: 'avraham_tzobari', unionId: 'union_avr_mazal', role: 'partner' },
    { id: 'l_22', personId: 'mazal_tzobari', unionId: 'union_avr_mazal', role: 'partner' },
    { id: 'l_23', personId: 'naomi_levi', unionId: 'union_avr_mazal', role: 'child' },

    { id: 'l_24', personId: 'yosef_tzobari', unionId: 'union_yos_rach', role: 'partner' },
    { id: 'l_25', personId: 'rachel_tzobari', unionId: 'union_yos_rach', role: 'partner' },
    { id: 'l_26', personId: 'rivka_tzobari', unionId: 'union_yos_rach', role: 'child' },

    // === הענף של לוי וארגנטינה ===
    { id: 'l_27', personId: 'miriam_levi', unionId: 'union_mir_shalom', role: 'partner' },
    { id: 'l_28', personId: 'shalom_levi', unionId: 'union_mir_shalom', role: 'partner' },
    { id: 'l_29', personId: 'yitzhak_levi', unionId: 'union_mir_shalom', role: 'child' },

    { id: 'l_30', personId: 'ezra_levi', unionId: 'union_ezra_rosa', role: 'partner' },
    { id: 'l_31', personId: 'rosa_levi', unionId: 'union_ezra_rosa', role: 'partner' },
    { id: 'l_32', personId: 'hannah_goldberg', unionId: 'union_ezra_rosa', role: 'child' },

    { id: 'l_33', personId: 'carlos_goldberg', unionId: 'union_carlos_hannah', role: 'partner' },
    { id: 'l_34', personId: 'hannah_goldberg', unionId: 'union_carlos_hannah', role: 'partner' },
    { id: 'l_35', personId: 'sarah_levi', unionId: 'union_carlos_hannah', role: 'child' },

    // === חייו המורכבים של שמעון צוברי ===
    { id: 'l_36', personId: 'shimon_tzobari', unionId: 'union_shimon_zvia', role: 'partner' },
    { id: 'l_37', personId: 'zvia_tzobari', unionId: 'union_shimon_zvia', role: 'partner' },
    { id: 'l_38', personId: 'tamar_golan', unionId: 'union_shimon_zvia', role: 'child' },

    { id: 'l_39', personId: 'baruch_golan', unionId: 'union_baruch_tamar', role: 'partner' },
    { id: 'l_40', personId: 'tamar_golan', unionId: 'union_baruch_tamar', role: 'partner' },
    { id: 'l_41', personId: 'maya_golan', unionId: 'union_baruch_tamar', role: 'child' },

    { id: 'l_42', personId: 'shimon_tzobari', unionId: 'union_shimon_rivka', role: 'partner' },
    { id: 'l_43', personId: 'rivka_tzobari', unionId: 'union_shimon_rivka', role: 'partner' },
    { id: 'l_44', personId: 'eitan_tzobari', unionId: 'union_shimon_rivka', role: 'child' },

    // === נישואי בני הדודים למטה ===
    { id: 'l_45', personId: 'yitzhak_levi', unionId: 'union_yitzhak_naomi', role: 'partner' },
    { id: 'l_46', personId: 'naomi_levi', unionId: 'union_yitzhak_naomi', role: 'partner' },
    { id: 'l_47', personId: 'david_levi', unionId: 'union_yitzhak_naomi', role: 'child' },

    { id: 'l_48', personId: 'david_levi', unionId: 'union_david_sarah', role: 'partner' },
    { id: 'l_49', personId: 'sarah_levi', unionId: 'union_david_sarah', role: 'partner' },
    { id: 'l_50', personId: 'yael_tzobari_levi', unionId: 'union_david_sarah', role: 'child' },

    { id: 'l_51', personId: 'eitan_tzobari', unionId: 'union_eitan_maya', role: 'partner' },
    { id: 'l_52', personId: 'maya_golan', unionId: 'union_eitan_maya', role: 'partner' },
    { id: 'l_53', personId: 'noam_tzobari', unionId: 'union_eitan_maya', role: 'child' },

    { id: 'l_54', personId: 'yael_tzobari_levi', unionId: 'union_yael_noam', role: 'partner' },
    { id: 'l_55', personId: 'noam_tzobari', unionId: 'union_yael_noam', role: 'partner' },
    { id: 'l_56', personId: 'ori_tzobari', unionId: 'union_yael_noam', role: 'child' },
];