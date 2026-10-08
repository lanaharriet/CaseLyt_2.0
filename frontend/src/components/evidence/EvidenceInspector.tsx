import React, { useState } from 'react';
import type { ClaimItem, EvidenceItem, VerificationStatus } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { FileText, Copy, ExternalLink, CornerDownRight, Check } from 'lucide-react';

interface EvidenceInspectorProps {
  selectedItem: ClaimItem | EvidenceItem | null;
  onOpenSourceModal?: (docName: string, page: number, paraId: string) => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  selectedItem,
  onOpenSourceModal
}) => {
  const [copied, setCopied] = useState(false);

  if (!selectedItem) {
    return (
      <div className="h-full legal-card p-6 flex flex-col items-center justify-center text-center text-[#171717]/50">
        <FileText className="w-10 h-10 stroke-1 text-[#AD8748] mb-3" />
        <h3 className="font-serif text-lg font-semibold text-[#171717]">Evidence Inspector</h3>
        <p className="text-xs max-w-xs mt-1 text-[#171717]/60">
          Select any finding, claim, timeline event, or node in the case review to inspect its authoritative source passage.
        </p>
      </div>
    );
  }

  const isClaim = 'claim_text' in selectedItem;
  const claimText = isClaim ? (selectedItem as ClaimItem).claim_text : (selectedItem as EvidenceItem).title;
  const sourceDoc = selectedItem.document_filename || selectedItem.document_id_str;
  const pageNum = selectedItem.page_number;
  const paraId = selectedItem.paragraph_id;
  const passageText = isClaim ? (selectedItem as ClaimItem).evidence_passage : (selectedItem as EvidenceItem).source_text;
  const status: VerificationStatus = selectedItem.verification_status;
  const conflictNotes = isClaim ? (selectedItem as ClaimItem).conflict_notes : undefined;

  const citationString = `[Ref: ${sourceDoc}, Page ${pageNum}, Para ${paraId}] "${passageText}"`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full legal-card p-5 flex flex-col justify-between overflow-y-auto space-y-4">
      <div className="space-y-4">
        {/* Header Title */}
        <div className="flex items-start justify-between border-b border-[#171717]/15 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#AD8748] font-bold">
              Citation Verification Record
            </span>
            <h3 className="font-serif text-lg font-bold text-[#171717] leading-tight mt-0.5">
              Evidence Inspector
            </h3>
          </div>
          <VerificationBadge status={status} size="sm" />
        </div>

        {/* Claim / Statement */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/60 font-semibold">
            {isClaim ? 'Analyzed Claim' : 'Evidence Title'}
          </label>
          <div className="p-3 bg-[#EAE5D9]/50 border border-[#171717]/15 rounded-xs text-xs font-medium text-[#171717] leading-relaxed">
            "{claimText}"
          </div>
        </div>

        {/* Source Coordinates */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="p-2 bg-[#F4F0E7] border border-[#171717]/10 rounded-xs">
            <span className="text-[9px] font-mono uppercase text-[#171717]/50 block">Source Doc</span>
            <span className="text-xs font-mono font-bold text-[#6C2029] truncate block" title={sourceDoc}>
              {sourceDoc}
            </span>
          </div>
          <div className="p-2 bg-[#F4F0E7] border border-[#171717]/10 rounded-xs">
            <span className="text-[9px] font-mono uppercase text-[#171717]/50 block">Page Num</span>
            <span className="text-xs font-mono font-bold text-[#171717]">Page {pageNum}</span>
          </div>
          <div className="p-2 bg-[#F4F0E7] border border-[#171717]/10 rounded-xs">
            <span className="text-[9px] font-mono uppercase text-[#171717]/50 block">Paragraph ID</span>
            <span className="text-xs font-mono font-bold text-[#AD8748] truncate block" title={paraId}>
              {paraId}
            </span>
          </div>
        </div>

        {/* Evidence Passage (Crucial Rule: Never store/display without source text) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/60 font-semibold flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-[#6C2029]" />
              <span>Verifiable Source Passage (Corpus Text)</span>
            </label>
            <span className="text-[9px] font-mono text-[#3E654F] font-bold">100% UNEDITED</span>
          </div>
          <div className="p-3.5 bg-white border border-[#171717]/20 rounded-xs font-serif text-xs text-[#171717] leading-relaxed border-l-4 border-l-[#6C2029] shadow-inner max-h-48 overflow-y-auto">
            "{passageText}"
          </div>
        </div>

        {/* Conflict notes if conflicting */}
        {conflictNotes && (
          <div className="p-3 bg-[#92383B]/10 border border-[#92383B]/30 rounded-xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#92383B] font-bold block">
              Contradiction Alert
            </span>
            <p className="text-xs text-[#92383B] leading-relaxed">
              {conflictNotes}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-3 border-t border-[#171717]/15 flex items-center space-x-2">
        <button
          onClick={() => onOpenSourceModal && onOpenSourceModal(sourceDoc, pageNum, paraId)}
          className="flex-1 py-2 px-3 bg-[#171717] text-[#F4F0E7] hover:bg-[#333] transition-colors text-xs font-medium rounded-xs flex items-center justify-center space-x-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Source Page</span>
        </button>

        <button
          onClick={handleCopyCitation}
          className="py-2 px-3 border border-[#171717]/30 bg-[#FAF8F5] hover:bg-[#EAE5D9] transition-colors text-xs font-mono text-[#171717] rounded-xs flex items-center justify-center space-x-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#3E654F]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Citation'}</span>
        </button>
      </div>
    </div>
  );
};
