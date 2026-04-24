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
        offset: 40, // Increased offset for a deeper vertical drop
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