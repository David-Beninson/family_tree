'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { ChevronLeft, Target } from 'lucide-react';
import { useFamilyStore } from '../../lib/store';
import { Person } from '../../lib/types';

export type FamilyMemberNode = Node<{
  person: Person;
  isMarried?: boolean;
  parentCount?: number;
}, 'familyMember'>;

export const FamilyNode = memo(({ id, data }: NodeProps<FamilyMemberNode>) => {
  const { person } = data;
  const isMarried = data.isMarried;
  const parentCount = (data.parentCount) || 0;

  const { links, setFocusUnion, openAddDrawer } = useFamilyStore();

  const isMale = person.gender === 'male';
  const currentYear = new Date().getFullYear();
  const isAdult = person.isAlive ? (currentYear - person.birthYear >= 18) : true;

  const colorClass = isMale
    ? 'bg-blue-100 text-blue-900 border-blue-200'
    : 'bg-pink-100 text-rose-900 border-pink-200';

  const initials = person.fullName
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dateText = person.isAlive
    ? `${person.birthYear}`
    : `${person.deathYear} - ${person.birthYear}`;

  const handleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const partnerLink = links.find(l => l.personId === person.id && l.role === 'partner');
    const childLink   = links.find(l => l.personId === person.id && l.role === 'child');

    if (partnerLink)     setFocusUnion(partnerLink.unionId);
    else if (childLink)  setFocusUnion(childLink.unionId);
    else                 window.alert('לאדם זה אין משפחה מקושרת למיקוד');
  };

  const handleOpenCard = () => {
    window.alert(`פעולה זו פותחת את הכרטיס של: ${person.fullName}`);
  };

  // תנאים להצגת ניצנים
  const showParentTop    = parentCount < 2;
  const showSpouseRight  = !isMale && !isMarried && isAdult;
  const showSpouseLeft   = isMale  && !isMarried && isAdult;

  // handlers לניצנים
  const handleAddParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddDrawer({ action: 'add_parent', sourcePersonId: person.id });
  };

  const handleAddPartner = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddDrawer({ action: 'add_partner', sourcePersonId: person.id });
  };

  return (
    <div
      className={`relative w-[280px] h-[90px] rounded-2xl border bg-white flex flex-row items-center p-3 shadow-md hover:shadow-lg transition-transform ${colorClass.replace(/bg-.* border-.*/, 'border-slate-200')}`}
      dir="ltr"
    >
      {/* Photo / initials */}
      <div className={`relative h-[65px] w-[65px] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm mr-4 ${colorClass.split(' ')[0]}`}>
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold opacity-70">{initials}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow justify-center overflow-hidden" dir="rtl">
        <h3 className="font-bold text-[16px] truncate text-slate-800 leading-tight">
          {person.fullName}
        </h3>
        <span className="text-slate-500 text-[13px] mt-1 font-medium select-none ml-auto" dir="ltr" style={{ textAlign: 'right' }}>
          {dateText}
        </span>
      </div>

      <div className="flex flex-row gap-1">
        <button
          onClick={handleFocus}
          title="התמקד במשפחה של אדם זה"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 hover:text-blue-700 transition-colors"
        >
          <Target className="w-5 h-5" />
        </button>

        <button
          onClick={handleOpenCard}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* === Invisible routing handles === */}
      <Handle type="source" position={Position.Top}    id="top-source"    className="opacity-0" />
      <Handle type="target" position={Position.Top}    id="top-target"    className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0" />
      <Handle type="source" position={Position.Left}   id="left-out"      className="opacity-0" />
      <Handle type="target" position={Position.Left}   id="left-in"       className="opacity-0" />
      <Handle type="source" position={Position.Right}  id="right-out"     className="opacity-0" />
      <Handle type="target" position={Position.Right}  id="right-in"      className="opacity-0" />

      {/* === Visible bud handles === */}

      {/* Add Parent (Top) */}
      {showParentTop && (
        <Handle
          type="source" position={Position.Top} id="add-parent"
          onClick={handleAddParent}
          title="הוסף הורה"
          className="w-4 h-4 !bg-slate-300 border-2 !border-white shadow-sm transition-transform hover:scale-150 cursor-pointer z-10"
        />
      )}

      {/* Add Spouse Right (for Female) */}
      {showSpouseRight && (
        <Handle
          type="source" position={Position.Right} id="add-spouse-right"
          onClick={handleAddPartner}
          title="הוסף בן זוג"
          className="w-4 h-4 !bg-blue-400 border-2 !border-white shadow-sm transition-transform hover:scale-150 cursor-pointer z-10"
        />
      )}

      {/* Add Spouse Left (for Male) */}
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
