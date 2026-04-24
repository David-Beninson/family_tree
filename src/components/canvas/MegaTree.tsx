'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from './FamilyNode';
import FamilyEdge from './FamilyEdge';
import { useFamilyStore } from '../../lib/store';
import SearchBar from './SearchBar';

const UnionNode = ({ data }: any) => {
  const { openAddDrawer } = useFamilyStore();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.unionId) {
      openAddDrawer({ action: 'add_child', sourceUnionId: data.unionId });
    }
  };
  return (
    <div
      onClick={handleClick}
      title="הוסף ילד/ה לזוג זה"
      className="relative flex justify-center items-center w-5 h-5 bg-slate-800 text-white rounded-full cursor-pointer hover:bg-indigo-600 hover:scale-125 shadow-md transition-all z-20 group"
    >
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      <Handle type="target" position={Position.Left} id="left-target" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
      <span className="font-semibold text-[13px] leading-none select-none pointer-events-none">+</span>
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
    </div>
  );
};

export default function MegaTree() {
  const { nodes, edges, onNodesChange, onEdgesChange, rebuildGraph, openAddDrawer } = useFamilyStore();

  React.useEffect(() => { rebuildGraph(); }, [rebuildGraph]);

  const nodeTypes = React.useMemo(() => ({ familyMember: FamilyNode, union: UnionNode }), []);
  const edgeTypes = React.useMemo(() => ({ family: FamilyEdge }), []);

  const onConnectEnd = React.useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      const state = connectionState?.[0] || connectionState;
      if (state && !state.isValid && state.fromHandle) {
        const handleId = state.fromHandle.id as string;
        const nodeId = state.fromNode?.id as string | undefined;
        if ((handleId === 'add-spouse-right' || handleId === 'add-spouse-left') && nodeId) {
          openAddDrawer({ action: 'add_partner', sourcePersonId: nodeId });
        } else if (handleId === 'add-parent' && nodeId) {
          openAddDrawer({ action: 'add_parent', sourcePersonId: nodeId });
        }
      }
    },
    [openAddDrawer]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable={true}
        fitView minZoom={0.2} maxZoom={1.5}
        nodeExtent={[[-2000, -2000], [2000, 2000]]}
        translateExtent={[[-3000, -3000], [3000, 3000]]}
        className="bg-transparent"
      >
        <Background color="#e2e2e2" gap={20} />
        <Controls showInteractive={false} className="!bg-white !shadow-xl !border-none !rounded-lg" />
        {nodes.length > 20 && (
          <MiniMap nodeStrokeColor="#8b7355" maskColor="rgba(253,251,247,0.7)" className="!bg-white !shadow-xl !border-none !rounded-lg" />
        )}
        <Panel position="top-center" style={{ marginTop: '24px', zIndex: 50 }}>
          <SearchBar />
        </Panel>
      </ReactFlow>
    </div>
  );
}
