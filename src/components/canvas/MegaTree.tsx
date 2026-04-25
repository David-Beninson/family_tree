'use client';

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Handle,
  Position,
  Panel,
  useViewport,
  CoordinateExtent,
  NodeProps,
  Node,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from './FamilyNode';
import FamilyEdge from './FamilyEdge';
import { useFamilyStore } from '../../lib/store';
import SearchBar from './SearchBar';

function ConditionalMiniMap() {
  const { zoom } = useViewport();
  if (zoom < 0.6) return null;

  return (
    <MiniMap
      nodeStrokeColor="#8b7355"
      maskColor="rgba(253,251,247,0.7)"
      className="!bg-white !shadow-xl !border-none !rounded-lg"
    />
  );
}

function FocusController() {
  const { pendingFocusNodeId, setPendingFocusNodeId, setHighlightedNode } = useFamilyStore();
  const { setCenter, getNode } = useReactFlow();

  useEffect(() => {
    if (pendingFocusNodeId) {
      const node = getNode(pendingFocusNodeId);
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 280) / 2;
        const y = node.position.y + (node.measured?.height ?? 90) / 2;
        setCenter(x, y, { zoom: 1.2, duration: 700 });

        setHighlightedNode(pendingFocusNodeId);
        setTimeout(() => setHighlightedNode(null), 2500);

        setPendingFocusNodeId(null);
      }
    }
  }, [pendingFocusNodeId, getNode, setCenter, setHighlightedNode, setPendingFocusNodeId]);

  return null;
}

type UnionNodeData = Node<{ unionId: string }, 'union'>;

const UnionNode = ({ data }: NodeProps<UnionNodeData>) => {
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
      <Handle type="target" position={Position.Top} id="top-target" className="opacity-0 w-4 h-4 border-0" style={{ top: -8 }} />
      <Handle type="target" position={Position.Left} id="left-target" className="opacity-0 w-4 h-4 border-0" style={{ left: -8 }} />
      <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 w-4 h-4 border-0" style={{ right: -8 }} />
      <span className="font-semibold text-[13px] leading-none select-none pointer-events-none">+</span>
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="opacity-0 w-1 h-1 pointer-events-none border-0" />
    </div>
  );
};

export default function MegaTree() {
  const { nodes, edges, onNodesChange, onEdgesChange, rebuildGraph, openAddDrawer, connectExistingNodes } = useFamilyStore();
  const [minZoom, setMinZoom] = useState(0.05);
  const [translateExtent, setTranslateExtent] = useState<CoordinateExtent>([[-3000, -3000], [3000, 3000]]);

  useEffect(() => { rebuildGraph(); }, [rebuildGraph]);

  const treeBounds = useMemo(() => {
    if (nodes.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(n => {
      const isUnion = n.type === 'union';
      const w = isUnion ? 20 : 280;
      const h = isUnion ? 20 : 90;
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + w);
      maxY = Math.max(maxY, n.position.y + h);
    });

    return { minX, minY, maxX, maxY };
  }, [nodes.length]);

  useEffect(() => {
    if (!treeBounds) return;

    const updateMinZoom = () => {
      const padding = 200;
      const graphWidth = (treeBounds.maxX - treeBounds.minX) + padding * 2;
      const graphHeight = (treeBounds.maxY - treeBounds.minY) + padding * 2;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const scaleX = vw / graphWidth;
      const scaleY = vh / graphHeight;
      const exactFitScale = Math.min(scaleX, scaleY);

      setMinZoom(Math.max(Math.min(exactFitScale, 0.8), 0.05));

      const newExtent: CoordinateExtent = [
        [treeBounds.minX - padding, treeBounds.minY - padding],
        [treeBounds.maxX + padding, treeBounds.maxY + padding]
      ];

      setTranslateExtent(prev => {
        if (prev[0][0] === newExtent[0][0] && prev[1][0] === newExtent[1][0]) return prev;
        return newExtent;
      });
    };

    updateMinZoom();
    window.addEventListener('resize', updateMinZoom);
    return () => window.removeEventListener('resize', updateMinZoom);
  }, [treeBounds]);

  const nodeTypes = useMemo(() => ({ familyMember: FamilyNode, union: UnionNode }), []);
  const edgeTypes = useMemo(() => ({ familyEdge: FamilyEdge }), []);

  const onConnect = useCallback((connection: any) => {
    const { source, sourceHandle, target } = connection;

    // Spouse to Spouse connection
    if (sourceHandle?.includes('spouse') && !target.startsWith('union-hub')) {
      connectExistingNodes('spouse', source, target);
    }
    // Child to Union connection
    else if (sourceHandle === 'add-parent' && target.startsWith('union-hub')) {
      const unionId = target.replace('union-hub-', '');
      connectExistingNodes('child_to_union', source, unionId);
    }
  }, [connectExistingNodes]);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      const state = connectionState?.[0] || connectionState;

      // Only open drawer if connection failed (didn't land on a valid target)
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
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        nodesDraggable={false} nodesConnectable={true} elementsSelectable={true}
        fitView minZoom={minZoom} maxZoom={1.5}
        nodeExtent={[[-5000, -5000], [5000, 5000]]}
        translateExtent={translateExtent}
        className="bg-transparent"
      >
        <FocusController />
        <Background color="#e2e2e2" gap={20} />
        {nodes.length > 5 && <ConditionalMiniMap />}
        <Panel position="top-center" style={{ marginTop: '24px', zIndex: 50 }}>
          <SearchBar />
        </Panel>
      </ReactFlow>
    </div>
  );
}
