import React, { JSX } from 'react';
import { EdgeProps } from '@xyflow/react';

// ═══════════════════════════════════════════════════════════════════════════════
// Organic Family-Tree Branch Renderer
// ═══════════════════════════════════════════════════════════════════════════════
// Renders every edge as an organic, hand-drawn tree branch with:
//   • Dynamic tapering (thick trunk → thin twig)
//   • Multi-layer wood texture (bark, heartwood, sapwood, grain, highlight)
//   • Subtle organic wobble for hand-drawn feel
//   • SVG displacement filter for bark roughness
//   • Feathered / soft edges at connection points
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Shared SVG Defs ─────────────────────────────────────────────────────────
// React Flow renders all edges in one SVG; duplicate defs are de-duplicated.
function OrganicDefs() {
  return (
    <defs>
      {/* Bark noise — rough, fibrous displacement */}
      <filter id="barkRough" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04 0.12"
          numOctaves="5"
          seed="13"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="4"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Subtle hand-drawn wobble for thinner elements */}
      <filter id="handDrawn" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.03 0.06"
          numOctaves="3"
          seed="7"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="2.5"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* Feather / soft-edge blur for junction merges */}
      <filter id="featherEdge" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation="1.2" />
      </filter>

      {/* Wood-grain pattern (repeating) */}
      <pattern id="woodGrain" x="0" y="0" width="6" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(2)">
        <rect width="6" height="20" fill="transparent" />
        <line x1="1" y1="0" x2="1.5" y2="20" stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
        <line x1="3.5" y1="0" x2="3" y2="20" stroke="rgba(0,0,0,0.05)" strokeWidth="0.6" />
        <line x1="5" y1="0" x2="5.2" y2="20" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
      </pattern>

      {/* Heartwood gradient along branch length */}
      <linearGradient id="heartwoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5c3215" />
        <stop offset="40%" stopColor="#4a2c0a" />
        <stop offset="70%" stopColor="#3b2008" />
        <stop offset="100%" stopColor="#5c3215" />
      </linearGradient>

      {/* Sapwood radial – lighter, inner glow */}
      <linearGradient id="sapwoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(160,110,60,0)" />
        <stop offset="30%" stopColor="rgba(160,110,60,0.35)" />
        <stop offset="50%" stopColor="rgba(180,130,75,0.5)" />
        <stop offset="70%" stopColor="rgba(160,110,60,0.35)" />
        <stop offset="100%" stopColor="rgba(160,110,60,0)" />
      </linearGradient>

      {/* Divorced branch — cooler, greyed-out */}
      <linearGradient id="divorcedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6a5d4e" />
        <stop offset="50%" stopColor="#5a4d3e" />
        <stop offset="100%" stopColor="#6a5d4e" />
      </linearGradient>
    </defs>
  );
}

