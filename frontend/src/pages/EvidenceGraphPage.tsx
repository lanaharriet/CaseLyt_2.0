import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { GraphNodeItem, GraphEdgeItem } from '../types';
import { EvidenceGraph } from '../components/graph/EvidenceGraph';
import { EvidenceInspector } from '../components/evidence/EvidenceInspector';
import { Network } from 'lucide-react';

export const EvidenceGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNodeItem[]>([]);
  const [edges, setEdges] = useState<GraphEdgeItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNodeItem | null>(null);

  useEffect(() => {
    apiService.getEvidenceGraph().then(res => {
      setNodes(res.nodes);
      setEdges(res.edges);
      if (res.nodes.length > 0) setSelectedNode(res.nodes[0]);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
          <Network className="w-4 h-4 text-[#6C2029]" />
          <span>EVIDENCE GRAPH TOPOLOGY CANVAS</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Interactive Case Topology Graph
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Nodes: Person, Location, Date, Event, Document, Evidence, Claim. Relationships: Supports, Contradicts, References, Derived From.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Graph Canvas (8 cols) */}
        <div className="lg:col-span-8">
          <EvidenceGraph
            nodesData={nodes}
            edgesData={edges}
            onSelectNode={(n) => setSelectedNode(n)}
          />
        </div>

        {/* Evidence Inspector / Details (4 cols) */}
        <div className="lg:col-span-4 h-[600px]">
          <EvidenceInspector
            selectedItem={selectedNode ? {
              id: selectedNode.id,
              title: selectedNode.label,
              evidence_type: 'DOCUMENTARY',
              document_id_str: selectedNode.properties?.document || 'Case Topology Node',
              document_filename: selectedNode.properties?.document || 'Case Topology Node',
              page_number: selectedNode.properties?.page || 1,
              paragraph_id: selectedNode.node_id,
              source_text: `Node Label: "${selectedNode.label}". Node Type: ${selectedNode.type}. Properties: ${JSON.stringify(selectedNode.properties)}`,
              relevance_score: 0.99,
              verification_status: selectedNode.type === 'Claim' ? 'VERIFIED' : 'VERIFIED',
            } : null}
          />
        </div>
      </div>
    </div>
  );
};
