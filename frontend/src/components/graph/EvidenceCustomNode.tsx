import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { GraphNodeItem } from '../../types';
import {
  User, FileText, Scale, CheckCircle2, AlertTriangle,
  Clock, MapPin, Sparkles, Shield
} from 'lucide-react';

export interface EvidenceNodeData {
  rawNode: GraphNodeItem;
  isSelected?: boolean;
  isHighlighted?: boolean;
}

export const EvidenceCustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as EvidenceNodeData;
  const rawNode = nodeData?.rawNode;

  if (!rawNode) return null;

  const { label, type, properties_json, properties } = rawNode;
  const propsObj = properties || (properties_json ? (() => { try { return JSON.parse(properties_json); } catch { return {}; } })() : {});

  // Determine configuration based on Node Type
  const getTypeConfig = () => {
    switch (type) {
      case 'Person':
        return {
          icon: <User className="w-3.5 h-3.5" />,
          badgeBg: 'bg-[#6C2029] text-white',
          borderColor: 'border-[#6C2029]',
          bgGradient: 'from-[#FAF8F5] to-[#F5ECE8]',
          accentText: 'text-[#6C2029]',
          category: 'INDIVIDUAL / PARTY',
        };
      case 'Document':
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          badgeBg: 'bg-[#2C3E50] text-white',
          borderColor: 'border-[#2C3E50]',
          bgGradient: 'from-[#FAF8F5] to-[#EEF2F6]',
          accentText: 'text-[#2C3E50]',
          category: 'DOCUMENTARY RECORD',
        };
      case 'Evidence':
        return {
          icon: <Scale className="w-3.5 h-3.5" />,
          badgeBg: 'bg-[#AD8748] text-white',
          borderColor: 'border-[#AD8748]',
          bgGradient: 'from-[#FAF8F5] to-[#FBF7EE]',
          accentText: 'text-[#AD8748]',
          category: 'CORROBORATIVE EVIDENCE',
        };
      case 'Claim':
        const isConflict = propsObj?.status === 'CONFLICTING';
        return {
          icon: isConflict ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />,
          badgeBg: isConflict ? 'bg-[#92383B] text-white' : 'bg-[#3E654F] text-white',
          borderColor: isConflict ? 'border-[#92383B]' : 'border-[#3E654F]',
          bgGradient: isConflict ? 'from-[#FAF8F5] to-[#FDF0F0]' : 'from-[#FAF8F5] to-[#EEF7F2]',
          accentText: isConflict ? 'text-[#92383B]' : 'text-[#3E654F]',
          category: isConflict ? 'DISPUTED CLAIM' : 'VERIFIED CLAIM',
        };
      case 'Event':
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          badgeBg: 'bg-[#C2593F] text-white',
          borderColor: 'border-[#C2593F]',
          bgGradient: 'from-[#FAF8F5] to-[#FBF0EC]',
          accentText: 'text-[#C2593F]',
          category: 'TIMELINE EVENT',
        };
      case 'Location':
        return {
          icon: <MapPin className="w-3.5 h-3.5" />,
          badgeBg: 'bg-[#3B4261] text-white',
          borderColor: 'border-[#3B4261]',
          bgGradient: 'from-[#FAF8F5] to-[#EEF0F8]',
          accentText: 'text-[#3B4261]',
          category: 'JURISDICTION / LOCUS',
        };
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          badgeBg: 'bg-[#171717] text-white',
          borderColor: 'border-[#171717]',
          bgGradient: 'from-[#FAF8F5] to-[#F0EBE1]',
          accentText: 'text-[#171717]',
          category: 'CASE ENTITY',
        };
    }
  };

  const config = getTypeConfig();
  const isSelected = selected || nodeData.isSelected;
  const isConflict = propsObj?.status === 'CONFLICTING';

  return (
    <div
      className={`relative w-[240px] rounded-xs transition-all duration-200 cursor-pointer select-none bg-gradient-to-b ${config.bgGradient} border-2 ${
        isSelected
          ? `${config.borderColor} shadow-lg ring-2 ring-[#AD8748] scale-102`
          : 'border-[#171717]/15 hover:border-[#171717]/40 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Target Handles */}
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#171717] !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-[#171717] !border-2 !border-white" />

      {/* Card Header Banner */}
      <div className="p-2.5 pb-1.5 flex items-center justify-between border-b border-[#171717]/10">
        <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs tracking-wider uppercase ${config.badgeBg}`}>
          {config.icon}
          <span>{type}</span>
        </span>

        {isConflict && (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#92383B] bg-[#92383B]/10 px-1 py-0.5 rounded-xs animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            CONFLICT
          </span>
        )}

        {propsObj?.status === 'VERIFIED' && (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#3E654F] bg-[#3E654F]/10 px-1 py-0.5 rounded-xs">
            <Shield className="w-2.5 h-2.5" />
            VERIFIED
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-2.5 pt-2 space-y-1.5">
        <h4 className="font-serif font-bold text-xs text-[#171717] leading-snug line-clamp-2">
          {label}
        </h4>

        {/* Dynamic Metadata Chips */}
        <div className="flex flex-wrap gap-1 text-[9px] font-mono text-[#171717]/70">
          {propsObj?.role && (
            <span className="px-1.5 py-0.5 bg-white/80 border border-[#171717]/10 rounded-xs">
              {propsObj.role}
            </span>
          )}
          {propsObj?.pages && (
            <span className="px-1.5 py-0.5 bg-white/80 border border-[#171717]/10 rounded-xs font-semibold">
              {propsObj.pages} Pages
            </span>
          )}
          {propsObj?.amount && (
            <span className="px-1.5 py-0.5 bg-white/80 border border-[#171717]/10 rounded-xs font-bold text-[#6C2029]">
              {propsObj.amount}
            </span>
          )}
          {propsObj?.date && (
            <span className="px-1.5 py-0.5 bg-white/80 border border-[#171717]/10 rounded-xs">
              {propsObj.date}
            </span>
          )}
          {propsObj?.location && (
            <span className="px-1.5 py-0.5 bg-white/80 border border-[#171717]/10 rounded-xs">
              📍 {propsObj.location}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="px-2.5 py-1 bg-black/5 rounded-b-xs flex items-center justify-between text-[8px] font-mono text-[#171717]/50">
        <span>ID: {rawNode.node_id}</span>
        <span className="uppercase">{config.category}</span>
      </div>

      {/* Source Handles */}
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-[#6C2029] !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-[#6C2029] !border-2 !border-white" />
    </div>
  );
};
