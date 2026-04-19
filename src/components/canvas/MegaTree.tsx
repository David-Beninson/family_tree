'use client';

import React, { useMemo } from 'react';
import { ReactFlow, Controls, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from './FamilyNode';
import FamilyEdge from './FamilyEdge';
import { useFamilyStore } from '../../lib/store';

const GroundNode = ({ data }: { data: any }) => {
  const width = data?.width || 1200;
  return (
    <div style={{
      width: width,
      height: 120,
      backgroundImage: 'url(/ground_layer.png)',
      backgroundRepeat: 'repeat-x',
      backgroundSize: 'auto 100%',
      filter: 'brightness(1.5) contrast(1.5)',
      mixBlendMode: 'multiply',
      maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
    }} />
  );
};
const RootsNode = ({ data }: { data: any }) => {
  const mass = data?.mass || 5;
  return (
    <div style={{
      width: 1000,
      height: 700,
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    }}>
      <img src="/trunk_main.png" alt="Roots" style={{
        width: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        objectPosition: 'top center',
        transformOrigin: 'top center',
        marginTop: '-10px',
        filter: 'brightness(1.5) contrast(1.5)'
      }} />
    </div>
  );
};

const UnionNode = ({ data }: { data: any }) => {
  const partnerNames = data?.partnerNames ?? '';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.alert(`פעולה זו תוסיף ילד/ה עבור: ${partnerNames}`);
  };

  return (
    <div
      onClick={handleClick}
      title="לחץ להוספת ילד/ה"
      style={{ position: 'relative', width: 24, height: 24, zIndex: 20, cursor: 'pointer' }}
    >
      <Handle type="target" position={Position.Left} id="left-in" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Right} id="right-in" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  );
};

const CrownNode = () => {
  return (
    <div style={{ position: 'relative', width: 20, height: 20, pointerEvents: 'none' }}>
      <Handle type="source" position={Position.Top} id="top-source" style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  );
};

export default function MegaTree() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useFamilyStore();

  const groundNode = nodes.find(n => n.id === 'dynamic-ground');
  const bounds = groundNode?.data?.bounds as { minX: number; maxX: number } | undefined;

  const translateExtent = useMemo(() => {
    if (!bounds) return [[-2000, -2000], [2000, 410]];
    return [[bounds.minX, -4000], [bounds.maxX, 410]];
  }, [bounds]);

  const dynamicMinZoom = useMemo(() => {
    if (!bounds) return 0.5;
    const treeWidth = bounds.maxX - bounds.minX;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    return Math.max(0.2, (screenWidth / (treeWidth + 400)) * 0.8);
  }, [bounds]);

  const nodeTypes = useMemo(() => ({
    familyMember: FamilyNode, union: UnionNode, rootsDecoration: RootsNode, ground: GroundNode, crown: CrownNode
  }), []);

  const edgeTypes = useMemo(() => ({ family: FamilyEdge }), []);

  return (
    <div className="w-full h-full relative parchment-canvas overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          duration: 0,
          nodes: nodes.filter(n => n.type === 'familyMember')
        }}
        minZoom={dynamicMinZoom}
        maxZoom={1.5}
        translateExtent={translateExtent as [[number, number], [number, number]]}
        className="bg-transparent"
        style={{ mixBlendMode: 'multiply' }}
      >
        <Controls showInteractive={false} style={{ background: 'rgba(245, 239, 230, 0.9)' }} />
      </ReactFlow>
    </div >
  );
}