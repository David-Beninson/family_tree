import { Person, Union, PersonUnionLink } from './types';

export const initialPersons: Person[] = [
    // --- משפחת אברהם ---
    {
        id: 'arie_avraham',
        fullName: 'אריה אברהם',
        birthYear: 1950,
        birthDate: '1950-05-14',
        birthPlace: 'תל אביב, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'מהנדס בניין',
        bio: 'אריה נולד בתל אביב וגדל בשכונת פלורנטין. הוא מהנדס בניין מוסמך שעבד בחברות המובילות בישראל. בזמנו הפנוי אוהב לקרוא ספרי היסטוריה, לטייל בטבע ולבלות עם הנכדים.',
        phoneNumber: '050-1234567',
        email: 'arie.avraham@example.com',
        address: { country: 'ישראל', city: 'חיפה', street: 'שדרות מוריה 15' },
        socialLinks: { facebook: 'facebook.com/arie.avraham', linkedin: 'linkedin.com/in/arie-avraham' },
        photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg'
    },
    {
        id: 'michal_avraham',
        fullName: 'מיכל אברהם',
        maidenName: 'כהן',
        birthYear: 1952,
        birthDate: '1952-08-22',
        birthPlace: 'ירושלים, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'מורה לספרות (בפנסיה)',
        bio: 'מיכל עבדה כמורה לספרות בתיכון למעלה מ-30 שנה וחינכה דורות של תלמידים. היא חובבת אמנות קלאסית ונוהגת לצייר בצבעי מים בזמנה הפנוי.',
        phoneNumber: '052-7654321',
        email: 'michal.avr@example.com',
        address: { country: 'ישראל', city: 'חיפה', street: 'שדרות מוריה 15' },
        socialLinks: { facebook: 'facebook.com/michal.art' },
        photoUrl: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
        id: 'omer_avraham',
        fullName: 'עומר אברהם',
        birthYear: 1975,
        birthDate: '1975-03-10',
        birthPlace: 'חיפה, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'סמנכ"ל מוצר',
        bio: 'עומר מכהן כסמנכ"ל מוצר בחברת פינטק גלובלית. הוא ידוע בחיבתו לספורט אתגרי ורוכב על אופני הרים בכל סוף שבוע.',
        phoneNumber: '054-9876543',
        email: 'omer.product@example.com',
        address: { country: 'ישראל', city: 'תל אביב', street: 'שדרות רוטשילד 100' },
        socialLinks: { linkedin: 'linkedin.com/in/omer-avraham', instagram: 'instagram.com/omer_rides' },
        photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
        id: 'shira_avraham',
        fullName: 'שירה אברהם',
        birthYear: 1980,
        birthDate: '1980-11-05',
        birthPlace: 'חיפה, ישראל',
        deathYear: 2023,
        deathDate: '2023-01-15',
        deathPlace: 'רמת גן, ישראל',
        burialPlace: 'בית העלמין ירקון, חלקה ג',
        isAlive: false,
        gender: 'female',
        occupation: 'עורכת דין',
        bio: 'שירה הייתה עורכת דין מבריקה ומוערכת בתחום זכויות האדם. היא הקדישה את חייה להתנדבות וסיוע למעוטי יכולת ולימדה משפטים באוניברסיטה.',
        photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
        id: 'yossi_avraham',
        fullName: 'יוסי אברהם',
        birthYear: 1982,
        birthDate: '1982-07-30',
        birthPlace: 'חיפה, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'שף ובעלים של מסעדה',
        bio: 'יוסי למד קולינריה בפריז ועבד במסעדות מישלן לפני שחזר לארץ. כיום הוא השף והבעלים של מסעדת פיוז\'ן מצליחה בירושלים.',
        phoneNumber: '058-1112233',
        email: 'chef.yossi@example.com',
        address: { country: 'ישראל', city: 'ירושלים', street: 'אגריפס 12' },
        socialLinks: { instagram: 'instagram.com/chef.yossi', facebook: 'facebook.com/yossi.chef' },
        photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg'
    },

    // --- משפחת לוי ---
    {
        id: 'itzhak_levi',
        fullName: 'יצחק לוי',
        birthYear: 1950,
        birthDate: '1950-02-18',
        birthPlace: 'רחובות, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'חקלאי ויו"ר ועד המושב',
        bio: 'יצחק מנהל משק חקלאי גדול העובר במשפחה דורות. הוא מתמחה בגידול פירות הדר ומפיק שמן זית עטור פרסים המשווק לכל הארץ.',
        phoneNumber: '050-4445555',
        address: { country: 'ישראל', city: 'מושב כפר חיים', street: 'דרך הפרדסים 3' },
        photoUrl: 'https://randomuser.me/api/portraits/men/60.jpg'
    },
    {
        id: 'sara_levi',
        fullName: 'שרה לוי',
        maidenName: 'גרינברג',
        birthYear: 1952,
        birthDate: '1952-12-01',
        birthPlace: 'פתח תקווה, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'אחות מוסמכת במחלקת ילדים',
        bio: 'שרה שימשה כאחות ראשית במחלקת ילדים במשך עשורים. כיום בפנסיה, נהנית לאפות עוגות שמרים מפורסמות ולטפל בנכדים שמגיעים למושב.',
        phoneNumber: '052-8889999',
        address: { country: 'ישראל', city: 'מושב כפר חיים', street: 'דרך הפרדסים 3' },
        photoUrl: 'https://randomuser.me/api/portraits/women/60.jpg'
    },
    {
        id: 'noa_levi',
        fullName: 'נועה לוי',
        birthYear: 1978,
        birthDate: '1978-09-14',
        birthPlace: 'מושב כפר חיים, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'אדריכלית פנים',
        bio: 'נועה היא אדריכלית בעלת סטודיו לעיצוב פנים, המתמחה בבנייה ירוקה וחללים מודרניים. היא נפגשה עם עומר במהלך הרצאה על טכנולוגיה ועיצוב.',
        phoneNumber: '054-2223344',
        email: 'noa.arch@example.com',
        address: { country: 'ישראל', city: 'תל אביב', street: 'שדרות רוטשילד 100' },
        socialLinks: { instagram: 'instagram.com/noa.designs', linkedin: 'linkedin.com/in/noa-levi' },
        photoUrl: 'https://randomuser.me/api/portraits/women/32.jpg'
    },

    // --- בנות הזוג של יוסי ---
    {
        id: 'dana_shemesh',
        fullName: 'דנה שמש',
        birthYear: 1984,
        birthDate: '1984-04-20',
        birthPlace: 'ראשון לציון, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'רואת חשבון',
        bio: 'דנה מנהלת משרד רואי חשבון עצמאי. היא חובבת יוגה, טיולי טרקים בחו"ל ומקפידה על תזונה טבעונית.',
        phoneNumber: '053-5556677',
        email: 'dana.cpa@example.com',
        address: { country: 'ישראל', city: 'ראשון לציון', street: 'הרצל 40' },
        photoUrl: 'https://randomuser.me/api/portraits/women/40.jpg'
    },
    {
        id: 'maya_levi',
        fullName: 'מאיה לוי',
        birthYear: 1985,
        birthDate: '1985-06-08',
        birthPlace: 'נתניה, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'מעצבת גרפית ומאיירת',
        bio: 'מאיה היא מאיירת ספרי ילדים ויוצרת קומיקס פרילנסרית. הכירה את יוסי כשהגיעה לעצב לו את תפריט המסעדה, והשאר היסטוריה.',
        phoneNumber: '050-9998877',
        email: 'maya.art@example.com',
        address: { country: 'ישראל', city: 'ירושלים', street: 'אגריפס 12' },
        socialLinks: { instagram: 'instagram.com/maya_illustrates' },
        photoUrl: 'https://randomuser.me/api/portraits/women/38.jpg'
    },

    // --- הנכדים (ילדים של עומר ונועה) ---
    {
        id: 'uri_avraham',
        fullName: 'אורי אברהם',
        birthYear: 2005,
        birthDate: '2005-01-22',
        birthPlace: 'תל אביב, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'חייל בסדיר',
        bio: 'אורי משרת כרגע ביחידה מובחרת בצה"ל. לפני הצבא עשה שנת שירות בצפון והדריך בני נוער. חובב נגינה בגיטרה.',
        phoneNumber: '052-3334455',
        socialLinks: { instagram: 'instagram.com/uri_avr' },
        photoUrl: 'https://randomuser.me/api/portraits/men/20.jpg'
    },
    {
        id: 'yael_avraham',
        fullName: 'יעל אברהם',
        birthYear: 2010,
        birthDate: '2010-10-10',
        birthPlace: 'תל אביב, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'תלמידת תיכון',
        bio: 'יעל לומדת במגמת מחול ותיאטרון. רוקדת בלט קלאסי מגיל צעיר וחולמת להופיע על במות בינלאומיות.',
        photoUrl: 'https://randomuser.me/api/portraits/women/15.jpg'
    },

    // --- הנכדים (ילדים של יוסי ודנה) ---
    {
        id: 'dan_avraham',
        fullName: 'דן אברהם',
        birthYear: 2008,
        birthDate: '2008-05-18',
        birthPlace: 'ירושלים, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'תלמיד ושחקן כדורסל',
        bio: 'דן הוא שחקן כדורסל מצטיין בקבוצת הנוער של הפועל ירושלים. מתנשא לגובה 1.90 ונחשב להבטחה גדולה.',
        phoneNumber: '054-7778899',
        photoUrl: 'https://randomuser.me/api/portraits/men/18.jpg'
    },
    {
        id: 'noa_avraham_jr',
        fullName: 'נועה אברהם',
        birthYear: 2012,
        birthDate: '2012-03-03',
        birthPlace: 'ראשון לציון, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'תלמידה בחטיבת ביניים',
        bio: 'נועה הצעירה אוהבת מאוד בעלי חיים, מתנדבת בעמותה לאימוץ כלבים וחולמת להיות וטרינרית כשתגדל.',
        photoUrl: 'https://randomuser.me/api/portraits/women/12.jpg'
    },

    // --- בני/בנות זוג של הנכדים ---
    {
        id: 'roni_cohen',
        fullName: 'רוני כהן',
        birthYear: 2009,
        birthDate: '2009-08-11',
        birthPlace: 'מודיעין, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'עתודאית למדעי המחשב',
        bio: 'רוני היא אלופת הארץ לנוער בשחמט (לשעבר). כיום לומדת מדעי המחשב באוניברסיטה במסגרת עתודה אקדמית.',
        photoUrl: 'https://randomuser.me/api/portraits/women/18.jpg'
    },
    {
        id: 'adi_cohen',
        fullName: 'עדי כהן',
        birthYear: 2006,
        birthDate: '2006-11-25',
        birthPlace: 'כפר סבא, ישראל',
        isAlive: true,
        gender: 'female',
        occupation: 'מפתחת תוכנה (חיילת)',
        bio: 'עדי משרתת ביחידת סייבר מובחרת. היא חובבת צילום אנלוגי ומנהלת בלוג צילום משלה.',
        phoneNumber: '050-1122334',
        email: 'adi.cohen.dev@example.com',
        socialLinks: { linkedin: 'linkedin.com/in/adi-cohen', instagram: 'instagram.com/adi_film_camera' },
        photoUrl: 'https://randomuser.me/api/portraits/women/20.jpg'
    },

    // --- נינים ---
    {
        id: 'noam_avraham',
        fullName: 'נועם אברהם',
        birthYear: 2024,
        birthDate: '2024-02-10',
        birthPlace: 'תל אביב, ישראל',
        isAlive: true,
        gender: 'male',
        occupation: 'תינוק',
        bio: 'נועם הוא התוספת החדשה, המקסימה והמרגשת למשפחת אברהם. בינתיים הוא בעיקר אוכל, ישן ומחייך.',
        photoUrl: 'https://randomuser.me/api/portraits/lego/1.jpg'
    },
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