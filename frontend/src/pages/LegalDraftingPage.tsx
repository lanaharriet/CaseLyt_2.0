import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { LegalDraftItem } from '../types';
import { Edit3, Copy, Check } from 'lucide-react';

export const LegalDraftingPage: React.FC = () => {
  const [draftType, setDraftType] = useState<string>('BAIL_APPLICATION');
  const [draft, setDraft] = useState<LegalDraftItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleGenerateDraft('BAIL_APPLICATION');
  }, []);

  const handleGenerateDraft = async (type: string) => {
    setDraftType(type);
    const res = await apiService.generateDraft(type);
    setDraft(res);
  };

  const handleCopyDraft = () => {
    if (draft?.content) {
      navigator.clipboard.writeText(draft.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
          <Edit3 className="w-4 h-4 text-[#6C2029]" />
          <span>EVIDENCE-BOUND LEGAL DRAFTING ENGINE</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Automated Legal Drafting Workspace
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Drafts may only use verified facts. Any unverified or absent parameter is formatted strictly as <span className="font-mono text-[#92383B] font-bold">[INFORMATION NOT FOUND IN CASE FILE]</span>.
        </p>
      </div>

      {/* Draft Type Selection Bar */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'BAIL_APPLICATION', label: 'Bail Application (CrPC 439)' },
          { id: 'LEGAL_NOTICE', label: 'Legal Retraction Notice' },
          { id: 'AFFIDAVIT', label: 'Affidavit of Verified Facts' },
          { id: 'PETITION', label: 'Writ Petition (Article 226)' },
        ].map((dt) => (
          <button
            key={dt.id}
            onClick={() => handleGenerateDraft(dt.id)}
            className={`px-4 py-2 text-xs font-mono rounded-xs transition-colors ${
              draftType === dt.id
                ? 'bg-[#6C2029] text-[#F4F0E7] font-bold shadow-xs'
                : 'bg-[#FAF8F5] border border-[#171717]/15 text-[#171717] hover:bg-[#EAE5D9]'
            }`}
          >
            {dt.label}
          </button>
        ))}
      </div>

      {/* Draft Content & Rules Bar */}
      {draft && (
        <div className="space-y-3">
          <div className="legal-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#EAE5D9]/40">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171717]">{draft.title}</h3>
              <div className="flex items-center space-x-4 text-xs font-mono text-[#171717]/70 mt-0.5">
                <span className="text-[#3E654F] font-bold">✓ {draft.verified_facts_count} Verified Facts Injected</span>
                <span className="text-[#92383B] font-bold">⚠️ {draft.missing_variables_count} Missing Values Flagged</span>
              </div>
            </div>

            <button
              onClick={handleCopyDraft}
              className="px-4 py-2 bg-[#171717] text-[#F4F0E7] text-xs font-medium rounded-xs hover:bg-[#333] transition-colors flex items-center justify-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#3E654F]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Draft Text'}</span>
            </button>
          </div>

          {/* Draft Preview Box */}
          <div className="legal-card p-6 bg-white font-mono text-xs leading-relaxed text-[#171717] whitespace-pre-wrap border-2 border-[#171717]/20 shadow-inner max-h-[600px] overflow-y-auto select-text">
            {draft.content}
          </div>
        </div>
      )}
    </div>
  );
};
