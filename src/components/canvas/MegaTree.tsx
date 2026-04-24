'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  Handle,
  Position,
  Panel,
  useViewport,
  CoordinateExtent
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from './FamilyNode';
import FamilyEdge from './FamilyEdge';
import { useFamilyStore } from '../../lib/store';
import SearchBar from './SearchBar';

function ConditionalMiniMap() {
  const { zoom } = useViewport();
  // הצג רק אם עשינו זום אין משמעותי (מעל 0.6)
  if (zoom < 0.6) return null;
  
  return (
    <MiniMap 
      nodeStrokeColor="#8b7355" 
      maskColor="rgba(253,251,247,0.7)" 
      className="!bg-white !shadow-xl !border-none !rounded-lg" 
    />
  );
}

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
  const [minZoom, setMinZoom] = React.useState(0.05);
  const [translateExtent, setTranslateExtent] = React.useState<CoordinateExtent>([[-3000, -3000], [3000, 3000]]);

  React.useEffect(() => { rebuildGraph(); }, [rebuildGraph]);

  React.useEffect(() => {
    if (nodes.length === 0) return;
    
    const updateMinZoom = () => {
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
      
      // הוספת שוליים נושמים סביב הגרף לחישוב הזום והגבולות
      const padding = 200;
      const graphWidth = (maxX - minX) + padding * 2; 
      const graphHeight = (maxY - minY) + padding * 2;
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      const scaleX = vw / graphWidth;
      const scaleY = vh / graphHeight;
      const exactFitScale = Math.min(scaleX, scaleY);
      
      // אנו מגבילים את המינימום זום המקסימלי ל-0.8 כדי שעץ קטן לא יהיה תקוע על זום ענק
      const calculatedMin = Math.min(exactFitScale, 0.8);
      
      // מגבלת מינימום קשיחה של 0.05
      setMinZoom(Math.max(calculatedMin, 0.05));

      // הגבלת הגלילה (Panning) כך שלא יהיה ניתן לגלול את העץ אל מחוץ למסך
      setTranslateExtent([
        [minX - padding, minY - padding],
        [maxX + padding, maxY + padding]
      ]);
    };

    updateMinZoom();
    window.addEventListener('resize', updateMinZoom);
    return () => window.removeEventListener('resize', updateMinZoom);
  }, [nodes]);

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
        fitView minZoom={minZoom} maxZoom={1.5}
        nodeExtent={[[-5000, -5000], [5000, 5000]]}
        translateExtent={translateExtent}
        className="bg-transparent"
      >
        <Background color="#e2e2e2" gap={20} />
        {nodes.length > 5 && <ConditionalMiniMap />}
        <Panel position="top-center" style={{ marginTop: '24px', zIndex: 50 }}>
          <SearchBar />
        </Panel>
      </ReactFlow>
    </div>
  );
}
