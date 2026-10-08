import React from 'react';
import { Download, FileText, X } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleExport = (format: 'pdf' | 'docx') => {
    window.open(`/api/reports/export/?format=${format}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#171717]/30 max-w-md w-full rounded-xs shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#171717]/15 pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-[#6C2029]" />
            <h3 className="font-serif text-lg font-bold text-[#171717]">Export Case Dossier Report</h3>
          </div>
          <button onClick={onClose} className="text-[#171717]/50 hover:text-[#171717]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#171717]/80 leading-relaxed">
          Generates a comprehensive evidence dossier including Case Overview, Key Verified Facts, Event Timeline, Contradictions Radar Audit, and Missing Information.
        </p>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleExport('pdf')}
            className="w-full py-2.5 bg-[#6C2029] text-[#F4F0E7] text-xs font-medium rounded-xs hover:bg-[#54181F] transition-colors flex items-center justify-center space-x-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Case Report</span>
          </button>

          <button
            onClick={() => handleExport('docx')}
            className="w-full py-2.5 border border-[#171717]/30 bg-white text-[#171717] text-xs font-medium rounded-xs hover:bg-[#EAE5D9] transition-colors flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4 text-[#AD8748]" />
            <span>Download DOCX (Word Document)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
