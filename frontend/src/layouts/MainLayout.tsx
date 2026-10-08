import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { ReportExportModal } from '../components/common/ReportExportModal';

export const MainLayout: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleGlobalSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F0E7] text-[#171717] flex flex-col font-sans">
      <Header
        onSearch={handleGlobalSearch}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
