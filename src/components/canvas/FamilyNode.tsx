'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';

import { useRouter } from 'next/navigation';
import { useFamilyStore } from '../../lib/store';
import { Person } from '../../lib/types';

export type FamilyMemberNode = Node<{
  person: Person;
  isMarried?: boolean;
  parentCount?: number;
  familyColor?: string;
  nodeRole?: 'focus' | 'blood' | 'entry-point';
}, 'familyMember'>;

export const FamilyNode = memo(({ id, data }: NodeProps<FamilyMemberNode>) => {
  const { person, isMarried = false, parentCount = 0, familyColor, nodeRole } = data;
  const { links, setFocusUnion, openAddDrawer, highlightedNodeId, setFocusPersonId } = useFamilyStore();
  const router = useRouter();

  const isMale = person.gender === 'male';
  const currentYear = new Date().getFullYear();

  // חישוב גיל: אם חסר שנת לידה, נניח שהוא לא מבוגר (כדי לא להציג כפתורי נישואין בטעות לילדים), אלא אם הוא נפטר
  const isAdult = person.isAlive ? (currentYear - (person.birthYear || currentYear) >= 18) : true;
  const isHighlighted = highlightedNodeId === id;

  // הגדרת צבעים דינמית לפי מגדר (Theme)
  const theme = isMale ? {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-200',
  } : {
    bg: 'bg-pink-100',
    text: 'text-rose-900',
    border: 'border-pink-200',
  };

  const containerBg = isHighlighted ? 'bg-white' : theme.bg;

  const containerClasses = [
    'relative w-[280px] h-[90px] rounded-2xl border flex flex-row items-center p-3 transition-all duration-300 cursor-pointer',
    containerBg,
    isHighlighted
      ? 'ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse border-amber-400 z-50'
      : 'shadow-md hover:shadow-lg border-slate-200'
  ].join(' ');

  const initials = person.fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dateText = person.isAlive
    ? (person.birthYear ? String(person.birthYear) : '')
    : (person.birthYear || person.deathYear)
      ? `${person.deathYear || '?'} - ${person.birthYear || '?'}`
      : '';



  const handleOpenCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/person/${person.id}`);
  };

  const handleAddParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddDrawer({ action: 'add_parent', sourcePersonId: person.id });
  };

  const handleAddPartner = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddDrawer({ action: 'add_partner', sourcePersonId: person.id });
  };

  const showParentTop = parentCount < 2;
  const showSpouseRight = !isMale && !isMarried && isAdult;
  const showSpouseLeft = isMale && !isMarried && isAdult;

  return (
    <div className={containerClasses} dir="ltr" onClick={handleOpenCard}>
      {/* קו "יתום" עולה למי שאין לו הורים במערכת */}
      {parentCount === 0 && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-t from-slate-300 to-transparent pointer-events-none" />
      )}

      {/* כפתור פוקוס למעבר שושלת - מופיע רק עבור בני זוג שהם נקודות קצה */}
      {nodeRole === 'entry-point' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const familyName = person.fullName.split(' ').pop() || '';
            const confirmed = window.confirm(`לעבור לעץ של משפחת ${familyName}?`);
            if (confirmed) {
              setFocusPersonId(person.id);
            }
          }}
          className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full text-white shadow-lg border-2 border-white flex items-center justify-center transition-transform hover:scale-110 z-50"
          title={`לעבור למשפחת ${person.fullName}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
        </button>
      )}

      {/* Family Identity Tag */}
      {familyColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl z-10"
          style={{ backgroundColor: familyColor }}
        />
      )}

      {/* תמונת פרופיל או ראשי תיבות */}
      <div className={`relative h-[65px] w-[65px] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm mr-4 ${theme.bg}`}>
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold opacity-70">{initials}</span>
        )}
      </div>

      {/* פרטי האדם */}
      <div className="flex flex-col flex-grow justify-center overflow-hidden" dir="rtl">
        <h3 className="font-bold text-[16px] truncate text-slate-800 leading-tight">
          {person.fullName}
        </h3>
        <span className="text-slate-500 text-[13px] mt-1 font-medium select-none ml-auto" dir="ltr" style={{ textAlign: 'right' }}>
          {dateText}
        </span>
      </div>



      {/* נקודות חיבור נסתרות (Invisible Handles) עבור React Flow
        משמשות למשיכת הקווים לנקודות הנכונות סביב הכרטיסייה (כמו ענפים) בלי להציג עיגול מכוער למשתמש 
      */}
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0" />
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 w-8 h-4" style={{ top: -4 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0" />
      <Handle type="source" position={Position.Left} id="left-out" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left-in" className="opacity-0 w-4 h-8" style={{ left: -4 }} />
      <Handle type="source" position={Position.Right} id="right-out" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right-in" className="opacity-0 w-4 h-8" style={{ right: -4 }} />

      {/* כפתורי הוספה מהירים (Buds) להורים/בני זוג */}
      {showParentTop && (
        <Handle
          type="source" position={Position.Top} id="add-parent"
          onClick={handleAddParent}
          title="הוסף הורה"
          className="w-4 h-4 !bg-slate-300 border-2 !border-white shadow-sm transition-transform hover:scale-150 cursor-pointer z-10"
        />
      )}

      {showSpouseRight && (
        <Handle
          type="source" position={Position.Right} id="add-spouse-right"
          onClick={handleAddPartner}
          title="הוסף בן זוג"
          className="w-4 h-4 !bg-blue-400 border-2 !border-white shadow-sm transition-transform hover:scale-150 cursor-pointer z-10"
        />
      )}

      {showSpouseLeft && (
        <Handle
          type="source" position={Position.Left} id="add-spouse-left"
          onClick={handleAddPartner}
          title="הוסף בת זוג"
          className="w-4 h-4 !bg-pink-400 border-2 !border-white shadow-sm transition-transform hover:scale-150 cursor-pointer z-10"
        />
      )}
    </div>
  );
});

FamilyNode.displayName = 'FamilyNode';