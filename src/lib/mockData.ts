import { Person, Union, PersonUnionLink } from './types';

export const initialPersons: Person[] = [
    // --- Avraham Family ---
    { id: 'arie_avraham', fullName: 'אריה אברהם', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'michal_avraham', fullName: 'מיכל אברהם', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'omer_avraham', fullName: 'עומר אברהם', birthYear: 1975, isAlive: true, gender: 'male' },
    { id: 'shira_avraham', fullName: 'שירה אברהם', birthYear: 1980, deathYear: 2023, isAlive: false, gender: 'female' },
    { id: 'yossi_avraham', fullName: 'יוסי אברהם', birthYear: 1982, isAlive: true, gender: 'male' },

    // --- Levi Family ---
    { id: 'itzhak_levi', fullName: 'יצחק לוי', birthYear: 1950, isAlive: true, gender: 'male' },
    { id: 'sara_levi', fullName: 'שרה לוי', birthYear: 1952, isAlive: true, gender: 'female' },
    { id: 'noa_levi', fullName: 'נועה לוי', birthYear: 1978, isAlive: true, gender: 'female' }, // Married to Omer

    // --- Yossi's Partners ---
    { id: 'dana_shemesh', fullName: 'דנה שמש', birthYear: 1984, isAlive: true, gender: 'female' }, // Divorced from Yossi
    { id: 'maya_levi', fullName: 'מאיה לוי', birthYear: 1985, isAlive: true, gender: 'female' }, // Yossi's current wife

    // --- Grandchildren (Omer & Noa's children) ---
    { id: 'uri_avraham', fullName: 'אורי אברהם', birthYear: 2005, isAlive: true, gender: 'male' },
    { id: 'yael_avraham', fullName: 'יעל אברהם', birthYear: 2010, isAlive: true, gender: 'female' },

    // --- Grandchildren (Yossi & Dana's children) ---
    { id: 'dan_avraham', fullName: 'דן אברהם', birthYear: 2008, isAlive: true, gender: 'male' },
    { id: 'noa_avraham_jr', fullName: 'נועה אברהם', birthYear: 2012, isAlive: true, gender: 'female' }, // Jr. added to avoid confusion with Noa Levi

    // --- Grandchildren's Partners ---
    { id: 'roni_cohen', fullName: 'רוני כהן', birthYear: 2009, isAlive: true, gender: 'female' }, // Dan's wife
    { id: 'adi_cohen', fullName: 'עדי כהן', birthYear: 2006, isAlive: true, gender: 'female' }, // Uri's ex-wife

    // --- Great-grandchildren ---
    { id: 'noam_avraham', fullName: 'נועם אברהם', birthYear: 2024, isAlive: true, gender: 'male' }, // Uri & Adi's son
];

export const initialUnions: Union[] = [
    { id: 'union_arie_michal', status: 'married', marriageYear: 1974 },
    { id: 'union_itzhak_sara', status: 'married', marriageYear: 1976 },
    { id: 'union_omer_noa', status: 'married', marriageYear: 1998 },
    { id: 'union_yossi_dana', status: 'divorced', marriageYear: 2004, divorceYear: 2012 },
    { id: 'union_yossi_maya', status: 'married', marriageYear: 2014 },
    { id: 'union_dan_roni', status: 'married', marriageYear: 2023 },
    { id: 'union_uri_adi', status: 'divorced', marriageYear: 2022, divorceYear: 2024 },
];

export const initialLinks: PersonUnionLink[] = [
    // Arie & Michal + Children
    { id: 'link_1', personId: 'arie_avraham', unionId: 'union_arie_michal', role: 'partner' },
    { id: 'link_2', personId: 'michal_avraham', unionId: 'union_arie_michal', role: 'partner' },
    { id: 'link_3', personId: 'omer_avraham', unionId: 'union_arie_michal', role: 'child' },
    { id: 'link_4', personId: 'shira_avraham', unionId: 'union_arie_michal', role: 'child' },
    { id: 'link_5', personId: 'yossi_avraham', unionId: 'union_arie_michal', role: 'child' },

    // Itzhak & Sara + Noa
    { id: 'link_6', personId: 'itzhak_levi', unionId: 'union_itzhak_sara', role: 'partner' },
    { id: 'link_7', personId: 'sara_levi', unionId: 'union_itzhak_sara', role: 'partner' },
    { id: 'link_8', personId: 'noa_levi', unionId: 'union_itzhak_sara', role: 'child' },

    // Omer & Noa + Children (Uri & Yael)
    { id: 'link_9', personId: 'omer_avraham', unionId: 'union_omer_noa', role: 'partner' },
    { id: 'link_10', personId: 'noa_levi', unionId: 'union_omer_noa', role: 'partner' },
    { id: 'link_11', personId: 'uri_avraham', unionId: 'union_omer_noa', role: 'child' },
    { id: 'link_12', personId: 'yael_avraham', unionId: 'union_omer_noa', role: 'child' },

    // Yossi & Dana (Divorced) + Children (Dan & Noa Jr)
    { id: 'link_13', personId: 'yossi_avraham', unionId: 'union_yossi_dana', role: 'partner' },
    { id: 'link_14', personId: 'dana_shemesh', unionId: 'union_yossi_dana', role: 'partner' },
    { id: 'link_15', personId: 'dan_avraham', unionId: 'union_yossi_dana', role: 'child' },
    { id: 'link_16', personId: 'noa_avraham_jr', unionId: 'union_yossi_dana', role: 'child' },

    // Yossi & Maya (Second marriage)
    { id: 'link_17', personId: 'yossi_avraham', unionId: 'union_yossi_maya', role: 'partner' },
    { id: 'link_18', personId: 'maya_levi', unionId: 'union_yossi_maya', role: 'partner' },

    // Dan & Roni
    { id: 'link_19', personId: 'dan_avraham', unionId: 'union_dan_roni', role: 'partner' },
    { id: 'link_20', personId: 'roni_cohen', unionId: 'union_dan_roni', role: 'partner' },

    // Uri & Adi (Divorced) + Noam
    { id: 'link_21', personId: 'uri_avraham', unionId: 'union_uri_adi', role: 'partner' },
    { id: 'link_22', personId: 'adi_cohen', unionId: 'union_uri_adi', role: 'partner' },
    { id: 'link_23', personId: 'noam_avraham', unionId: 'union_uri_adi', role: 'child' },
];