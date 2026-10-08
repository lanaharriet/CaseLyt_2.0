import React, { useState } from 'react';
import { Search, Download, Database, Layers } from 'lucide-react';
import { apiService } from '../../services/api';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenReportModal: () => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenReportModal, onRefreshData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSeedClick = async () => {
    try {
      setIsSeeding(true);
      await apiService.seedData();
      if (onRefreshData) onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="bg-[#FAF8F5] border-b border-[#171717]/15 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-[#6C2029] text-[#F4F0E7] flex items-center justify-center font-serif font-bold text-xl rounded-xs shadow-xs">
            C
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#171717] leading-none">
              CASELYT
            </h1>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#AD8748] font-semibold mt-0.5">
              Evidence Before Conclusions.
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-[#171717]/15 hidden md:block" />

        {/* Case Badge */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#EAE5D9]/60 px-3 py-1 rounded-xs border border-[#171717]/10 text-xs">
          <Layers className="w-3.5 h-3.5 text-[#6C2029]" />
          <span className="font-medium text-[#171717]">State vs. Vikram Malhotra & Ors.</span>
          <span className="font-mono text-[10px] bg-[#6C2029]/10 text-[#6C2029] px-1.5 py-0.5 rounded-xs font-semibold">
            FIR 204/2024
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search corpus (BM25 + Dense Embeddings)..."
            className="w-full bg-[#F4F0E7] border border-[#171717]/20 pl-9 pr-4 py-1.5 text-xs text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:border-[#6C2029] font-mono transition-colors"
          />
        </div>
      </form>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleSeedClick}
          disabled={isSeeding}
          title="Re-seed demo case file"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs border border-[#AD8748] text-[#AD8748] hover:bg-[#AD8748]/10 font-mono transition-colors"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSeeding ? 'Seeding...' : 'Reset Demo Case'}</span>
        </button>

        <button
          onClick={onOpenReportModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs bg-[#6C2029] text-[#F4F0E7] hover:bg-[#54181F] transition-colors font-medium rounded-xs shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Dossier (PDF/DOCX)</span>
        </button>
      </div>
    </header>
  );
};
