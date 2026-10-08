import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { ContradictionItem } from '../types';
import { ContradictionRadarModal } from '../components/contradiction/ContradictionRadarModal';
import { AlertTriangle, ArrowRightLeft } from 'lucide-react';

export const ContradictionRadarPage: React.FC = () => {
  const [items, setItems] = useState<ContradictionItem[]>([]);
  const [activeModalItem, setActiveModalItem] = useState<ContradictionItem | null>(null);

  useEffect(() => {
    apiService.getContradictions().then(setItems);
  }, []);

  return (
    <div className="space-y-4">
      <div className="legal-card p-5 border-l-4 border-l-[#92383B]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#92383B] font-bold">
          <AlertTriangle className="w-4 h-4 text-[#92383B]" />
          <span>CONTRADICTION RADAR DETECTOR</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Material Discrepancies & Conflict Analysis
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Automatic detection across Dates, Names, Locations, Amounts, Events, and Relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="legal-card p-5 space-y-3 flex flex-col justify-between hover:border-[#92383B]/50 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono bg-[#92383B] text-white px-2 py-0.5 rounded-xs font-bold">
                  [{item.category}] {item.severity} SEVERITY
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#171717]">{item.title}</h3>
              <p className="text-xs text-[#171717]/80 leading-relaxed">{item.description}</p>
            </div>

            {/* Quick Citation Compare Preview */}
            <div className="p-3 bg-[#EAE5D9]/40 border border-[#171717]/10 rounded-xs space-y-2 text-xs font-mono">
              <div className="flex items-center space-x-2 text-[#6C2029]">
                <strong className="text-[10px] uppercase">Source A:</strong>
                <span className="truncate">{item.source_a_doc_name} (P.{item.source_a_page})</span>
              </div>
              <div className="text-center text-[10px] font-bold text-[#92383B]">VS</div>
              <div className="flex items-center space-x-2 text-[#AD8748]">
                <strong className="text-[10px] uppercase">Source B:</strong>
                <span className="truncate">{item.source_b_doc_name} (P.{item.source_b_page})</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModalItem(item)}
              className="w-full py-2 bg-[#6C2029] text-[#F4F0E7] text-xs font-medium rounded-xs hover:bg-[#54181F] transition-colors flex items-center justify-center space-x-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Inspect Side-by-Side Comparison</span>
            </button>
          </div>
        ))}
      </div>

      <ContradictionRadarModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
      />
    </div>
  );
};
