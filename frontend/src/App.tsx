import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { CaseReviewPage } from './pages/CaseReviewPage';
import { DocumentLibraryPage } from './pages/DocumentLibraryPage';
import { TimelinePage } from './pages/TimelinePage';
import { ContradictionRadarPage } from './pages/ContradictionRadarPage';
import { MissingInfoPage } from './pages/MissingInfoPage';
import { EvidenceGraphPage } from './pages/EvidenceGraphPage';
import { EvidenceSearchPage } from './pages/EvidenceSearchPage';
import { ResearchWorkspacePage } from './pages/ResearchWorkspacePage';
import { LegalDraftingPage } from './pages/LegalDraftingPage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/review" replace />} />
          <Route path="review" element={<CaseReviewPage />} />
          <Route path="documents" element={<DocumentLibraryPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="contradictions" element={<ContradictionRadarPage />} />
          <Route path="missing" element={<MissingInfoPage />} />
          <Route path="graph" element={<EvidenceGraphPage />} />
          <Route path="search" element={<EvidenceSearchPage />} />
          <Route path="research" element={<ResearchWorkspacePage />} />
          <Route path="drafting" element={<LegalDraftingPage />} />
          <Route path="agent-activity" element={<AgentActivityPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
