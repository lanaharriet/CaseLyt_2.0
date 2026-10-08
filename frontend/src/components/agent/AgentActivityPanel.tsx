import React from 'react';
import type { AgentStepItem } from '../../types';
import { CheckCircle2, Clock, Cpu } from 'lucide-react';

interface AgentActivityPanelProps {
  steps: AgentStepItem[];
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({ steps }) => {
  return (
    <div className="legal-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#171717]/15 pb-3">
        <div className="flex items-center space-x-2.5">
          <Cpu className="w-5 h-5 text-[#6C2029]" />
          <div>
            <h3 className="font-serif text-lg font-bold text-[#171717]">Agent Activity Panel</h3>
            <p className="text-xs text-[#171717]/60">High-Level Pipeline Operations Audit Log</p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-[#AD8748] bg-[#AD8748]/10 px-2.5 py-1 rounded-xs border border-[#AD8748]/30">
          PROVENANCE PROTECTED • NO CHAIN-OF-THOUGHT EXPOSED
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#171717]/12 rounded-xs hover:border-[#6C2029]/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#3E654F] shrink-0" />
              <div>
                <span className="text-xs font-semibold text-[#171717] font-mono">
                  {step.display_title}
                </span>
                {step.details_summary && (
                  <p className="text-[11px] text-[#171717]/60 font-sans mt-0.5">
                    {step.details_summary}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#171717]/50">
              <Clock className="w-3 h-3" />
              <span>{step.timestamp_formatted || '18:00:00 IST'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
