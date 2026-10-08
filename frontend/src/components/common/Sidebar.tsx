import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FolderOpen, ShieldCheck, Clock, AlertTriangle, HelpCircle,
  Network, Search, MessageSquare, Edit3, Cpu
} from 'lucide-react';

interface SidebarProps {
  unresolvedConflictsCount?: number;
  missingItemsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  unresolvedConflictsCount = 2,
  missingItemsCount = 2
}) => {
  const navItems = [
    { path: '/review', label: 'Case Review', icon: ShieldCheck },
    { path: '/documents', label: 'Document Library', icon: FolderOpen },
    { path: '/timeline', label: 'Chronological Timeline', icon: Clock },
    {
      path: '/contradictions',
      label: 'Contradiction Radar',
      icon: AlertTriangle,
      badge: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : undefined,
      badgeColor: 'bg-[#92383B] text-white'
    },
    {
      path: '/missing',
      label: 'Missing Information',
      icon: HelpCircle,
      badge: missingItemsCount > 0 ? missingItemsCount : undefined,
      badgeColor: 'bg-[#A16D2B] text-white'
    },
    { path: '/graph', label: 'Evidence Graph', icon: Network },
    { path: '/search', label: 'Evidence Search', icon: Search },
    { path: '/research', label: 'Research Workspace', icon: MessageSquare },
    { path: '/drafting', label: 'Legal Drafting', icon: Edit3 },
    { path: '/agent-activity', label: 'Agent Activity Panel', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-[#FAF8F5] border-r border-[#171717]/15 min-h-[calc(100vh-57px)] flex flex-col justify-between p-3 select-none">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#171717]/40 font-semibold mb-2">
            Investigative Modules
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs rounded-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#6C2029] text-[#F4F0E7] font-semibold'
                      : 'text-[#171717]/80 hover:bg-[#EAE5D9]/70 hover:text-[#171717]'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Verification Rules Info Box */}
        <div className="mx-1 p-3 bg-[#EAE5D9]/50 border border-[#171717]/15 rounded-xs text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-[#6C2029] font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Verification Engine</span>
          </div>
          <p className="text-[11px] text-[#171717]/70 leading-relaxed font-sans">
            Every conclusion must map directly to source passages. Unsubstantiated claims output:
            <span className="block font-mono text-[10px] font-bold text-[#92383B] mt-1 bg-white/50 p-1 border border-[#92383B]/20">
              "NOT FOUND IN PROVIDED DOCUMENTS"
            </span>
          </p>
        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-3 border-t border-[#171717]/15 bg-[#F4F0E7]/60 text-xs">
        <div className="font-semibold text-[#171717]">Adv. Vikramaditya Sharma</div>
        <div className="text-[10px] text-[#AD8748] font-mono font-medium">Senior Bar / Evidence Architect</div>
        <div className="text-[9px] text-[#171717]/50 font-mono mt-0.5">High Court of Delhi • EIB-2026</div>
      </div>
    </aside>
  );
};
