import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { MissingInfoItem } from '../types';
import { HelpCircle } from 'lucide-react';

export const MissingInfoPage: React.FC = () => {
  const [items, setItems] = useState<MissingInfoItem[]>([]);

  useEffect(() => {
    apiService.getMissingInfo().then(setItems);
  }, []);

  return (
    <div className="space-y-4">
      <div className="legal-card p-5 border-l-4 border-l-[#A16D2B]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#A16D2B] font-bold">
          <HelpCircle className="w-4 h-4 text-[#A16D2B]" />
          <span>MISSING INFORMATION & EVIDENTIARY AUDIT DETECTOR</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Missing Evidence Audit & Explanations
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Identifies unbacked claims, missing statutory mandates, and absent certificates. Never invents values.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="legal-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
              <h3 className="font-serif text-lg font-bold text-[#171717]">{item.topic}</h3>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-xs font-bold ${
                item.category === 'MISSING'
                  ? 'bg-[#92383B] text-white'
                  : item.category === 'CONFIRMED'
                  ? 'bg-[#3E654F] text-white'
                  : 'bg-[#A16D2B] text-white'
              }`}>
                [{item.category}]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/12 rounded-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#92383B] font-bold block">
                  Why Flagged by Engine
                </span>
                <p className="text-[#171717]/80 leading-relaxed">{item.reason_flagged}</p>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/12 rounded-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#AD8748] font-bold block">
                  Impact Assessment & Required Remedy
                </span>
                <p className="text-[#171717]/80 leading-relaxed">{item.impact_assessment}</p>
                <div className="text-[10px] font-mono text-[#6C2029] font-bold pt-1">
                  Required Format: {item.required_evidence_type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
