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
  const { person, isMarried = false, parentCount = 0 } = data;
  const { links, setFocusUnion, openAddDrawer, highlightedNodeId } = useFamilyStore();

  const isMale = person.gender === 'male';
  const currentYear = new Date().getFullYear();
  // Safe calculation in case birthYear is missing
  const isAdult = person.isAlive ? (currentYear - (person.birthYear || currentYear) >= 18) : true;
  const isHighlighted = highlightedNodeId === id;

  // Theme definition for consistent styling based on gender
  const theme = isMale ? {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-200',
  } : {
    bg: 'bg-pink-100',
    text: 'text-rose-900',
    border: 'border-pink-200',
  };

  // Resolve container background cleanly
  const containerBg = isHighlighted ? 'bg-white' : theme.bg;

  const containerClasses = [
    'relative w-[280px] h-[90px] rounded-2xl border flex flex-row items-center p-3 transition-all duration-300',
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
    ? `${person.birthYear || ''}`
    : `${person.deathYear || ''} - ${person.birthYear || ''}`;

  const handleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prioritize focusing on partner union, fallback to child union
    const unionLink = 
      links.find(l => l.personId === person.id && l.role === 'partner') ||
      links.find(l => l.personId === person.id && l.role === 'child');

    if (unionLink) setFocusUnion(unionLink.unionId);
    else window.alert('לאדם זה אין משפחה מקושרת למיקוד');
  };

  const handleOpenCard = () => {
    window.alert(`פעולה זו פותחת את הכרטיס של: ${person.fullName}`);
  };

  const handleAddParent = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddDrawer({ action: 'add_parent', sourcePersonId: person.id });
  };

  const handleAddPartner = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAddDrawer({ action: 'add_partner', sourcePersonId: person.id });
  };

  // Node connection handles display logic
  const showParentTop = parentCount < 2;
  const showSpouseRight = !isMale && !isMarried && isAdult;
  const showSpouseLeft = isMale && !isMarried && isAdult;

  return (
    <div className={containerClasses} dir="ltr">
      {/* Avatar */}
      <div className={`relative h-[65px] w-[65px] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm mr-4 ${theme.bg}`}>
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.fullName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold opacity-70">{initials}</span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-grow justify-center overflow-hidden" dir="rtl">
        <h3 className="font-bold text-[16px] truncate text-slate-800 leading-tight">
          {person.fullName}
        </h3>
        <span className="text-slate-500 text-[13px] mt-1 font-medium select-none ml-auto" dir="ltr" style={{ textAlign: 'right' }}>
          {dateText}
        </span>
      </div>

      {/* Actions */}
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
          title="פתח כרטיס אדם"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Invisible routing handles */}
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0" />
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0" />
      <Handle type="source" position={Position.Left} id="left-out" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left-in" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="right-out" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right-in" className="opacity-0" />

      {/* Interactive bud handles */}
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