// ─── Organic branch outline generator ────────────────────────────────────────
// Creates a tapered, slightly wobbly closed path between two points.
// sourceHW / targetHW = half-widths at source & target ends.
function organicOutline(
  sx: number, sy: number,
  tx: number, ty: number,
  sourceHW: number,
  targetHW: number,
  seed: number = 0,
  segments: number = 10
): string {
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  // Deterministic wobble
  const wobbleAmp = Math.min(8, len * 0.03);
  const wobble = (i: number) =>
    Math.sin(seed * 5.13 + i * 2.71) * wobbleAmp +
    Math.cos(seed * 3.37 + i * 1.93) * wobbleAmp * 0.5;

  // Sample points along a cubic bezier with gentle S-curve
  const cp1x = sx + dx * 0.25 + wobble(0) * 0.8;
  const cp1y = sy + dy * 0.25 + wobble(1) * 0.6;
  const cp2x = sx + dx * 0.75 - wobble(2) * 0.8;
  const cp2y = sy + dy * 0.75 - wobble(3) * 0.6;

  const leftPts: string[] = [];
  const rightPts: string[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;

    // Cubic bezier
    const px = u * u * u * sx + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * tx;
    const py = u * u * u * sy + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * ty;

    // Tangent (derivative of cubic bezier)
    const tdx = -3 * u * u * sx + 3 * (u * u - 2 * u * t) * cp1x + 3 * (2 * u * t - t * t) * cp2x + 3 * t * t * tx;
    const tdy = -3 * u * u * sy + 3 * (u * u - 2 * u * t) * cp1y + 3 * (2 * u * t - t * t) * cp2y + 3 * t * t * ty;
    const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;

    // Perpendicular
    const perpX = -tdy / tlen;
    const perpY = tdx / tlen;

    // Width at this point: smooth interpolation with slight organic bulge
    const baseWidth = sourceHW + (targetHW - sourceHW) * t;
    const bulge = Math.sin(t * Math.PI) * Math.min(sourceHW, targetHW) * 0.12;
    const w = baseWidth + bulge + wobble(i + 4) * 0.3;

    leftPts.push(`${(px + perpX * w).toFixed(1)},${(py + perpY * w).toFixed(1)}`);
    rightPts.push(`${(px - perpX * w).toFixed(1)},${(py - perpY * w).toFixed(1)}`);
  }

  // Build closed path: left side forward, arc at target, right side backward, arc at source
  const lastL = leftPts[leftPts.length - 1];
  const lastR = rightPts[rightPts.length - 1];
  const firstL = leftPts[0];
  const firstR = rightPts[0];

  let d = `M ${leftPts[0]}`;
  for (let i = 1; i < leftPts.length; i++) {
    d += ` L ${leftPts[i]}`;
  }
  // Rounded cap at target end
  d += ` Q ${tx.toFixed(1)},${ty.toFixed(1)} ${lastR}`;
  // Right side backward
  for (let i = rightPts.length - 2; i >= 0; i--) {
    d += ` L ${rightPts[i]}`;
  }
  // Rounded cap at source end
  d += ` Q ${sx.toFixed(1)},${sy.toFixed(1)} ${firstL}`;
  d += ' Z';

  return d;
}

