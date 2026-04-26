import { BaseEdge, EdgeProps, getSmoothStepPath, Edge } from '@xyflow/react';

export type FamilyEdgeData = {
  color?: string;
  routing?: 'straight' | 'smoothstep' | 'vertical';
  isDivorced?: boolean;
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

  let edgePath = '';
  const edgeColor = data?.color || '#94a3b8';
  const isDivorced = data?.isDivorced;

  if (data?.routing === 'vertical') {
    edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${targetY} L ${targetX} ${targetY}`;
  } else if (data?.routing === 'straight') {
    if (isDivorced) {
      const dropHeight = 40;
      const bottomY = Math.max(sourceY, targetY) + dropHeight;
      edgePath = `M ${sourceX} ${sourceY} 
                  L ${sourceX} ${bottomY} 
                  L ${targetX} ${bottomY} 
                  L ${targetX} ${targetY}`;
    } else {
      edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${sourceY} L ${targetX} ${targetY}`;
    }
  } else if (data?.routing === 'smoothstep') {
    const midY = (sourceY + targetY) / 2;
    edgePath = `M ${sourceX} ${sourceY} 
                L ${sourceX} ${midY} 
                L ${targetX} ${midY} 
                L ${targetX} ${targetY}`;
  } else {
    [edgePath] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 16,
    });
  }

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        strokeWidth: 3,
        stroke: edgeColor,
        strokeDasharray: isDivorced ? '8, 8' : 'none',
        transition: 'all 0.3s ease',
        ...style,
      }}
    />
  );
}