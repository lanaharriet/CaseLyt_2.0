import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { DocumentItem } from '../types';
import { Upload, FileText, RefreshCw, Trash2, Eye, CheckCircle, AlertCircle, PlusCircle, X } from 'lucide-react';

export const DocumentLibraryPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [caseFormData, setCaseFormData] = useState({
    title: '',
    case_number: '',
    jurisdiction: 'High Court of Delhi / Special CBI Court',
    description: ''
  });

  const fetchDocs = async () => {
    const docs = await apiService.getDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    let isMounted = true;
    apiService.getDocuments().then((docs) => {
      if (isMounted) {
        setDocuments(docs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setIsUploading(true);
      await apiService.uploadDocument(file);
      await fetchDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseFormData.title.trim() || !caseFormData.case_number.trim()) return;
    try {
      setIsCreatingCase(true);
      await apiService.createCase(caseFormData);
      setIsCaseModalOpen(false);
      setCaseFormData({
        title: '',
        case_number: '',
        jurisdiction: 'High Court of Delhi / Special CBI Court',
        description: ''
      });
      await fetchDocs();
      window.location.reload();
    } catch (err) {
      console.error("Error creating case", err);
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleReprocess = async (id: string) => {
    await apiService.reprocessDocument(id);
    fetchDocs();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this document from the evidence corpus?")) {
      await apiService.deleteDocument(id);
      fetchDocs();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Upload / Case Creation */}
      <div className="legal-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#6C2029]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#171717]">Document Library & OCR Ingestion</h2>
          <p className="text-xs text-[#171717]/70 mt-0.5">
            Supported Formats: PDF, DOCX, TXT. Automatic PyMuPDF extraction, citation indexing, and timeline entity mapping.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 border border-[#AD8748] text-[#AD8748] hover:bg-[#AD8748]/10 text-xs font-semibold rounded-xs transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case File</span>
          </button>

          <label className="flex items-center space-x-2 px-4 py-2 bg-[#6C2029] text-[#F4F0E7] text-xs font-semibold rounded-xs cursor-pointer hover:bg-[#54181F] transition-colors shadow-xs">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Ingesting File...' : 'Upload Document'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Case Creation Modal */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF8F5] border border-[#171717]/20 rounded-xs max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#171717]/15 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#171717]">Create New Legal Case File</h3>
              <button onClick={() => setIsCaseModalOpen(false)} className="text-[#171717]/60 hover:text-[#6C2029]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono font-semibold text-[#171717] mb-1">
                  Case Title / Caption *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State of Maharashtra vs. Arvind Swamy & Ors."
                  value={caseFormData.title}
                  onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                  className="w-full bg-white border border-[#171717]/20 px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#6C2029]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#171717] mb-1">
                    FIR / Case Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FIR No. 892/2026"
                    value={caseFormData.case_number}
                    onChange={(e) => setCaseFormData({ ...caseFormData, case_number: e.target.value })}
                    className="w-full bg-white border border-[#171717]/20 px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#6C2029]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#171717] mb-1">
                    Jurisdiction Court
                  </label>
                  <input
                    type="text"
                    value={caseFormData.jurisdiction}
                    onChange={(e) => setCaseFormData({ ...caseFormData, jurisdiction: e.target.value })}
                    className="w-full bg-white border border-[#171717]/20 px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#6C2029]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#171717] mb-1">
                  Case Brief / Background
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of dispute, parties, and allegations..."
                  value={caseFormData.description}
                  onChange={(e) => setCaseFormData({ ...caseFormData, description: e.target.value })}
                  className="w-full bg-white border border-[#171717]/20 px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#6C2029]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#171717]/10">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 border border-[#171717]/20 text-xs text-[#171717] hover:bg-[#EAE5D9]/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCase}
                  className="px-5 py-2 bg-[#6C2029] text-[#F4F0E7] text-xs font-semibold hover:bg-[#54181F]"
                >
                  {isCreatingCase ? 'Creating Case...' : 'Create Case File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Library Table */}
      <div className="legal-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EAE5D9]/60 border-b border-[#171717]/15 text-[10px] font-mono uppercase tracking-wider text-[#171717]/70">
              <th className="p-3">Document</th>
              <th className="p-3">Type</th>
              <th className="p-3">Pages</th>
              <th className="p-3">Evidence</th>
              <th className="p-3">Conflicts</th>
              <th className="p-3">Status</th>
              <th className="p-3">Added</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171717]/10 text-xs">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="p-3 font-medium text-[#171717]">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-[#6C2029] shrink-0" />
                    <span className="font-serif font-bold text-sm">{doc.filename}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-[11px]">{doc.doc_type}</td>
                <td className="p-3 font-mono text-[11px]">{doc.page_count} Pages</td>
                <td className="p-3 font-mono text-[11px] text-[#3E654F] font-bold">
                  {doc.evidence_count} Items
                </td>
                <td className="p-3 font-mono text-[11px] text-[#92383B] font-bold">
                  {doc.conflicts_count} Conflicts
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-xs font-bold ${
                    doc.status === 'INDEXED' ? 'bg-[#3E654F]/10 text-[#3E654F]' : 'bg-[#A16D2B]/10 text-[#A16D2B]'
                  }`}>
                    {doc.status === 'INDEXED' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {doc.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-[10px] text-[#171717]/60">
                  {doc.uploaded_at_formatted || '2026-10-08'}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1.5 text-[#171717]/70 hover:text-[#6C2029] hover:bg-[#EAE5D9]/50 rounded-xs"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReprocess(doc.id)}
                      className="p-1.5 text-[#171717]/70 hover:text-[#AD8748] hover:bg-[#EAE5D9]/50 rounded-xs"
                      title="Reprocess Document"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-[#171717]/70 hover:text-[#92383B] hover:bg-[#EAE5D9]/50 rounded-xs"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <div className="legal-card p-4 bg-[#FAF8F5] text-xs font-mono">
          <strong className="text-[#6C2029]">Selected Document:</strong> {selectedDoc.filename} ({selectedDoc.page_count} Pages)
        </div>
      )}
    </div>
  );
};