// ─── Center-line path (for grain/highlight effects) ─────────────────────────
function centerLinePath(
  sx: number, sy: number,
  tx: number, ty: number,
  seed: number = 0
): string {
  const dx = tx - sx;
  const dy = ty - sy;
  const wobbleAmp = Math.min(5, Math.sqrt(dx * dx + dy * dy) * 0.02);

  const cp1x = sx + dx * 0.3 + Math.sin(seed * 4.1) * wobbleAmp;
  const cp1y = sy + dy * 0.3 + Math.cos(seed * 3.2) * wobbleAmp;
  const cp2x = sx + dx * 0.7 - Math.sin(seed * 2.8) * wobbleAmp;
  const cp2y = sy + dy * 0.7 - Math.cos(seed * 4.6) * wobbleAmp;

  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${tx.toFixed(1)} ${ty.toFixed(1)}`;
}

// ─── Divorced scar marks (subtle cross-hatching on Y-arm branches) ──────────
function DivorceScars({ sx, sy, tx, ty, seed }: {
  sx: number; sy: number; tx: number; ty: number; seed: number;
}) {
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const count = Math.max(2, Math.floor(len / 40));
  const marks: JSX.Element[] = [];

  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const x = sx + dx * t;
    const y = sy + dy * t;
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
    const w = 4 + Math.sin(seed + i * 1.7) * 2;

    marks.push(
      <line
        key={i}
        x1={x - w} y1={y - w * 0.4}
        x2={x + w} y2={y + w * 0.4}
        stroke="rgba(120,100,80,0.3)"
        strokeWidth="1.2"
        strokeLinecap="round"
        transform={`rotate(${angle.toFixed(0)}, ${x.toFixed(1)}, ${y.toFixed(1)})`}
      />
    );
  }

  return <>{marks}</>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Edge Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function FamilyEdge({
  sourceX, sourceY,
  targetX, targetY,
  id, data,
}: EdgeProps) {
  const isDivorced = data?.isDivorced as boolean ?? false;
  const edgeRole = data?.edgeRole as string ?? 'partner';
  const weight = typeof data?.weight === 'number' ? data.weight : 3;
  const seed = typeof data?.seed === 'number' ? data.seed : 1.0;
  const srcW = typeof data?.sourceWidth === 'number' ? data.sourceWidth : weight * 2;
  const tgtW = typeof data?.targetWidth === 'number' ? data.targetWidth : weight * 0.8;

  // Half-widths for the organic outline
  const sourceHW = Math.max(2, srcW / 2);
  const targetHW = Math.max(1.5, tgtW / 2);

  // Generate paths
  const mainPath = organicOutline(sourceX, sourceY, targetX, targetY, sourceHW, targetHW, seed);
  const innerPath = organicOutline(sourceX, sourceY, targetX, targetY, sourceHW * 0.4, targetHW * 0.4, seed + 0.5);
  const glintPath = organicOutline(sourceX, sourceY, targetX, targetY, sourceHW * 0.15, targetHW * 0.15, seed + 1.0);
  const center = centerLinePath(sourceX, sourceY, targetX, targetY, seed);

  const fillColor = isDivorced ? 'url(#divorcedGrad)' : 'url(#heartwoodGrad)';
  const barkColor = isDivorced ? '#4a4035' : '#2c1606';

  return (
    <>
      <OrganicDefs />

      {/* Layer 0 — Soft drop shadow */}
      <path
        d={mainPath}
        fill="rgba(20,10,5,0.18)"
        transform="translate(3, 5)"
        filter="url(#featherEdge)"
      />

      {/* Layer 1 — Outer bark (displaced for roughness) */}
      <path
        d={mainPath}
        fill={barkColor}
        filter="url(#barkRough)"
        opacity="0.85"
      />

      {/* Layer 2 — Heartwood base (clean, restores shape) */}
      <path
        d={mainPath}
        fill={fillColor}
        opacity="0.9"
      />

      {/* Layer 3 — Wood grain pattern overlay */}
      <path
        d={mainPath}
        fill="url(#woodGrain)"
        opacity="0.4"
      />

      {/* Layer 4 — Sapwood inner glow */}
      <path
        d={innerPath}
        fill="rgba(180,130,75,0.3)"
        filter="url(#handDrawn)"
      />

      {/* Layer 5 — Specular highlight (ambient light) */}
      <path
        d={glintPath}
        fill="rgba(255,215,150,0.18)"
      />

      {/* Layer 6 — Grain center line */}
      <path
        d={center}
        stroke="rgba(60,35,15,0.12)"
        strokeWidth={Math.max(1, sourceHW * 0.15).toFixed(1)}
        fill="none"
        strokeLinecap="round"
        filter="url(#handDrawn)"
      />

      {/* Layer 7 — Secondary grain lines (offset from center) */}
      <path
        d={centerLinePath(sourceX + sourceHW * 0.35, sourceY, targetX + targetHW * 0.35, targetY, seed + 2)}
        stroke="rgba(60,35,15,0.07)"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={centerLinePath(sourceX - sourceHW * 0.3, sourceY, targetX - targetHW * 0.3, targetY, seed + 3)}
        stroke="rgba(60,35,15,0.06)"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Layer 8 — Feathered edge at junctions for soft merge */}
      <circle
        cx={sourceX} cy={sourceY}
        r={sourceHW * 1.3}
        fill={isDivorced ? '#5a4d3e' : '#4a2c0a'}
        opacity="0.35"
        filter="url(#featherEdge)"
      />
      <circle
        cx={targetX} cy={targetY}
        r={targetHW * 1.3}
        fill={isDivorced ? '#5a4d3e' : '#4a2c0a'}
        opacity="0.35"
        filter="url(#featherEdge)"
      />

      {/* Layer 9 — צלקות פרידה וענפים מנותקים (V-arm edges) */}
      {isDivorced && edgeRole === 'v-arm' && (
        <DivorceScars sx={sourceX} sy={sourceY} tx={targetX} ty={targetY} seed={seed} />
      )}
    </>
  );
}
