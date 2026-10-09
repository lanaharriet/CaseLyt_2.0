import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Database, Layers, ChevronDown, Check, Menu, X, LogOut, LogIn } from 'lucide-react';
import { apiService } from '../../services/api';
import type { UserItem } from '../../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenReportModal: () => void;
  onRefreshData?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onOpenReportModal,
  onRefreshData,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeCase, setActiveCase] = useState<{ id?: string; title?: string; case_number?: string } | null>(null);
  const [allCases, setAllCases] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadCaseData = async () => {
    const cases = await apiService.getCases();
    setAllCases(cases);
    const curr = await apiService.getCase();
    if (curr) setActiveCase(curr);
  };

  useEffect(() => {
    loadCaseData();
    const user = apiService.getAuthUser();
    setCurrentUser(user);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCase = (caseObj: any) => {
    apiService.setActiveCaseId(caseObj.id);
    setActiveCase(caseObj);
    setIsDropdownOpen(false);
    if (onRefreshData) onRefreshData();
    window.location.reload();
  };

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
      await loadCaseData();
      if (onRefreshData) onRefreshData();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = async () => {
    await apiService.logout();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-[#FAF8F5] border-b border-[#171717]/15 sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
      {/* Left: Mobile Toggle + Brand & Tagline */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Hamburger Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-md hover:bg-[#EAE5D9] text-[#171717] focus:outline-none transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#6C2029] text-[#F4F0E7] flex items-center justify-center font-serif font-bold text-lg sm:text-xl rounded-xs shadow-xs shrink-0">
            C
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#171717] leading-none">
              CASELYT
            </h1>
            <p className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-[#AD8748] font-semibold mt-0.5 hidden xs:block">
              Evidence Before Conclusions.
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-[#171717]/15 hidden md:block" />

        {/* Case Badge & Dropdown Selector */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-[#EAE5D9]/70 hover:bg-[#EAE5D9] px-2.5 py-1.5 rounded-xs border border-[#171717]/15 text-xs transition-colors cursor-pointer"
            title="Click to switch active case file"
          >
            <Layers className="w-3.5 h-3.5 text-[#6C2029]" />
            <span className="font-medium text-[#171717] max-w-[150px] lg:max-w-[200px] truncate">
              {activeCase?.title ? activeCase.title.split('(')[0].trim() : 'State vs. Vikram Malhotra & Ors.'}
            </span>
            <span className="font-mono text-[10px] bg-[#6C2029]/10 text-[#6C2029] px-1.5 py-0.5 rounded-xs font-semibold hidden xl:inline">
              {activeCase?.case_number || 'FIR 204/2024'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#171717]/60" />
          </button>

          {/* All Cases Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 bg-[#FAF8F5] border border-[#171717]/20 rounded-xs shadow-xl z-50 py-2">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#171717]/50 font-bold border-b border-[#171717]/10 mb-1">
                Active Case Files ({allCases.length})
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-[#171717]/5">
                {allCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    className={`px-3 py-2 text-xs flex items-center justify-between hover:bg-[#EAE5D9]/80 cursor-pointer transition-colors ${
                      activeCase?.id === c.id ? 'bg-[#EAE5D9] font-bold' : ''
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-[#171717] truncate">{c.title}</div>
                      <div className="text-[10px] font-mono text-[#6C2029]">{c.case_number}</div>
                    </div>
                    {activeCase?.id === c.id && (
                      <Check className="w-4 h-4 text-[#3E654F] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search corpus (BM25 + Dense Embeddings)..."
            className="w-full bg-[#F4F0E7] border border-[#171717]/20 pl-9 pr-4 py-1.5 text-xs text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:border-[#6C2029] font-mono transition-colors rounded-xs"
          />
        </div>
      </form>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={handleSeedClick}
          disabled={isSeeding}
          title="Re-seed demo case file"
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs border border-[#AD8748] text-[#AD8748] hover:bg-[#AD8748]/10 font-mono transition-colors rounded-xs"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSeeding ? 'Seeding...' : 'Reset Demo'}</span>
        </button>

        <button
          onClick={onOpenReportModal}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs bg-[#6C2029] text-[#F4F0E7] hover:bg-[#54181F] transition-colors font-medium rounded-xs shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Dossier</span>
          <span className="sm:hidden">Export</span>
        </button>

        {/* User Profile / Auth Control */}
        <div className="relative" ref={userMenuRef}>
          {currentUser ? (
            <div>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 bg-[#EAE5D9]/80 hover:bg-[#EAE5D9] p-1 sm:px-2.5 sm:py-1 rounded-md border border-[#171717]/15 transition-colors cursor-pointer"
                title="Counsel Profile"
              >
                <div className="w-6 h-6 rounded-full bg-[#6C2029] text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-[#171717] leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] font-mono text-[#AD8748] leading-tight">
                    Counsel
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-[#171717]/60 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-[#FAF8F5] border border-[#171717]/20 rounded-xs shadow-xl z-50 py-2">
                  <div className="px-3 py-2 border-b border-[#171717]/10">
                    <p className="text-xs font-bold text-[#171717]">{currentUser.name}</p>
                    <p className="text-[10px] font-mono text-[#AD8748] font-medium">{currentUser.role}</p>
                    {currentUser.organization && (
                      <p className="text-[9px] text-[#171717]/60 font-mono mt-0.5">{currentUser.organization}</p>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out & Lock Vault</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white hover:bg-stone-50 text-[#6C2029] font-medium border border-[#6C2029]/40 rounded-xs transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
