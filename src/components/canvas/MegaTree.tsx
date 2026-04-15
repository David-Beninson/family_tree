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
      backgroundImage: 'url(/ground-layer.png)',
      backgroundRepeat: 'repeat-x',
      backgroundSize: 'auto 100%',
      filter: 'contrast(1.3) brightness(1.1)',
      maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
    }} />
  );
};
const RootsNode = ({ data }: { data: any }) => {
  const mass = data?.mass || 5;
  const scaleX = Math.min(1.2, 0.9 + (mass * 0.01));
  return (
    <div style={{
      width: 1000,
      height: 700,
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      maskImage: 'linear-gradient(to bottom, black 65%, transparent 95%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 95%)'
    }}>
      <img src="/tree-core.png" alt="Roots" style={{
        width: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        transform: `scaleX(${scaleX})`,
        transformOrigin: 'bottom center',
        filter: 'contrast(2.5) brightness(1.2) saturate(1.2)',
        marginTop: '25px'
      }} />
    </div>
  );
};

const UnionNode = ({ data }: { data: any }) => {
  const hasChildren = data?.hasChildren ?? false;
  return (
    <div style={{ position: 'relative', width: 20, height: 20, zIndex: 20 }}>
      <Handle type="target" position={Position.Left} id="left-in" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right-in" className="opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="opacity-0" />
      <Handle type="source" position={Position.Top} id="top-source" className="opacity-0" />
      <svg width="20" height="20">{hasChildren ? <circle cx="10" cy="10" r="10" fill="#2c1606" /> : <ellipse cx="10" cy="10" rx="4" ry="3" fill="#5c3a1a" />}</svg>
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
    familyMember: FamilyNode, union: UnionNode, rootsDecoration: RootsNode, ground: GroundNode
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
    </div>
  );
}