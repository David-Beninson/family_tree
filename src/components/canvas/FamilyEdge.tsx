import { BaseEdge, EdgeProps, getStraightPath, getSmoothStepPath, Edge } from '@xyflow/react';

export type FamilyEdgeData = {
  color?: string;
  routing?: 'straight' | 'smoothstep';
};

export type FamilyEdgeType = Edge<FamilyEdgeData, 'familyEdge'>;

export default function FamilyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<FamilyEdgeType>) {

  const isStraight = data?.routing === 'straight';

  const safeCenterY = targetY - 35;

  const [edgePath] = isStraight
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 20,
      centerY: safeCenterY,
    });

  const edgeColor = data?.color || '#94a3b8';

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        strokeWidth: 3,
        stroke: edgeColor,
        transition: 'stroke 0.3s ease',
        ...style,
      }}
    />
  );
}