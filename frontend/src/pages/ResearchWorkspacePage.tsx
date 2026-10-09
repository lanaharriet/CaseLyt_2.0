import React, { useState } from 'react';
import { apiService } from '../services/api';
import type { ResearchAnswer } from '../types';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { MessageSquare, Send } from 'lucide-react';

export const ResearchWorkspacePage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [answerResult, setAnswerResult] = useState<ResearchAnswer | null>(null);

  const sampleQueries = [
    "Was Vikram Malhotra present in India on 15 March 2024?",
    "Who authorized the wire transfer of Rs 3.4 Crores to Alpine Capital Holdings?",
    "What IP address was used to execute transaction TXN-99812?",
    "Did Witness 3 provide a certified passport copy?"
  ];

  const handleQuery = async (qText: string) => {
    if (!qText.trim()) return;
    setIsQuerying(true);
    setQuestion(qText);
    const res = await apiService.queryResearchWorkspace(qText);
    setAnswerResult(res);
    setIsQuerying(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
          <MessageSquare className="w-4 h-4 text-[#6C2029]" />
          <span>LEGAL RESEARCH WORKSPACE • EVIDENCE-BOUND ANALYSIS</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Investigative Evidence Workspace
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Ask complex legal questions. Returns exact Answer, Evidence Passages, Sources, and Verification Status.
        </p>
      </div>

      {/* Query Bar */}
      <div className="legal-card p-4 space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); handleQuery(question); }} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your legal inquiry (e.g. 'Was Vikram Malhotra present in India during the transfer?')..."
            className="flex-1 bg-white border border-[#171717]/20 px-4 py-2.5 text-xs text-[#171717] font-mono placeholder:text-[#171717]/40 focus:outline-none focus:border-[#6C2029] rounded-xs"
          />
          <button
            type="submit"
            disabled={isQuerying}
            className="px-6 py-2.5 bg-[#6C2029] text-[#F4F0E7] text-xs font-medium rounded-xs hover:bg-[#54181F] transition-colors flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isQuerying ? 'Analyzing Corpus...' : 'Run Query'}</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[10px] font-mono text-[#171717]/50 self-center">Sample Queries:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleQuery(sq)}
              className="text-[10px] font-mono bg-[#EAE5D9]/60 hover:bg-[#EAE5D9] text-[#171717] px-2.5 py-1 rounded-xs border border-[#171717]/10 transition-colors"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* Results Display Area */}
      {answerResult && (
        <div className="space-y-4">
          {/* Main Answer Box */}
          <div className="legal-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#171717]/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#AD8748] font-bold">
                  VERIFICATION GATE ANALYSIS
                </span>
                <h3 className="font-serif text-lg font-bold text-[#171717]">
                  Query: "{answerResult.question}"
                </h3>
              </div>
              <VerificationBadge status={answerResult.status} size="lg" />
            </div>

            {/* Answer Text */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/60 font-semibold">
                Synthesized Conclusion
              </label>
              <div className={`p-4 rounded-xs border text-sm leading-relaxed ${
                answerResult.status === 'NOT FOUND'
                  ? 'bg-[#92383B]/10 border-[#92383B]/40 font-mono font-bold text-[#92383B]'
                  : 'bg-white border-[#171717]/20 font-serif font-semibold text-[#171717]'
              }`}>
                {answerResult.answer}
              </div>
            </div>

            {/* Explanation */}
            {answerResult.explanation && (
              <p className="text-xs text-[#171717]/70 font-mono bg-[#FAF8F5] p-2.5 border border-[#171717]/10 rounded-xs">
                ℹ️ {answerResult.explanation}
              </p>
            )}
          </div>

          {/* Evidence & Sources Grid */}
          {answerResult.evidence.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Evidence Passages */}
              <div className="legal-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                  <span className="text-xs font-serif font-bold text-[#171717]">Corpus Evidence Passages</span>
                  <span className="text-[10px] font-mono text-[#3E654F] font-bold">VERIFIED SOURCES</span>
                </div>
                <div className="space-y-2">
                  {answerResult.evidence.map((ev, idx) => (
                    <div key={idx} className="p-3 bg-white border border-[#171717]/15 rounded-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#6C2029]">
                        <span>{ev.source} (Page {ev.page})</span>
                        <span className="text-[#AD8748] font-bold">{ev.paragraph_id}</span>
                      </div>
                      <p className="font-serif text-xs text-[#171717] italic">"{ev.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Gate Checklist */}
              <div className="legal-card p-4 space-y-3">
                <div className="border-b border-[#171717]/15 pb-2">
                  <span className="text-xs font-serif font-bold text-[#171717]">Verification Gate Audit</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { label: 'Stage 1: Source Document Exists?', pass: answerResult.verification.checks.source_exists },
                    { label: 'Stage 2: Passage Text Exists in Corpus?', pass: answerResult.verification.checks.passage_exists },
                    { label: 'Stage 3: Claim Supported by Evidence?', pass: answerResult.verification.checks.claim_supported },
                    { label: 'Stage 4: Contradiction / Conflict Check?', pass: !answerResult.verification.checks.conflict_check },
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-[#171717]/10 rounded-xs">
                      <span>{check.label}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-xs text-[10px] ${
                        check.pass ? 'bg-[#3E654F]/10 text-[#3E654F]' : 'bg-[#92383B]/10 text-[#92383B]'
                      }`}>
                        {check.pass ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
