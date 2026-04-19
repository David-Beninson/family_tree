'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FamilyMemberNode, BudConfig } from '../../lib/types';
import { ChevronLeft } from 'lucide-react';

type BranchBudProps = BudConfig & {
  personId: string;
  personName: string;
};

// ─── Unified Interactive Bud Component ──────────────────────────────────────────
const ROTATIONS: Record<string, number> = { up: 0, right: 90, down: 180, left: 270 };
const CSS_POSITIONS: Record<string, string> = { up: 'top', down: 'bottom', left: 'left', right: 'right' };
const BUD_OFFSET = -10;

const BranchBud = memo(({ position, direction, personName, actionText, personId }: BranchBudProps) => {
  const rot = ROTATIONS[direction];
  const cssProp = CSS_POSITIONS[direction];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.alert(`פעולה זו תוסיף ${actionText} עבור: ${personName}`);
  };

  return (
    <Handle
      type="source"
      position={position}
      id={`add-${actionText}-${personId}`}
      className="branch-handle-static"
      style={{
        width: 120, height: 120, background: 'transparent', border: 'none', zIndex: -100,
        [cssProp]: BUD_OFFSET
      }}
    >
      <div
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rot}deg)`, cursor: 'pointer' }}
      >
        <img
          src="/tip_bud_small.png"
          alt={`Add ${actionText}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'contrast(1.2)' }}
        />
      </div>
    </Handle>
  );
});
BranchBud.displayName = 'BranchBud';

// ═══════════════════════════════════════════════════════════════════════════════
// Family Node Component
// ═══════════════════════════════════════════════════════════════════════════════
export const FamilyNode = memo(({ data }: NodeProps<FamilyMemberNode>) => {
  const { person, buds = [] } = data; // שולפים את הניצנים ישר מהמידע
  const isMale = person.gender === 'male';

  const cardImage = isMale ? '/card_male.png' : '/card_female.png';
  const accentBg = isMale ? '#c9b896' : '#d4b5a0';
  const accentText = isMale ? '#5a4a35' : '#6b4a3a';

  const initials = person.fullName.split(' ').filter(n => n.length > 0).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const dateText = person.isAlive ? `${person.birthYear}` : `${person.deathYear} - ${person.birthYear}`;

  const handleAlert = () => window.alert(`פעולה זו פותחת את הכרטיס של: ${person.fullName}`);

  return (
    <div
      style={{ position: 'relative', width: 320, height: 150, background: 'transparent', display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px 20px', cursor: 'grab', fontFamily: "'Inter', system-ui, sans-serif" }}
      dir="ltr"
    >
      {/* ── Background Asset Layer ── */}
      <img src={cardImage} alt="card bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none', mixBlendMode: 'multiply', zIndex: -1 }} />

      {/* ── Photo / Initials ── */}
      <div style={{ position: 'relative', height: 75, width: 75, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 8px rgba(44,30,20,0.1)', marginRight: 16, background: accentBg }}>
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, opacity: 0.6, color: accentText }}>{initials}</span>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', overflow: 'hidden', paddingRight: 4 }} dir="rtl">
        <h3 style={{ fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#000000ff', lineHeight: 1.2, margin: 0 }}>{person.fullName}</h3>
        <span style={{ color: '#8a7a65', fontSize: 14, marginTop: 4, fontWeight: 500, userSelect: 'none', textAlign: 'right' }} dir="ltr">{dateText}</span>
        {!person.isAlive && <span style={{ fontSize: 11, color: '#a0907a', marginTop: 2 }}>ז״ל</span>}
      </div>

      <button
        onClick={handleAlert}
        style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: 'rgba(120,100,70,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a8a70', cursor: 'pointer', marginLeft: 8, transition: 'background 0.15s, color 0.15s' }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* ═══ SEAL-ALIGNED ROUTING HANDLES ═══ */}
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top} id="top-target" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Left} id="left-out" style={{ opacity: 0, width: 1, height: 1, left: isMale ? 25 : 0 }} />
      <Handle type="target" position={Position.Left} id="left-in" style={{ opacity: 0, width: 1, height: 1, left: isMale ? 25 : 0 }} />
      <Handle type="source" position={Position.Right} id="right-out" style={{ opacity: 0, width: 1, height: 1, right: !isMale ? 25 : 0 }} />
      <Handle type="target" position={Position.Right} id="right-in" style={{ opacity: 0, width: 1, height: 1, right: !isMale ? 25 : 0 }} />

      {/* ═══ INTERACTIVE BRANCH BUDS ═══ */}
      {/* הלולאה קצרה ונקיה בזכות שימוש נכון ב-Props וב-Spread Operator */}
      {buds.map((bud, index) => (
        <BranchBud
          key={`bud-${index}`}
          {...bud}
          personId={person.id}
          personName={person.fullName}
        />
      ))}
    </div>
  );
});

FamilyNode.displayName = 'FamilyNode';