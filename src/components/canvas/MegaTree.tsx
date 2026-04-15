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

// Union Node: The center hub between parents, visually a sleek + button to add children
const UnionNode = () => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.alert('פעולה זו תפתח חלון הוספת: ילד/ה חדש/ה בדאטה בייס!');
  };

  return (
    <div 
      onClick={handleClick}
      className="relative flex justify-center items-center w-5 h-5 bg-slate-800 text-white rounded-full cursor-pointer hover:bg-slate-600 hover:scale-125 shadow-md transition-all z-20 group"
    >
      <Handle type="target" position={Position.Top} id="top" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      <Handle type="target" position={Position.Left} id="left-in" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      <Handle type="target" position={Position.Right} id="right-in" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      {/* Modern crisp plus symbol */}
      <span className="font-semibold text-[13px] leading-none select-none pointer-events-none">+</span>
      
      <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      
      {/* Explicit bubble for dragging out child connection */}
      <Handle 
        type="source" position={Position.Bottom} id="add-child" 
        style={{ width: '100%', height: '100%', borderRadius: '50%', border: 'none', background: 'transparent', left: 0, top: 0 }}
        className="!min-w-0 !min-h-0 absolute opacity-0 cursor-crosshair z-30" 
      />
    </div>
  );
};

// Node types & Edge types are memoized inside the component to survive Next.js Fast Refresh

export default function MegaTree() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useFamilyStore();

  const nodeTypes = React.useMemo(() => ({
    familyMember: FamilyNode,
    union: UnionNode,
  }), []);

  const edgeTypes = React.useMemo(() => ({
    family: FamilyEdge,
  }), []);

  const onConnectEnd = React.useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // Support xyflow v11 and v12 object structures safely
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
    <div className="w-full h-full relative">
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
