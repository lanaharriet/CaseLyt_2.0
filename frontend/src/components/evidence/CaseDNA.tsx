import React from 'react';
import { Users, MapPin, Calendar, FileText } from 'lucide-react';

interface CaseDNAProps {
  dnaData: {
    people: Array<{ id: string; label: string }>;
    locations: Array<{ id: string; label: string }>;
    events: Array<{ id: string; label: string }>;
    documents: Array<{ id: string; label: string }>;
    total_evidence_items: number;
    verified_claims_count: number;
    conflicting_claims_count: number;
    key_findings_count: number;
  } | null;
}

export const CaseDNA: React.FC<CaseDNAProps> = ({ dnaData }) => {
  if (!dnaData) return null;

  const sections = [
    { title: 'Entities / People', icon: Users, items: dnaData.people.map(p => p.label), color: 'border-[#6C2029]' },
    { title: 'Locations & Jurisdiction', icon: MapPin, items: dnaData.locations.map(l => l.label), color: 'border-[#AD8748]' },
    { title: 'Key Case Events', icon: Calendar, items: dnaData.events.map(e => e.label), color: 'border-[#3E654F]' },
    { title: 'Document Corpus', icon: FileText, items: dnaData.documents.map(d => d.label), color: 'border-[#171717]' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#171717]">Case DNA Evidence Map</h3>
          <p className="text-xs text-[#171717]/60">Automated extraction of foundational case parameters</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="bg-[#3E654F]/10 text-[#3E654F] border border-[#3E654F]/30 px-2 py-0.5 rounded-xs">
            {dnaData.verified_claims_count} Verified Claims
          </span>
          <span className="bg-[#92383B]/10 text-[#92383B] border border-[#92383B]/30 px-2 py-0.5 rounded-xs">
            {dnaData.conflicting_claims_count} Conflicts Flagged
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map((sec, idx) => (
          <div key={idx} className={`legal-card p-3.5 space-y-2 border-t-2 ${sec.color}`}>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#171717]">
              <sec.icon className="w-4 h-4 text-[#6C2029]" />
              <span>{sec.title}</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {sec.items.length > 0 ? (
                sec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="text-xs bg-[#F4F0E7] p-1.5 rounded-xs border border-[#171717]/10 font-mono text-[#171717]">
                    • {item}
                  </div>
                ))
              ) : (
                <span className="text-xs text-[#171717]/40 italic">None extracted</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
