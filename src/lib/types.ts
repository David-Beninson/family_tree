import { Node } from '@xyflow/react';

/**
 * 1. ישות האדם (The Person Entity)
 */
export type Person = {
  // --- מידע קריטי ללוגיקה ---
  id: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  isAlive: boolean;

  /** * המשתנה ה"טריקי": רשימת מזהי השושלת שהאדם שייך אליהם.
   * אם נרצה להציג את "עץ משפחת אברהם", לכל הצאצאים שלו יהיה 'avraham' במערך הזה.
   */
  bloodlineIds: string[];

  // --- מידע גנאלוגי ---
  maidenName?: string;
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string;

  // --- מידע ביוגרפי וקישורים חברתיים ---
  metadata?: {
    birthPlace?: string;
    occupation?: string;
    bio?: string;
    contact?: {
      email?: string;
      phone?: string;
    };
    // הוספת קישורים חברתיים לבקשתך
    socialLinks?: {
      facebook?: string;
      whatsapp?: string; // יכול לשמש לשליחת הודעה ישירה
      instagram?: string;
      linkedin?: string;
    };
  };
};

/**
 * 2. איחוד/תא משפחתי (The Union)
 */
export type Union = {
  id: string;
  status: 'married' | 'divorced' | 'partnered' | 'separated';
  marriageYear?: number;
  divorceYear?: number;
  isSprinkler?: boolean;
};

/**
 * 3. הקישור (The Link)
 */
export type PersonUnionLink = {
  id: string;
  personId: string;
  unionId: string;
  role: 'partner' | 'child';
};

/**
 * 4. טיפוסים של React Flow (Visual Nodes)
 */
export type FamilyMemberNode = Node<{
  person: Person;
  nodeRole: 'focus' | 'blood' | 'entry-point';

  /**
   * משתנה עזר לחישוב התצוגה: 
   * האם האדם הוא חלק מהשושלת הישירה שנבחרה? (למשל צאצא ישיר של הסבא)
   */
  isDirectLineage: boolean;

  familyColor?: string;
  parentCount?: number;
  isMarried?: boolean;
}, 'familyMember'>;

/**
 * 5. ניהול ה-Layout (מתמטיקה)
 */
export type BoundingBox = {
  width: number;
  leftX: number;
  rightX: number;
};

/**
 * 6. הקשר הוספה (UI Context)
 */
export type AddContext =
  | { action: 'add_partner'; sourcePersonId: string }
  | { action: 'add_child'; sourceUnionId: string }
  | { action: 'add_parent'; sourcePersonId: string }
  | { action: 'add_root' };

/**
 * 7. טפסים והעברות נתונים (Payloads)
 */
export interface AddFamilyMemberPayload {
  primary: Partial<Person> & { fullName: string; gender: Person['gender'] };
  unionStatus?: Union['status'];
  secondParent?: Partial<Person>;
}