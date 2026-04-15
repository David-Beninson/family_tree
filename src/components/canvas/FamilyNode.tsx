'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Person } from '../../lib/types';
import { ChevronLeft } from 'lucide-react';

export type FamilyMemberNode = Node<{
  person: Person;
  isMarried?: boolean;
  parentCount?: number;
  isOrphan?: boolean;
}, 'familyMember'>;

// ─── Branch-Tip SVG (replaces the standard circle handle) ────────────────────
function BranchTip({ direction, color }: { direction: 'up' | 'down' | 'left' | 'right'; color: string }) {
  const rotations: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };
  const rot = rotations[direction];

  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18"
      style={{
        display: 'block',
        transform: `rotate(${rot}deg)`,
        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
      }}
    >
      {/* Branch stub with bark texture */}
      <path
        d="M 7 18 C 6.5 14, 6 10, 7 6 C 7.5 3, 8.5 1, 9 0.5 C 9.5 1, 10.5 3, 11 6 C 12 10, 11.5 14, 11 18 Z"
        fill={color}
      />
      {/* Bark grain line */}
      <line x1="9" y1="4" x2="9" y2="16" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" strokeLinecap="round" />
      {/* Tiny bud at tip */}
      <ellipse cx="9" cy="1.5" rx="2" ry="1.5" fill="#7cb342" opacity="0.7" />
    </svg>
  );
}

