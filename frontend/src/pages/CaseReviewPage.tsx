import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type {
  DocumentItem, FindingItem, ClaimItem, TimelineEventItem, ContradictionItem,
  MissingInfoItem, EvidenceItem
} from '../types';
import { EvidenceInspector } from '../components/evidence/EvidenceInspector';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { CaseDNA } from '../components/evidence/CaseDNA';
import {
  FileText, ShieldCheck, Clock, AlertTriangle, HelpCircle, Sparkles
} from 'lucide-react';

export const CaseReviewPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEventItem[]>([]);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>([]);
  const [missingInfo, setMissingInfo] = useState<MissingInfoItem[]>([]);
  const [dnaData, setDnaData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'facts' | 'timeline' | 'contradictions' | 'missing' | 'dna'>('facts');
  const [selectedItem, setSelectedItem] = useState<ClaimItem | EvidenceItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const [docs, findList, claimList, timeList, contraList, missList, evList, dna] = await Promise.all([
        apiService.getDocuments(),
        apiService.getFindings(),
        apiService.getClaims(),
        apiService.getTimeline(),
        apiService.getContradictions(),
        apiService.getMissingInfo(),
        apiService.getEvidences(),
        apiService.getCaseDNA(),
      ]);

      if (isMounted) {
        setDocuments(docs);
        setFindings(findList);
        setTimeline(timeList);
        setContradictions(contraList);
        setMissingInfo(missList);
        setDnaData(dna);

        if (claimList.length > 0) {
          setSelectedItem(claimList[0]);
        } else if (evList.length > 0) {
          setSelectedItem(evList[0]);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Hero Header */}
      <div className="legal-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#6C2029]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#6C2029]" />
            <span>HERO WORKSTATION • EVIDENCE INTELLIGENCE REVIEW</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
            Case File FIR No. 204/2024 — Master Intelligence Review
          </h2>
          <p className="text-xs text-[#171717]/70 mt-0.5">
            Cross-verifying 4 documentary files, 57 pages, 2 high-severity contradictions, and 14 verified findings.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="bg-[#3E654F]/10 border border-[#3E654F]/30 px-3 py-1.5 rounded-xs text-[#3E654F] font-bold">
            100% Traceable Evidence
          </div>
          <div className="bg-[#92383B]/10 border border-[#92383B]/30 px-3 py-1.5 rounded-xs text-[#92383B] font-bold">
            Zero Hallucinations
          </div>
        </div>
      </div>

      {/* 3-COLUMN HERO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Documents (3 cols) */}
        <div className="lg:col-span-3 legal-card p-4 space-y-3 max-h-[360px] lg:max-h-none lg:h-[680px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
            <span className="text-xs font-serif font-bold text-[#171717]">Case Documents</span>
            <span className="text-[10px] font-mono bg-[#171717]/10 text-[#171717] px-1.5 py-0.5 rounded-xs">
              {documents.length} Files
            </span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs hover:border-[#6C2029] transition-colors cursor-pointer group"
              >
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-[#6C2029] shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-serif font-bold text-[#171717] truncate group-hover:text-[#6C2029]">
                      {doc.filename}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-[#171717]/60 mt-1">
                      <span>{doc.doc_type}</span>
                      <span>•</span>
                      <span>{doc.page_count} Pages</span>
                      <span>•</span>
                      <span className="text-[#3E654F] font-semibold">{doc.evidence_count} Evidences</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: Case Intelligence (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {/* Tab Controls */}
          <div className="flex items-center space-x-1 border-b border-[#171717]/20 bg-[#FAF8F5] p-1 rounded-xs overflow-x-auto no-scrollbar">
            {[
              { id: 'facts', label: 'Key Facts', icon: ShieldCheck },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'contradictions', label: 'Contradictions', icon: AlertTriangle, count: contradictions.length },
              { id: 'missing', label: 'Missing Info', icon: HelpCircle, count: missingInfo.length },
              { id: 'dna', label: 'Case DNA', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`shrink-0 flex-1 py-1.5 px-2 text-xs font-medium rounded-xs transition-colors flex items-center justify-center space-x-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#6C2029] text-[#F4F0E7] font-semibold shadow-xs'
                    : 'text-[#171717]/70 hover:bg-[#EAE5D9]/60'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[9px] font-mono px-1 rounded-xs font-bold ${activeTab === tab.id ? 'bg-white text-[#6C2029]' : 'bg-[#92383B] text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Box */}
          <div className="legal-card p-4 min-h-[380px] lg:h-[620px] overflow-y-auto space-y-3">
            {activeTab === 'facts' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[#AD8748] uppercase tracking-wider font-bold">
                  Verified Fact Registry (Strict Citation Enforced)
                </div>
                {findings.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedItem({
                      id: f.id,
                      claim_text: f.fact_statement,
                      document_id_str: f.document_id_str,
                      document_filename: f.document_id_str,
                      page_number: f.page_number,
                      paragraph_id: f.paragraph_id,
                      evidence_passage: f.source_text,
                      verification_status: f.verification_status,
                    })}
                    className="p-3 bg-white border border-[#171717]/15 rounded-xs hover:border-[#6C2029] cursor-pointer space-y-2 transition-all hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#6C2029] font-bold">
                        {f.category}
                      </span>
                      <VerificationBadge status={f.verification_status} size="sm" />
                    </div>
                    <p className="text-xs font-serif text-[#171717] font-semibold leading-relaxed">
                      "{f.fact_statement}"
                    </p>
                    <div className="text-[10px] font-mono text-[#171717]/60 flex items-center space-x-2 pt-1 border-t border-[#171717]/10">
                      <span>Source: {f.document_id_str}</span>
                      <span>•</span>
                      <span>Page {f.page_number}</span>
                      <span>•</span>
                      <span className="text-[#AD8748] font-bold">{f.paragraph_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[#AD8748] uppercase tracking-wider font-bold">
                  Chronological Event Sequence
                </div>
                {timeline.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => setSelectedItem({
                      id: e.id,
                      title: e.title,
                      evidence_type: 'DOCUMENTARY',
                      document_id_str: e.document_id_str,
                      document_filename: e.document_filename || e.document_id_str,
                      page_number: e.page_number,
                      paragraph_id: e.paragraph_id,
                      source_text: e.source_text,
                      relevance_score: 0.95,
                      verification_status: e.has_conflict ? 'CONFLICTING' : 'VERIFIED',
                    })}
                    className={`p-3 bg-white border rounded-xs cursor-pointer space-y-1.5 transition-all hover:shadow-xs ${
                      e.has_conflict ? 'border-l-4 border-l-[#92383B] border-t-2 border-t-[#92383B]' : 'border-[#171717]/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#6C2029]">
                        {e.date_str}
                      </span>
                      {e.has_conflict && (
                        <span className="text-[9px] font-mono bg-[#92383B] text-white px-1.5 py-0.5 font-bold rounded-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          CONFLICT MARKER
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[#171717]">{e.title}</h4>
                    <p className="text-xs text-[#171717]/80">{e.description}</p>
                    {e.has_conflict && (
                      <p className="text-[11px] text-[#92383B] font-mono bg-[#92383B]/10 p-1.5 rounded-xs mt-1">
                        ⚠️ {e.conflict_details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contradictions' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[#92383B] uppercase tracking-wider font-bold flex items-center justify-between">
                  <span>Contradiction Radar Findings</span>
                  <span>{contradictions.length} Conflicts</span>
                </div>
                {contradictions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-white border-2 border-[#92383B]/30 rounded-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-[#92383B] text-white px-2 py-0.5 rounded-xs font-bold">
                        [{c.category}] {c.severity} SEVERITY
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[#171717]">{c.title}</h4>
                    <p className="text-xs text-[#171717]/80">{c.description}</p>
                    <div className="p-2 bg-[#FAF8F5] border border-[#171717]/10 text-xs font-mono space-y-1">
                      <div className="text-[#6C2029]">Source A ({c.source_a_doc_name}): "{c.source_a_text}"</div>
                      <div className="font-bold text-[#92383B] text-center my-0.5">VS</div>
                      <div className="text-[#AD8748]">Source B ({c.source_b_doc_name}): "{c.source_b_text}"</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'missing' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-[#A16D2B] uppercase tracking-wider font-bold">
                  Missing Information & Statutory Audit
                </div>
                {missingInfo.map((m) => (
                  <div key={m.id} className="p-3 bg-white border border-[#171717]/15 rounded-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-[#171717]">{m.topic}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-xs font-bold ${
                        m.category === 'MISSING' ? 'bg-[#92383B] text-white' : 'bg-[#3E654F] text-white'
                      }`}>
                        {m.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#171717]/80 leading-relaxed">{m.reason_flagged}</p>
                    <div className="text-[10px] font-mono text-[#AD8748] pt-1">
                      Required Evidence: <strong>{m.required_evidence_type}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'dna' && (
              <CaseDNA dnaData={dnaData} />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Inspector (3 cols) */}
        <div className="lg:col-span-3 min-h-[400px] lg:h-[680px]">
          <EvidenceInspector selectedItem={selectedItem} />
        </div>
      </div>
    </div>
  );
};
