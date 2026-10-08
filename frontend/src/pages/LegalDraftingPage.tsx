import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { LegalDraftItem } from '../types';
import {
  Edit3, Copy, Check, Download, FileText, Sparkles, AlertTriangle,
  ShieldCheck, ArrowRight, RefreshCw, FileCode, CheckCircle2
} from 'lucide-react';

export const LegalDraftingPage: React.FC = () => {
  const [draftType, setDraftType] = useState<string>('BAIL_APPLICATION');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [draft, setDraft] = useState<LegalDraftItem | null>(null);
  const [editableContent, setEditableContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingWord, setIsDownloadingWord] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const presetTemplates = [
    { id: 'BAIL_APPLICATION', label: 'Bail Application (CrPC 439 / BNSS 483)', query: 'Regular Bail Application under Section 439 CrPC' },
    { id: 'ANTICIPATORY_BAIL', label: 'Anticipatory Bail (CrPC 438 / BNSS 482)', query: 'Anticipatory Bail Application under Section 438 CrPC' },
    { id: 'QUASHING_PETITION', label: 'Quashing Petition (CrPC 482 / BNSS 528)', query: 'Petition for Quashing FIR under Section 482 CrPC' },
    { id: 'SECTION_65B_CERTIFICATE', label: 'Section 65B Electronic Certificate', query: 'Affidavit & Certificate under Section 65B of Indian Evidence Act' },
    { id: 'LEGAL_NOTICE', label: 'Legal Retraction Notice', query: 'Legal Notice demanding retraction of unverified allegations' },
    { id: 'SHOW_CAUSE_REPLY', label: 'Reply to Show Cause Notice', query: 'Reply to Show Cause Notice by Investigating Officer' },
    { id: 'WRITTEN_SUBMISSIONS', label: 'Written Submissions / Synopsis', query: 'Written Submissions on behalf of Accused No. 1' },
    { id: 'AFFIDAVIT', label: 'Affidavit of Verified Facts', query: 'Affidavit of Verified Facts before High Court' },
  ];

  const handleGenerate = async (selectedType: string = draftType, promptText: string = customPrompt, instrText: string = instructions) => {
    try {
      setIsGenerating(true);
      const res = await apiService.generateDraft(selectedType, promptText, instrText);
      setDraft(res);
      setEditableContent(res.content);
    } catch (err) {
      console.error("Draft generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiService.generateDraft('BAIL_APPLICATION').then((res) => {
      if (isMounted) {
        setDraft(res);
        setEditableContent(res.content);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePresetSelect = (preset: { id: string; label: string; query: string }) => {
    setDraftType(preset.id);
    setCustomPrompt(preset.query);
    handleGenerate(preset.id, preset.query, instructions);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    handleGenerate('CUSTOM', customPrompt.trim(), instructions.trim());
  };

  const handleCopyDraft = () => {
    const textToCopy = editableContent || draft?.content;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadWord = async () => {
    if (!draft) return;
    try {
      setIsDownloadingWord(true);
      await apiService.downloadDraftWord(
        draft.title,
        editableContent || draft.content,
        draftType
      );
    } catch (err) {
      console.error("Download Word error:", err);
    } finally {
      setIsDownloadingWord(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!draft) return;
    try {
      setIsDownloadingPdf(true);
      await apiService.downloadDraftPdf(
        draft.title,
        editableContent || draft.content,
        draftType
      );
    } catch (err) {
      console.error("Download PDF error:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Render text with highlighted citation tags and missing variable pills
  const renderFormattedPreview = (content: string) => {
    const paragraphs = content.split('\n');
    return (
      <div className="space-y-1 text-xs leading-relaxed text-[#171717] font-mono select-text">
        {paragraphs.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-3" />;
          }

          // Format Section / Court Headers
          if (
            line.startsWith('IN THE COURT OF') ||
            line.startsWith('IN THE HIGH COURT') ||
            line.startsWith('BEFORE THE')
          ) {
            return (
              <div key={idx} className="font-serif font-bold text-base text-[#6C2029] text-center my-2 tracking-wide uppercase">
                {line}
              </div>
            );
          }

          if (
            line.startsWith('IN THE MATTER OF:') ||
            line.startsWith('VERSUS') ||
            line.startsWith('MOST RESPECTFULLY SHOWETH:') ||
            line.startsWith('PRAYER:') ||
            line.startsWith('VERIFICATION:') ||
            line.startsWith('DEPONENT') ||
            line.startsWith('DATED:')
          ) {
            return (
              <div key={idx} className="font-bold text-[#171717] mt-2 mb-1">
                {line}
              </div>
            );
          }

          // Highlight [INFORMATION NOT FOUND IN CASE FILE] and [DOC_...]
          const parts = line.split(/(\[INFORMATION NOT FOUND IN CASE FILE\]|\[DOC_[A-Za-z0-9_]+\])/g);

          return (
            <div key={idx} className="pl-1 border-l border-transparent hover:border-[#AD8748]/40 hover:bg-[#FAF8F5]/80 transition-colors">
              {parts.map((part, pIdx) => {
                if (part === '[INFORMATION NOT FOUND IN CASE FILE]') {
                  return (
                    <span
                      key={pIdx}
                      className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-xs font-bold text-[10px] bg-[#92383B]/15 text-[#92383B] border border-[#92383B]/30"
                      title="Strictly flagged by CASELYT Verification Gate: absent from uploaded evidence corpus"
                    >
                      ⚠️ [INFORMATION NOT FOUND IN CASE FILE]
                    </span>
                  );
                }
                if (part.startsWith('[DOC_') && part.endsWith(']')) {
                  return (
                    <span
                      key={pIdx}
                      className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-xs font-bold text-[10px] bg-[#2C3E50]/10 text-[#2C3E50] border border-[#2C3E50]/25 font-mono"
                      title="Verified Citation Reference"
                    >
                      📄 {part}
                    </span>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
          <Edit3 className="w-4 h-4 text-[#6C2029]" />
          <span>EVIDENCE-BOUND LEGAL DRAFTING ENGINE</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Automated Legal Drafting Workspace
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Type any custom document or petition name. Every paragraph is generated strictly from verified case facts with authoritative citations. Absent parameters are safely enclosed as <span className="font-mono text-[#92383B] font-bold">[INFORMATION NOT FOUND IN CASE FILE]</span>.
        </p>
      </div>

      {/* Interactive Custom Document Generator Box */}
      <div className="legal-card p-5 bg-[#FAF8F5] border border-[#171717]/15 shadow-xs space-y-4">
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#171717] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#AD8748]" />
                <span>WHAT DOCUMENT DO YOU WANT TO DRAFT?</span>
              </span>
              <span className="text-[10px] text-[#171717]/50 font-normal">
                Type any legal document title, motion, notice, or application
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Application for Anticipatory Bail under Section 438 CrPC / Quashing Petition under Section 482 / Section 65B Certificate..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#171717]/20 rounded-xs text-xs font-mono text-[#171717] focus:outline-none focus:border-[#6C2029] focus:ring-1 focus:ring-[#6C2029] shadow-inner"
              />
              <button
                type="submit"
                disabled={isGenerating || !customPrompt.trim()}
                className="px-5 py-2.5 bg-[#6C2029] text-[#F4F0E7] text-xs font-mono font-bold rounded-xs hover:bg-[#54181F] transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#AD8748]" />
                    <span>Generate Draft</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional specific instructions */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[#171717]/70 flex items-center space-x-1">
              <span>Special Counsel Instructions / Evidentiary Emphasis (Optional):</span>
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Emphasize Swiss Air Flight LX-147 departure alibi, highlight lack of Section 65B statutory certificate for Geneva IP log, and request immediate interim protection..."
              className="w-full px-3 py-1.5 bg-white border border-[#171717]/15 rounded-xs text-xs font-mono text-[#171717] focus:outline-none focus:border-[#6C2029] focus:ring-1 focus:ring-[#6C2029]"
            />
          </div>
        </form>

        {/* Quick-Select Template Chips */}
        <div className="space-y-1.5 pt-2 border-t border-[#171717]/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/60 font-semibold">
            Or Pick from Standard Practice Templates:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetTemplates.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-xs transition-all flex items-center space-x-1.5 ${
                  draftType === preset.id
                    ? 'bg-[#6C2029] text-[#F4F0E7] font-bold shadow-xs border border-[#6C2029]'
                    : 'bg-white border border-[#171717]/15 text-[#171717]/80 hover:border-[#AD8748] hover:bg-[#EAE5D9]/40'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Draft Container */}
      {draft && (
        <div className="space-y-3">
          {/* Action & Stats Control Bar */}
          <div className="legal-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#EAE5D9]/40 border-l-4 border-l-[#AD8748]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-[#6C2029] text-[#F4F0E7] text-[9px] font-mono font-bold rounded-xs">
                  {draft.draft_type || 'LEGAL DRAFT'}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#171717]">{draft.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#171717]/75">
                <span className="inline-flex items-center gap-1 text-[#3E654F] font-bold bg-[#3E654F]/10 px-2 py-0.5 rounded-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  {draft.verified_facts_count} Verified Facts Injected
                </span>
                <span className="inline-flex items-center gap-1 text-[#92383B] font-bold bg-[#92383B]/10 px-2 py-0.5 rounded-xs">
                  <AlertTriangle className="w-3 h-3" />
                  {draft.missing_variables_count} Missing Placeholders Protected
                </span>
                <span className="inline-flex items-center gap-1 text-[#AD8748] font-bold bg-[#AD8748]/10 px-2 py-0.5 rounded-xs">
                  <ShieldCheck className="w-3 h-3" />
                  100% Evidence Bound
                </span>
              </div>
            </div>

            {/* Export & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-2 bg-white border border-[#171717]/20 text-[#171717] text-xs font-mono rounded-xs hover:bg-[#FAF8F5] transition-colors flex items-center space-x-1.5"
                title="Toggle Edit Mode"
              >
                <FileCode className="w-3.5 h-3.5 text-[#6C2029]" />
                <span>{isEditing ? 'Formatted View' : 'Edit Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyDraft}
                className="px-3 py-2 bg-white border border-[#171717]/20 text-[#171717] text-xs font-mono rounded-xs hover:bg-[#FAF8F5] transition-colors flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3E654F]" /> : <Copy className="w-3.5 h-3.5 text-[#171717]/70" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                disabled={isDownloadingWord}
                onClick={handleDownloadWord}
                className="px-3.5 py-2 bg-[#2C3E50] text-white text-xs font-mono font-bold rounded-xs hover:bg-[#1A252F] transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                title="Download formatted Microsoft Word .docx dossier"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingWord ? 'Exporting Word...' : 'Download Word (.docx)'}</span>
              </button>

              <button
                type="button"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                className="px-3.5 py-2 bg-[#6C2029] text-[#F4F0E7] text-xs font-mono font-bold rounded-xs hover:bg-[#54181F] transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                title="Download formal judicial PDF dossier"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isDownloadingPdf ? 'Exporting PDF...' : 'Download PDF (.pdf)'}</span>
              </button>
            </div>
          </div>

          {/* Draft Preview / Editor Box */}
          <div className="legal-card p-6 bg-white border-2 border-[#171717]/20 shadow-inner max-h-[650px] overflow-y-auto">
            {isEditing ? (
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                rows={25}
                className="w-full h-full min-h-[500px] p-3 font-mono text-xs leading-relaxed text-[#171717] bg-[#FAF8F5] border border-[#171717]/15 rounded-xs focus:outline-none focus:border-[#6C2029]"
              />
            ) : (
              renderFormattedPreview(editableContent || draft.content)
            )}
          </div>
        </div>
      )}
    </div>
  );
};
