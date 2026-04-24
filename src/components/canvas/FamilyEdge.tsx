import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

export default function FamilyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        strokeWidth: 2,
        stroke: '#94a3b8',
        ...style,
      }}
    />
  );
}