// ─── Orphan Anchor (branch stub pointing upward for unconnected parents) ─────
function OrphanAnchor() {
  return (
    <div
      style={{
        position: 'absolute',
        top: -28,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <svg width="16" height="28" viewBox="0 0 16 28">
        {/* Short cut-branch pointing upward */}
        <path
          d="M 6 28 C 5.5 22, 5 16, 6 10 C 6.5 6, 7 3, 7.5 1 C 8 0, 8.5 0, 9 1 C 9.5 3, 10 6, 10.5 10 C 11.5 16, 11 22, 10.5 28 Z"
          fill="#5c3a1a"
        />
        {/* Cut/broken surface at top */}
        <ellipse cx="8.2" cy="1.5" rx="2.5" ry="1.2" fill="#3b2507" />
        {/* Inner grain */}
        <ellipse cx="8.2" cy="1.5" rx="1.2" ry="0.6" fill="#7a4f2a" />
        {/* Bark grain lines */}
        <line x1="8" y1="4" x2="8" y2="24" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="9.5" y1="6" x2="9.5" y2="22" stroke="rgba(0,0,0,0.08)" strokeWidth="0.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Family Node Component
// ═══════════════════════════════════════════════════════════════════════════════
export const FamilyNode = memo(({ data }: NodeProps<FamilyMemberNode>) => {
  const { person } = data;
  const isMarried = data.isMarried;
  const parentCount = (data.parentCount) || 0;
  const isOrphan = data.isOrphan ?? false;

  const isMale = person.gender === 'male';
  const currentYear = new Date().getFullYear();
  const isAdult = person.isAlive ? (currentYear - person.birthYear >= 18) : true;

  // Earthy, warm tone cards instead of blue/pink
  const cardBg = isMale
    ? 'rgba(235, 225, 210, 0.95)'
    : 'rgba(240, 228, 218, 0.95)';
  const accentBg = isMale
    ? '#c9b896'
    : '#d4b5a0';
  const accentText = isMale ? '#5a4a35' : '#6b4a3a';
  const handleColor = isMale ? '#7a6040' : '#8b6050';

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

  const handleAlert = () => {
    window.alert(`פעולה זו פותחת את הכרטיס של: ${person.fullName}`);
  };

  // Handle visibility rules
  const showParentTop = parentCount < 2;
  const showSpouseRight = !isMale && !isMarried && isAdult;
  const showSpouseLeft = isMale && !isMarried && isAdult;

  return (
    <div
      style={{
        position: 'relative',
        width: 280,
        height: 90,
        borderRadius: 16,
        border: '1.5px solid rgba(120, 100, 70, 0.2)',
        background: cardBg,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        boxShadow: '0 4px 16px rgba(44, 30, 20, 0.12), 0 1px 3px rgba(44, 30, 20, 0.08)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: 'grab',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      dir="ltr"
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(44, 30, 20, 0.18), 0 2px 6px rgba(44, 30, 20, 0.12)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(44, 30, 20, 0.12), 0 1px 3px rgba(44, 30, 20, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* ── Orphan Anchor (stub pointing up for persons without parents) ── */}
      {isOrphan && !isMarried && <OrphanAnchor />}

      {/* ── Photo / Initials ── */}
      <div
        style={{
          position: 'relative',
          height: 65,
          width: 65,
          borderRadius: 12,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.6)',
          boxShadow: '0 2px 8px rgba(44,30,20,0.1)',
          marginRight: 16,
          background: accentBg,
        }}
      >
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.fullName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, opacity: 0.6, color: accentText }}>{initials}</span>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', overflow: 'hidden' }} dir="rtl">
        <h3 style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#3a2a1a', lineHeight: 1.2, margin: 0 }}>
          {person.fullName}
        </h3>
        <span style={{ color: '#8a7a65', fontSize: 13, marginTop: 4, fontWeight: 500, userSelect: 'none', textAlign: 'right' }} dir="ltr">
          {dateText}
        </span>
        {!person.isAlive && (
          <span style={{ fontSize: 10, color: '#a0907a', marginTop: 2 }}>ז״ל</span>
        )}
      </div>

      <button
        onClick={handleAlert}
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(120,100,70,0.06)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9a8a70',
          cursor: 'pointer',
          marginLeft: 8,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(120,100,70,0.12)';
          e.currentTarget.style.color = '#5a4a35';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(120,100,70,0.06)';
          e.currentTarget.style.color = '#9a8a70';
        }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* ═══ INVISIBLE ROUTING HANDLES (ALL DIRECTIONS) ═══ */}
      {/* חיבור מלמטה/למעלה לילדים והורים */}
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0 !w-1 !h-1" />
      {/* גיבוי למקרה הצורך */}
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 !w-1 !h-1" />

      {/* חיבור לצדדים עבור בני הזוג (סימטריה מגדרית) */}
      <Handle type="source" position={Position.Right} id="right-out" className="opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Right} id="right-in" className="opacity-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Left} id="left-out" className="opacity-0 !w-1 !h-1" />
      <Handle type="target" position={Position.Left} id="left-in" className="opacity-0 !w-1 !h-1" />
      {/* Add Parent — branch stub pointing up */}
      {showParentTop && (
        <Handle
          type="source" position={Position.Top} id="add-parent"
          onClick={(e) => { e.stopPropagation(); window.alert('(קליק) פעולה זו תפתח חלון הוספת: הורה לכרטיסייה!'); }}
          className="branch-handle"
          style={{
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BranchTip direction="up" color={handleColor} />
        </Handle>
      )}

      {/* Add Spouse Right — branch stub pointing right (for Female) */}
      {showSpouseRight && (
        <Handle
          type="source" position={Position.Right} id="add-spouse-right"
          onClick={(e) => { e.stopPropagation(); window.alert('(קליק) פעולה זו תפתח חלון הוספת: בן/בת זוג!'); }}
          className="branch-handle"
          style={{ cursor: 'pointer', zIndex: 10 }}
        >
          <BranchTip direction="right" color={handleColor} />
        </Handle>
      )}

      {/* Add Spouse Left — branch stub pointing left (for Male) */}
      {showSpouseLeft && (
        <Handle
          type="source" position={Position.Left} id="add-spouse-left"
          onClick={(e) => { e.stopPropagation(); window.alert('(קליק) פעולה זו תפתח חלון הוספת: בן/בת זוג!'); }}
          className="branch-handle"
          style={{ cursor: 'pointer', zIndex: 10 }}
        >
          <BranchTip direction="left" color={handleColor} />
        </Handle>
      )}
    </div>
  );
});

FamilyNode.displayName = 'FamilyNode';
