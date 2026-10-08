import React from 'react';
import type { ContradictionItem } from '../../types';
import { AlertTriangle, X } from 'lucide-react';

interface ContradictionRadarModalProps {
  item: ContradictionItem | null;
  onClose: () => void;
}

export const ContradictionRadarModal: React.FC<ContradictionRadarModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#171717]/30 max-w-4xl w-full rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#6C2029] text-[#F4F0E7] p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-[#AD8748]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#AD8748] font-bold">
                CONTRADICTION RADAR • SIDE-BY-SIDE VERIFICATION AUDIT
              </span>
              <h2 className="font-serif text-xl font-bold leading-tight">
                [{item.category}] {item.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-xs transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Description */}
        <div className="p-4 bg-[#EAE5D9]/40 border-b border-[#171717]/15">
          <p className="text-xs text-[#171717] font-medium leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 relative">
          {/* Source A */}
          <div className="bg-white border-2 border-[#6C2029]/30 rounded-xs p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                <span className="text-xs font-mono font-bold text-[#6C2029]">SOURCE A COORDINATES</span>
                <span className="text-[10px] font-mono bg-[#6C2029]/10 text-[#6C2029] px-2 py-0.5 rounded-xs font-semibold">
                  PRIMARY PROSECUTION FILE
                </span>
              </div>
              <div className="text-xs font-mono text-[#171717]/70 space-y-0.5">
                <div>Document: <strong className="text-[#171717]">{item.source_a_doc_name}</strong></div>
                <div>Page: <strong className="text-[#171717]">{item.source_a_page}</strong> | Para: <strong className="text-[#171717]">{item.source_a_para}</strong></div>
              </div>
              <div className="mt-2 p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs font-serif text-xs leading-relaxed text-[#171717] italic">
                "{item.source_a_text}"
              </div>
            </div>
          </div>

          {/* VS Divider in middle for visual impact */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#6C2029] text-white w-8 h-8 rounded-full items-center justify-center font-mono font-bold text-xs shadow-md border-2 border-white">
            VS
          </div>

          {/* Source B */}
          <div className="bg-white border-2 border-[#AD8748]/30 rounded-xs p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                <span className="text-xs font-mono font-bold text-[#AD8748]">SOURCE B COORDINATES</span>
                <span className="text-[10px] font-mono bg-[#AD8748]/10 text-[#AD8748] px-2 py-0.5 rounded-xs font-semibold">
                  AUDIT / DEFENSE RECORD
                </span>
              </div>
              <div className="text-xs font-mono text-[#171717]/70 space-y-0.5">
                <div>Document: <strong className="text-[#171717]">{item.source_b_doc_name}</strong></div>
                <div>Page: <strong className="text-[#171717]">{item.source_b_page}</strong> | Para: <strong className="text-[#171717]">{item.source_b_para}</strong></div>
              </div>
              <div className="mt-2 p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs font-serif text-xs leading-relaxed text-[#171717] italic">
                "{item.source_b_text}"
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#171717]/15 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#171717] text-[#F4F0E7] text-xs font-medium rounded-xs hover:bg-[#333] transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
