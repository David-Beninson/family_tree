'use client';

import React from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from './FamilyNode';
import FamilyEdge from './FamilyEdge';
import { useFamilyStore } from '../../lib/store';

// ═══════════════════════════════════════════════════════════════════════════════
// Union Node — Organic Junction / Bud / Y-Fork
// ═══════════════════════════════════════════════════════════════════════════════
// Married with children  → "Fertility Junction" (branch merge knot)
// Married without children → "Bud" (ניצן — potential growth point)
// Divorced → "Y-Fork" (split point, more muted)
// ═══════════════════════════════════════════════════════════════════════════════
// Union Node — Organic Junction / Bud 
// ═══════════════════════════════════════════════════════════════════════════════
const UnionNode = ({ data }: { data: any }) => {
  const hasChildren = data?.hasChildren ?? false;
  // גרושים כבר לא מרונדרים כאן בכלל (עשינו להם נתק מוחלט).

  const size = 20;
  const half = size / 2;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.alert('פעולה זו תפתח חלון הוספת: ילד/ה חדש/ה בדאטה בייס!');
  };

  return (
    <div
      onClick={handleClick}
      title="לחץ להוספת ילד/ה — או גרור לחיבור"
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: 'pointer',
        zIndex: 20,
      }}
    >
      {/* ═══ ידיות החיבור לכל הכיוונים ═══ */}
      {/* נשואים מתחברים מהצדדים */}
      <Handle type="target" position={Position.Left} id="left-in" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right} id="right-in" style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* גרושים מתחברים מלמטה (מקבלים את הענפים ליצירת ה-V) */}
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* הילדים יוצאים מלמעלה */}
      <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0, pointerEvents: 'none' }} />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', overflow: 'visible' }}>
        {hasChildren ? (
          /* ── צומת פוריות (כשיש ילדים) ── */
          <>
            <circle cx={half} cy={half} r={half} fill="#2c1606" />
            <circle cx={half} cy={half} r={half - 2} fill="#5c3a1a" />
            <circle cx={half - 2} cy={half - 2} r={2} fill="rgba(255,220,160,0.3)" />
          </>
        ) : (
          /* ── פיטם (ניצן) שיושב על הקו האופקי בלי לשבור אותו ── */
          <>
            <ellipse cx={half} cy={half} rx={4} ry={3} fill="#5c3a1a" />
            <ellipse cx={half} cy={half - 5} rx={3} ry={4} fill="#7cb342" />
            <ellipse cx={half} cy={half - 7} rx={2} ry={3} fill="#9ccc65" />
          </>
        )}
      </svg>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Roots Node — הבסיס האמיתי שמתחבר לעץ ונמצא למטה
// ═══════════════════════════════════════════════════════════════════════════════
const RootsNode = () => {
  return (
    <div style={{ width: 500, height: 400, pointerEvents: 'none' }}>
      <svg width="500" height="400" viewBox="0 0 500 400" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="rootTrunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2c1606" />
            <stop offset="25%" stopColor="#4a2c0a" />
            <stop offset="50%" stopColor="#6b3a1a" />
            <stop offset="75%" stopColor="#4a2c0a" />
            <stop offset="100%" stopColor="#2c1606" />
          </linearGradient>
          <filter id="rootBark" x="-10%" y="-5%" width="120%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="5" seed="15" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* ── הגזע העבה שעולה למעלה אל סבא וסבתא (העץ צומח ממנו) ── */}
        <path
          d="M 200 200 Q 220 50, 160 0 L 340 0 Q 280 50, 300 200 Z"
          fill="url(#rootTrunkGrad)"
          filter="url(#rootBark)"
        />

        {/* ── השורשים המסועפים שיורדים לאדמה (כמו בתמונה המקורית) ── */}
        <path d="M 220 180 Q 120 200, 50 280 Q 20 320, 0 400" stroke="#4a2c0a" strokeWidth="16" fill="none" strokeLinecap="round" filter="url(#rootBark)" />
        <path d="M 200 190 Q 150 230, 90 290 Q 50 350, 30 400" stroke="#3b2008" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#rootBark)" />
        <path d="M 120 200 Q 80 250, 30 260" stroke="#5c3a1a" strokeWidth="6" fill="none" strokeLinecap="round" />

        <path d="M 280 180 Q 380 200, 450 280 Q 480 320, 500 400" stroke="#4a2c0a" strokeWidth="16" fill="none" strokeLinecap="round" filter="url(#rootBark)" />
        <path d="M 300 190 Q 350 230, 410 290 Q 450 350, 470 400" stroke="#3b2008" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#rootBark)" />
        <path d="M 380 200 Q 420 250, 470 260" stroke="#5c3a1a" strokeWidth="6" fill="none" strokeLinecap="round" />

        <path d="M 250 180 Q 220 280, 200 400" stroke="#2c1606" strokeWidth="14" fill="none" strokeLinecap="round" filter="url(#rootBark)" />
        <path d="M 250 180 Q 280 280, 300 400" stroke="#2c1606" strokeWidth="14" fill="none" strokeLinecap="round" filter="url(#rootBark)" />

        <path d="M 230 0 Q 240 100, 245 200" stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="none" />
        <path d="M 270 0 Q 260 100, 255 200" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
};
// ─── Global SVG Defs (injected into ReactFlow viewport) ──────────────────────
function GlobalSvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="organicNoise" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="3" seed="42" />
          <feDisplacementMap in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Node & Edge Types (memoized)
// ═══════════════════════════════════════════════════════════════════════════════

export default function MegaTree() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useFamilyStore();

  const nodeTypes = React.useMemo(() => ({
    familyMember: FamilyNode,
    union: UnionNode,
    rootsDecoration: RootsNode, // רשמנו את השורשים כדי שיהיו חלק אורגני מהעץ!
  }), []);

  const edgeTypes = React.useMemo(() => ({
    family: FamilyEdge,
  }), []);

  const onConnectEnd = React.useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      const state = connectionState?.[0] || connectionState;

      if (state && !state.isValid && state.fromHandle) {
        const handleId = state.fromHandle.id;
        let label = '';
        if (handleId === 'add-parent') label = 'הורה';
        if (handleId === 'add-child') label = 'ילד/ה';
        if (handleId === 'add-spouse-right') label = 'בת זוג';
        if (handleId === 'add-spouse-left') label = 'בן זוג';

        if (label) {
          window.alert(`(משיכה) פעולה זו תפתח חלון הוספת: ${label} חדש/ה בדאטה בייס!`);
        }
      }
    },
    []
  );

  return (
    <div className="w-full h-full relative parchment-canvas">
      {/* Global SVG filter definitions */}
      <GlobalSvgDefs />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesConnectable={true}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        nodeExtent={[[-2000, -2000], [2000, 2000]]}
        translateExtent={[[-3000, -3000], [3000, 3000]]}
        className="bg-transparent"
      >
        {/* No grid background — parchment canvas is the background */}
        <Controls
          showInteractive={false}
          className="!shadow-xl !border-none !rounded-lg"
          style={{
            background: 'rgba(245, 239, 230, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(120, 100, 70, 0.15)',
          }}
        />
        {nodes.length > 20 && (
          <MiniMap
            nodeStrokeColor="#8b7355"
            maskColor="rgba(245, 239, 230, 0.7)"
            className="!shadow-xl !border-none !rounded-lg"
            style={{
              background: 'rgba(245, 239, 230, 0.9)',
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}
