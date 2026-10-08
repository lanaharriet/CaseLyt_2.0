import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MarkerType,
  Position
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphNodeItem, GraphEdgeItem } from '../../types';

interface EvidenceGraphProps {
  nodesData: GraphNodeItem[];
  edgesData: GraphEdgeItem[];
  onSelectNode: (node: GraphNodeItem) => void;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  nodesData,
  edgesData,
  onSelectNode
}) => {
  // Convert custom graph nodes to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    const nodePositions: Record<string, { x: number; y: number }> = {
      'doc_chargesheet': { x: 50, y: 100 },
      'event_flight': { x: 300, y: 50 },
      'person_vikram': { x: 550, y: 50 },
      'claim_alibi': { x: 800, y: 100 },
      'doc_kpmg': { x: 50, y: 300 },
      'ev_transfer': { x: 350, y: 300 },
      'person_siddharth': { x: 650, y: 300 },
    };

    return nodesData.map((n, idx) => {
      const pos = nodePositions[n.node_id] || { x: (idx % 3) * 260 + 80, y: Math.floor(idx / 3) * 160 + 80 };
      
      let badgeColor = 'bg-[#171717] text-white';
      if (n.type === 'Person') badgeColor = 'bg-[#6C2029] text-white';
      else if (n.type === 'Claim') badgeColor = 'bg-[#3E654F] text-white';
      else if (n.type === 'Evidence') badgeColor = 'bg-[#AD8748] text-white';
      else if (n.type === 'Event') badgeColor = 'bg-[#A16D2B] text-white';

      return {
        id: n.node_id,
        position: pos,
        data: {
          label: (
            <div className="p-2 bg-[#FAF8F5] border border-[#171717]/20 rounded-xs shadow-xs text-left max-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-xs font-bold ${badgeColor}`}>
                  {n.type}
                </span>
              </div>
              <p className="text-xs font-serif font-bold text-[#171717] leading-tight truncate">
                {n.label}
              </p>
            </div>
          ),
          rawNode: n
        },
        style: { width: 220, border: 'none', background: 'transparent' },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [nodesData]);

  const initialEdges: Edge[] = useMemo(() => {
    return edgesData.map((e) => {
      let strokeColor = '#171717';
      if (e.relationship === 'Contradicts') strokeColor = '#92383B';
      else if (e.relationship === 'Supports') strokeColor = '#3E654F';
      else if (e.relationship === 'Derived From') strokeColor = '#6C2029';

      return {
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.relationship,
        labelStyle: { fill: strokeColor, fontWeight: 700, fontSize: 10, fontFamily: 'JetBrains Mono' },
        labelBgStyle: { fill: '#FAF8F5', fillOpacity: 0.9, rx: 2, ry: 2 },
        style: { stroke: strokeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      };
    });
  }, [edgesData]);

  return (
    <div className="h-[600px] legal-card relative overflow-hidden">
      <div className="absolute top-3 left-3 z-10 bg-[#FAF8F5]/90 border border-[#171717]/15 p-2 rounded-xs flex items-center space-x-3 text-xs font-mono">
        <span className="flex items-center space-x-1 text-[#3E654F]">
          <span className="w-2 h-2 rounded-full bg-[#3E654F]" />
          <span>Supports</span>
        </span>
        <span className="flex items-center space-x-1 text-[#92383B]">
          <span className="w-2 h-2 rounded-full bg-[#92383B]" />
          <span>Contradicts</span>
        </span>
        <span className="flex items-center space-x-1 text-[#6C2029]">
          <span className="w-2 h-2 rounded-full bg-[#6C2029]" />
          <span>Derived From</span>
        </span>
      </div>

      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        onNodeClick={(_, node) => {
          if (node.data?.rawNode) {
            onSelectNode(node.data.rawNode as GraphNodeItem);
          }
        }}
        fitView
      >
        <Background color="#171717" gap={20} size={0.5} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
