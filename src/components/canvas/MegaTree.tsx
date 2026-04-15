'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from './FamilyNode';
import FamilyEdge from './FamilyEdge';
import { useFamilyStore } from '../../lib/store';

// Helper component for routing (invisible point)
const UnionNode = () => (
  <div className="w-1 h-1 opacity-0 pointer-events-none">
    <Handle type="target" position={Position.Top} id="top" />
    <Handle type="source" position={Position.Bottom} id="bottom" />
  </div>
);

// Define nodeTypes outside to avoid re-renders and warnings
const nodeTypes = {
  familyMember: FamilyNode,
  union: UnionNode,
};

const edgeTypes = {
  family: FamilyEdge,
};

export default function MegaTree() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useFamilyStore();

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        nodeExtent={[[-2000, -2000], [2000, 2000]]}
        translateExtent={[[-3000, -3000], [3000, 3000]]}
        className="bg-transparent"
      >
        <Background color="#e2e2e2" gap={20} />
        <Controls showInteractive={false} className="!bg-white !shadow-xl !border-none !rounded-lg" />
        {nodes.length > 20 && (
          <MiniMap
            nodeStrokeColor="#8b7355"
            maskColor="rgba(253, 251, 247, 0.7)"
            className="!bg-white !shadow-xl !border-none !rounded-lg"
          />
        )}
      </ReactFlow>
    </div>
  );
}
