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

// ═══════════════════════════════════════════════════════════════════════════════
// Main Edge Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function FamilyEdge({
  sourceX, sourceY,
  targetX, targetY,
  id, data,
}: EdgeProps) {
  const connectionType = data?.connectionType as string;
  const weight = typeof data?.weight === 'number' ? data.weight : 3;
  const thickness = Math.max(15, weight * 5);
  const jointSize = thickness * 1.5;

  const imageStyle = {
    mixBlendMode: 'multiply' as const,
    filter: 'brightness(1.5) contrast(1.5)'
  };

  // --- 1. מקרי קצה ---
  if (connectionType === 'crown-hub' || connectionType === 'crown-arm') return null;

  // הורים גרושים - תמיד נסתיר את הענפים הישירים כי אנחנו מציירים Y הפוך
  if (connectionType === 'divorced-parent') return null;

  if (connectionType === 'married-parent') {
    const hasChildren = data?.hasChildren as boolean;
    // Hide standard branch if union-specific asset is used (Y-split)
    if (hasChildren) return null;

    const isE1 = id.startsWith('e1');
    if (!hasChildren) {
      if (!isE1) return null;
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const fullWidth = dist * 3;
      const branchHeight = 130;

      return (
        <g className="organic-edge-group">
          <g transform={`translate(${sourceX}, ${sourceY}) rotate(${angle - 20}) scale(1, -1)`}>
            <image
              href="/branch_horizontal_with_bud.png"
              x={-15}
              y={-branchHeight / 2}
              width={fullWidth}
              height={branchHeight}
              preserveAspectRatio="none"
              style={{ background: 'transparent' }}
            />
          </g>
        </g>
      );
    }
  }

  // --- 2. ילדים (Y-Splits) ומקרה כללי ---
  let effSourceX = sourceX;
  let effSourceY = sourceY;

  const siblingCount = data?.siblingCount as number | undefined;
  const siblingIndex = data?.siblingIndex as number | undefined;
  const isDivorced = data?.isDivorced as boolean | undefined;

  let splitGraphics = null;
  let unionGraphics = null;

  // א. ציור ה-Y ההפוך עבור הורים (מחבר את ההורים ל-hub)
  if (connectionType === 'child' && siblingIndex === 0) {
    const splitHeight = isDivorced ? 200 : 160;
    const splitWidth = isDivorced ? 400 : 240;

    // בחר נכס לפי סטטוס הנישואין
    const unionImage = isDivorced ? '/branch_y_split.png' : '/branch_union_with_child.png';
    const offset = isDivorced ? -80 : 50;
    unionGraphics = (
      <g transform={`translate(${sourceX}, ${sourceY + offset})`}>
        <g transform="scale(1, -1)">
          <image
            href={unionImage}
            x={-splitWidth / 2}
            y={-splitHeight}
            width={splitWidth}
            height={splitHeight}
            preserveAspectRatio="none"
            style={imageStyle}
          />
        </g>
      </g>
    );

    // דחיפת התחלת המקטעים של הילדים מעלה (מעל ה-Y ההפוך)
    if (siblingCount === 1) {
      effSourceY = sourceY - (splitHeight * 0.55);
    }
  }

  // ב. ציור הפיצול הרגיל כלפי מעלה (עבור מספר ילדים)
  if (connectionType === 'child' && siblingCount && siblingCount >= 2) {
    const splitImage = siblingCount === 2 ? '/branch_y_split.png' : '/fan_Y-split.png';
    const splitHeight = thickness * 2.5;
    const splitWidth = thickness * 4;

    // מציירים פעם אחת
    if (siblingIndex === 0) {
      splitGraphics = (
        <g transform={`translate(${sourceX}, ${sourceY})`}>
          <image href={splitImage} x={-splitWidth / 2} y={-splitHeight} width={splitWidth} height={splitHeight} preserveAspectRatio="none" style={imageStyle} />
        </g>
      );
    }
    effSourceY = sourceY - splitHeight + 10;
  }

  let branchImage = '/branch_straight_long.png';

  // 3. מסלול שבור לענף הרגיל מחישוב הנקודה האפקטיבית ועד המטרה
  const dx = targetX - effSourceX;
  const dy = targetY - effSourceY;

  const pathPoints: { x: number, y: number }[] = [];
  pathPoints.push({ x: effSourceX, y: effSourceY });

  if (Math.abs(dx) > 20 && Math.abs(dy) > 20 && connectionType !== 'divorced-parent') {
    const midY = effSourceY + dy / 2;
    pathPoints.push({ x: effSourceX, y: midY });
    pathPoints.push({ x: targetX, y: midY });
  }
  pathPoints.push({ x: targetX, y: targetY });

  return (
    <g className="organic-edge-group">
      {unionGraphics}
    </g>
  );
}