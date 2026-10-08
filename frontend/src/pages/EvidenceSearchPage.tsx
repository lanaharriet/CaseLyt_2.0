import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Search } from 'lucide-react';
import { VerificationBadge } from '../components/common/VerificationBadge';

export const EvidenceSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    const res = await apiService.searchEvidence(query.trim());
    setResults(res.results || []);
    setIsSearching(false);
  };

  return (
    <div className="space-y-4">
      <div className="legal-card p-5 border-l-4 border-l-[#6C2029]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#AD8748] font-bold">
          <Search className="w-4 h-4 text-[#6C2029]" />
          <span>HYBRID RETRIEVAL SEARCH ENGINE</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#171717] mt-1">
          Corpus Global Search (BM25 + Dense Embeddings + Reranker)
        </h2>
        <p className="text-xs text-[#171717]/70 mt-0.5">
          Queries all Documents, Evidence Records, Timeline Events, and Claims with exact match scores.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Flight LX-147 Zurich alibi, ICICI wire transfer Rs 3.4 Crores, IP address Geneva..."
          className="flex-1 bg-white border border-[#171717]/20 px-4 py-2.5 text-xs text-[#171717] font-mono placeholder:text-[#171717]/40 focus:outline-none focus:border-[#6C2029]"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-2.5 bg-[#6C2029] text-[#F4F0E7] text-xs font-medium rounded-xs hover:bg-[#54181F] transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search Evidence'}
        </button>
      </form>

      {/* Results */}
      <div className="space-y-3">
        {results.map((res, idx) => (
          <div key={idx} className="legal-card p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-bold text-[#6C2029]">{res.type}</span>
                <span>•</span>
                <span className="text-[#171717]">{res.source}</span>
                <span>•</span>
                <span>Page {res.page}</span>
                <span>•</span>
                <span className="text-[#AD8748] font-bold">{res.paragraph_id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono bg-[#171717]/10 text-[#171717] px-2 py-0.5 rounded-xs font-bold">
                  Match Score: {res.match_score}
                </span>
                <VerificationBadge status={res.verification_status || 'VERIFIED'} size="sm" />
              </div>
            </div>

            <p className="font-serif text-sm text-[#171717] font-semibold leading-relaxed">
              "{res.evidence}"
            </p>
          </div>
        ))}

        {results.length === 0 && query && !isSearching && (
          <div className="legal-card p-8 text-center text-[#171717]/60">
            <p className="font-mono text-sm font-bold text-[#92383B]">NOT FOUND IN PROVIDED DOCUMENTS</p>
            <p className="text-xs mt-1">No matching evidence found in uploaded case files for query "{query}".</p>
          </div>
        )}
      </div>
    </div>
  );
};
