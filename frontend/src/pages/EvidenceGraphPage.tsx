import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';
import type { GraphNodeItem, GraphEdgeItem } from '../types';
import { EvidenceGraph } from '../components/graph/EvidenceGraph';
import { VerificationBadge } from '../components/common/VerificationBadge';
import {
  Network, Share2, AlertTriangle, ShieldCheck,
  FileText, User, Scale, Clock, MapPin, ExternalLink,
  Copy, Check, Sparkles, ArrowRight, ArrowLeft
} from 'lucide-react';

export const EvidenceGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNodeItem[]>([]);
  const [edges, setEdges] = useState<GraphEdgeItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNodeItem | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    apiService.getEvidenceGraph().then((res) => {
      if (isMounted) {
        setNodes(res.nodes);
        setEdges(res.edges);
        if (res.nodes.length > 0) {
          setSelectedNode(res.nodes[0]);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute connected inbound and outbound edges for the selected node
  const connectedEdges = useMemo(() => {
    if (!selectedNode) return { inbound: [], outbound: [] };
    const nodeId = selectedNode.node_id || selectedNode.id;

    const inbound = edges
      .filter((e) => e.target === nodeId)
      .map((e) => {
        const sourceNode = nodes.find((n) => n.node_id === e.source || n.id === e.source);
        return { edge: e, node: sourceNode };
      });

    const outbound = edges
      .filter((e) => e.source === nodeId)
      .map((e) => {
        const targetNode = nodes.find((n) => n.node_id === e.target || n.id === e.target);
        return { edge: e, node: targetNode };
      });

    return { inbound, outbound };
  }, [selectedNode, nodes, edges]);

  // Extract properties object
  const nodeProps = useMemo(() => {
    if (!selectedNode) return {};
    if (selectedNode.properties) return selectedNode.properties;
    if (selectedNode.properties_json) {
      try {
        return JSON.parse(selectedNode.properties_json);
      } catch {
        return {};
      }
    }
    return {};
  }, [selectedNode]);

  const handleCopyCitation = () => {
    if (!selectedNode) return;
    const citation = `[Evidence Topology Node: ${selectedNode.label} (${selectedNode.type}) | ID: ${selectedNode.node_id}]`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Person': return <User className="w-4 h-4 text-[#6C2029]" />;
      case 'Document': return <FileText className="w-4 h-4 text-[#2C3E50]" />;
      case 'Evidence': return <Scale className="w-4 h-4 text-[#AD8748]" />;
      case 'Claim': return <ShieldCheck className="w-4 h-4 text-[#3E654F]" />;
      case 'Event': return <Clock className="w-4 h-4 text-[#C2593F]" />;
      case 'Location': return <MapPin className="w-4 h-4 text-[#3B4261]" />;
      default: return <Sparkles className="w-4 h-4 text-[#171717]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
            <Network className="w-4 h-4 text-[#6C2029]" />
            <span>CASE TOPOLOGY & EVIDENTIARY NETWORK</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
            Interactive Evidence Graph Topology
          </h2>
          <p className="text-xs text-[#171717]/70 mt-0.5">
            Visualize relationships between Documents, Forensic Evidence, Events, and Legal Claims. Red dashed paths represent detected material contradictions.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs text-center">
            <span className="text-[10px] text-[#171717]/60 block uppercase">Entities</span>
            <span className="font-bold text-[#171717]">{nodes.length} Nodes</span>
          </div>
          <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs text-center">
            <span className="text-[10px] text-[#171717]/60 block uppercase">Relations</span>
            <span className="font-bold text-[#6C2029]">{edges.length} Edges</span>
          </div>
          <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs text-center">
            <span className="text-[10px] text-[#171717]/60 block uppercase">Conflicts</span>
            <span className="font-bold text-[#92383B]">
              {edges.filter((e) => e.relationship === 'Contradicts').length} Flagged
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid (8 cols graph + 4 cols inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* React Flow Graph Canvas (8 cols) */}
        <div className="lg:col-span-8">
          <EvidenceGraph
            nodesData={nodes}
            edgesData={edges}
            onSelectNode={(n) => setSelectedNode(n)}
            selectedNodeId={selectedNode?.node_id}
          />
        </div>

        {/* Rich Entity Inspector & Link Explorer (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {selectedNode ? (
            <div className="legal-card p-4 space-y-4 bg-white border border-[#171717]/20 shadow-xs h-[740px] overflow-y-auto">
              {/* Header */}
              <div className="border-b border-[#171717]/10 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {getNodeIcon(selectedNode.type)}
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717]">
                      {selectedNode.type} Entity
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#171717]/60 bg-[#FAF8F5] px-1.5 py-0.5 border border-[#171717]/10 rounded-xs">
                    {selectedNode.node_id}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#171717] leading-snug">
                  {selectedNode.label}
                </h3>

                <div className="flex items-center justify-between pt-1">
                  <VerificationBadge
                    status={
                      nodeProps?.status === 'CONFLICTING'
                        ? 'CONFLICTING'
                        : selectedNode.type === 'Claim' || selectedNode.type === 'Evidence'
                        ? 'VERIFIED'
                        : 'VERIFIED'
                    }
                  />

                  <button
                    onClick={handleCopyCitation}
                    className="p-1.5 text-xs font-mono text-[#171717]/70 hover:text-[#6C2029] hover:bg-[#EAE5D9]/50 rounded-xs flex items-center space-x-1"
                    title="Copy Citation"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5 text-[#3E654F]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedCitation ? 'Copied' : 'Cite'}</span>
                  </button>
                </div>
              </div>

              {/* Conflict Alert Banner if applicable */}
              {nodeProps?.status === 'CONFLICTING' && (
                <div className="p-2.5 bg-[#92383B]/10 border border-[#92383B]/30 rounded-xs text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-[#92383B] font-mono font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>CONTRADICTION DETECTED IN CORPUS</span>
                  </div>
                  <p className="text-[11px] text-[#171717]/80">
                    This claim is directly rebutted by official Swiss Air immigration passport manifests.
                  </p>
                </div>
              )}

              {/* Entity Attributes Table */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/60 font-semibold">
                  Entity Metadata & Properties:
                </span>
                <div className="bg-[#FAF8F5] border border-[#171717]/10 rounded-xs overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-[#171717]/10">
                      <tr className="hover:bg-white/50">
                        <td className="p-2 font-mono text-[10px] text-[#171717]/60 w-1/3">Node Type</td>
                        <td className="p-2 font-mono font-bold text-[#171717]">{selectedNode.type}</td>
                      </tr>
                      {Object.entries(nodeProps).map(([k, v]) => (
                        <tr key={k} className="hover:bg-white/50">
                          <td className="p-2 font-mono text-[10px] text-[#171717]/60 capitalize w-1/3">
                            {k.replace(/_/g, ' ')}
                          </td>
                          <td className="p-2 font-mono text-[#171717] break-words">
                            {String(v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Connected Relationships Explorer */}
              <div className="space-y-2 pt-2 border-t border-[#171717]/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/60 font-semibold flex items-center justify-between">
                  <span>Connected Topology ({connectedEdges.inbound.length + connectedEdges.outbound.length}):</span>
                  <Share2 className="w-3 h-3 text-[#AD8748]" />
                </span>

                {/* Inbound Relations */}
                {connectedEdges.inbound.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#171717]/50 flex items-center gap-1">
                      <ArrowLeft className="w-2.5 h-2.5" /> Inbound Influences:
                    </span>
                    <div className="space-y-1">
                      {connectedEdges.inbound.map(({ edge, node }) => (
                        <button
                          key={edge.id}
                          onClick={() => node && setSelectedNode(node)}
                          className="w-full p-2 bg-[#FAF8F5] hover:bg-[#EAE5D9]/60 border border-[#171717]/10 rounded-xs text-left transition-colors flex items-center justify-between"
                        >
                          <div className="truncate mr-2">
                            <span className="text-[9px] font-mono font-bold uppercase text-[#6C2029] block">
                              {edge.relationship}
                            </span>
                            <span className="font-serif text-xs font-bold text-[#171717] truncate block">
                              {node ? node.label : edge.source}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#171717]/40 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outbound Relations */}
                {connectedEdges.outbound.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] font-mono text-[#171717]/50 flex items-center gap-1">
                      <ArrowRight className="w-2.5 h-2.5" /> Outbound Relationships:
                    </span>
                    <div className="space-y-1">
                      {connectedEdges.outbound.map(({ edge, node }) => (
                        <button
                          key={edge.id}
                          onClick={() => node && setSelectedNode(node)}
                          className="w-full p-2 bg-[#FAF8F5] hover:bg-[#EAE5D9]/60 border border-[#171717]/10 rounded-xs text-left transition-colors flex items-center justify-between"
                        >
                          <div className="truncate mr-2">
                            <span className={`text-[9px] font-mono font-bold uppercase block ${
                              edge.relationship === 'Contradicts' ? 'text-[#92383B]' : 'text-[#3E654F]'
                            }`}>
                              {edge.relationship}
                            </span>
                            <span className="font-serif text-xs font-bold text-[#171717] truncate block">
                              {node ? node.label : edge.target}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#171717]/40 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="legal-card p-8 text-center text-xs font-mono text-[#171717]/50 flex flex-col items-center justify-center space-y-2 h-[600px]">
              <Network className="w-8 h-8 text-[#171717]/30" />
              <p>Click any entity or node in the topology canvas to inspect authoritative citations and connected relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
