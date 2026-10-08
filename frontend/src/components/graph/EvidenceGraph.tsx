import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  Position,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GraphNodeItem, GraphEdgeItem } from '../../types';
import { EvidenceCustomNode } from './EvidenceCustomNode';
import {
  Search, Filter, Layers, Network, AlertTriangle
} from 'lucide-react';

interface EvidenceGraphProps {
  nodesData: GraphNodeItem[];
  edgesData: GraphEdgeItem[];
  onSelectNode: (node: GraphNodeItem) => void;
  selectedNodeId?: string | null;
}

const nodeTypes = {
  evidenceNode: EvidenceCustomNode,
};

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({
  nodesData,
  edgesData,
  onSelectNode,
  selectedNodeId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [conflictOnlyFilter, setConflictOnlyFilter] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'HIERARCHICAL' | 'CHRONO' | 'GRID'>('HIERARCHICAL');

  // Pre-calculated position map for the case file topology
  const getLayoutPosition = useCallback((node: GraphNodeItem, idx: number, mode: string) => {
    // Curated topology coordinates for clean flow
    const topologicalPositions: Record<string, { x: number; y: number }> = {
      // Column 1: Primary Documents
      'doc_chargesheet': { x: 40, y: 80 },
      'doc_kpmg': { x: 40, y: 280 },
      'doc_icici': { x: 40, y: 480 },
      'doc_witness': { x: 40, y: 680 },

      // Column 2: Events & Forensic Evidence
      'event_flight': { x: 380, y: 60 },
      'event_delhi_meeting': { x: 380, y: 220 },
      'ev_geneva_ip': { x: 380, y: 380 },
      'ev_transfer': { x: 380, y: 560 },

      // Column 3: Claims & Entities
      'claim_alibi': { x: 740, y: 80 },
      'claim_delhi_presence': { x: 740, y: 240 },
      'person_vikram': { x: 740, y: 420 },
      'person_siddharth': { x: 740, y: 600 },

      // Column 4: Locations & Geographies
      'loc_zurich': { x: 1080, y: 80 },
      'loc_delhi': { x: 1080, y: 300 },
    };

    if (mode === 'HIERARCHICAL' && topologicalPositions[node.node_id]) {
      return topologicalPositions[node.node_id];
    }

    if (mode === 'GRID') {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      return { x: col * 300 + 50, y: row * 200 + 80 };
    }

    // Default fallback by type
    const typeOffsets: Record<string, number> = {
      'Document': 50,
      'Event': 360,
      'Evidence': 400,
      'Claim': 740,
      'Person': 760,
      'Location': 1080,
    };
    const colX = typeOffsets[node.type] || 400;
    const sameTypeIdx = nodesData.filter((n, i) => n.type === node.type && i < idx).length;
    return { x: colX, y: sameTypeIdx * 180 + 80 };
  }, [nodesData]);

  // Transform nodes data with search & filter predicates
  const nodes: Node[] = useMemo(() => {
    return nodesData.map((n, idx) => {
      const isSelected = selectedNodeId === n.node_id || selectedNodeId === n.id;
      const matchesSearch = !searchQuery.trim() ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.properties_json && n.properties_json.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedTypeFilter === 'ALL' || n.type.toUpperCase() === selectedTypeFilter.toUpperCase();

      let isConflictNode = false;
      if (n.properties_json) {
        try {
          const parsed = JSON.parse(n.properties_json);
          if (parsed.status === 'CONFLICTING' || parsed.status === 'CONTRADICTED') isConflictNode = true;
        } catch { /* ignore */ }
      }
      if (n.properties?.status === 'CONFLICTING') isConflictNode = true;

      const matchesConflict = !conflictOnlyFilter || isConflictNode;
      const isVisible = matchesSearch && matchesType && matchesConflict;

      const pos = getLayoutPosition(n, idx, layoutMode);

      return {
        id: n.node_id,
        type: 'evidenceNode',
        position: pos,
        data: {
          rawNode: n,
          isSelected,
          isHighlighted: matchesSearch && searchQuery.length > 0,
        },
        hidden: !isVisible,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [nodesData, selectedNodeId, searchQuery, selectedTypeFilter, conflictOnlyFilter, layoutMode, getLayoutPosition]);

  // Transform edges data with custom stylized Bezier curves & color accents
  const edges: Edge[] = useMemo(() => {
    return edgesData.map((e) => {
      let strokeColor = '#171717';
      let strokeDasharray = undefined;
      let strokeWidth = 2;
      let animated = false;

      if (e.relationship === 'Contradicts') {
        strokeColor = '#92383B';
        strokeWidth = 2.5;
        strokeDasharray = '5 5';
        animated = true;
      } else if (e.relationship === 'Supports') {
        strokeColor = '#3E654F';
        strokeWidth = 2;
      } else if (e.relationship === 'Derived From') {
        strokeColor = '#6C2029';
        strokeWidth = 2;
      } else if (e.relationship === 'References') {
        strokeColor = '#AD8748';
        strokeWidth = 1.8;
      }

      return {
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        label: e.relationship,
        animated,
        labelStyle: {
          fill: strokeColor,
          fontWeight: 700,
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
        },
        labelBgStyle: {
          fill: '#FAF8F5',
          fillOpacity: 0.95,
          rx: 3,
          ry: 3,
        },
        labelBgPadding: [4, 6] as [number, number],
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 16,
          height: 16,
        },
      };
    });
  }, [edgesData]);

  // Aggregate statistics for the control bar
  const stats = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    nodesData.forEach((n) => {
      typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    });
    return {
      total: nodesData.length,
      types: typeCounts,
      connections: edgesData.length,
      conflicts: edgesData.filter((e) => e.relationship === 'Contradicts').length,
    };
  }, [nodesData, edgesData]);

  return (
    <div className="space-y-3">
      {/* Top Filter & Search Control Panel */}
      <div className="legal-card p-3 bg-[#FAF8F5] border border-[#171717]/15 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topology entities, claims, docs..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#171717]/15 rounded-xs text-xs font-mono text-[#171717] focus:outline-none focus:border-[#6C2029]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#171717]/50 hover:text-[#6C2029]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Node Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-[#171717]/60 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'Document', 'Person', 'Evidence', 'Claim', 'Event', 'Location'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-2.5 py-1 text-[10px] rounded-xs transition-colors ${
                selectedTypeFilter === t
                  ? 'bg-[#6C2029] text-[#F4F0E7] font-bold shadow-xs'
                  : 'bg-white border border-[#171717]/15 text-[#171717]/75 hover:bg-[#EAE5D9]'
              }`}
            >
              {t} {t !== 'ALL' && stats.types[t] ? `(${stats.types[t]})` : t === 'ALL' ? `(${stats.total})` : ''}
            </button>
          ))}
        </div>

        {/* Conflict Filter & Layout Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setConflictOnlyFilter(!conflictOnlyFilter)}
            className={`px-2.5 py-1 text-[10px] font-mono rounded-xs border transition-colors flex items-center space-x-1 ${
              conflictOnlyFilter
                ? 'bg-[#92383B] text-white border-[#92383B] font-bold'
                : 'bg-white border-[#171717]/15 text-[#92383B] hover:bg-[#92383B]/10'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Contradictions Only</span>
          </button>

          <button
            onClick={() => setLayoutMode(layoutMode === 'HIERARCHICAL' ? 'GRID' : 'HIERARCHICAL')}
            className="px-2.5 py-1 text-[10px] font-mono rounded-xs bg-white border border-[#171717]/15 text-[#171717] hover:bg-[#EAE5D9] flex items-center space-x-1"
            title="Toggle Topology Layout"
          >
            <Layers className="w-3 h-3 text-[#AD8748]" />
            <span>{layoutMode === 'HIERARCHICAL' ? 'Hierarchical' : 'Grid Layout'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="h-[680px] legal-card relative overflow-hidden border-2 border-[#171717]/15 shadow-sm bg-[#F4F0E7]">
        {/* Visual Graph Legend Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-[#FAF8F5]/95 backdrop-blur-xs border border-[#171717]/15 p-2.5 rounded-xs shadow-xs text-[10px] font-mono space-y-1.5">
          <div className="font-bold text-[#171717] border-b border-[#171717]/10 pb-1 flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-[#6C2029]" />
              RELATIONSHIP TOPOLOGY
            </span>
            <span className="text-[9px] text-[#AD8748] font-semibold">{stats.connections} Edges</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
            <span className="flex items-center space-x-1.5 text-[#3E654F] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#3E654F]" />
              <span>Supports</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#92383B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#92383B] animate-pulse" />
              <span>Contradicts</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#6C2029] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#6C2029]" />
              <span>Derived From</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#AD8748] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#AD8748]" />
              <span>References</span>
            </span>
          </div>
        </div>

        {/* Live React Flow Topology */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => {
            if (node.data?.rawNode) {
              onSelectNode(node.data.rawNode as GraphNodeItem);
            }
          }}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#171717" gap={24} size={0.6} className="opacity-15" />
          <Controls className="!bg-[#FAF8F5] !border !border-[#171717]/20 !shadow-xs !rounded-xs" />
          <MiniMap
            nodeColor={(n) => {
              const raw = (n.data as any)?.rawNode;
              if (raw?.type === 'Person') return '#6C2029';
              if (raw?.type === 'Document') return '#2C3E50';
              if (raw?.type === 'Evidence') return '#AD8748';
              if (raw?.type === 'Claim') return '#3E654F';
              if (raw?.type === 'Event') return '#C2593F';
              return '#171717';
            }}
            maskColor="rgba(244, 240, 231, 0.7)"
            className="!bg-[#FAF8F5] !border !border-[#171717]/20 !rounded-xs !shadow-sm"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
