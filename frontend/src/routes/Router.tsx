import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FileSelectionPage } from '../pages/FileSelectionPage';
import { FinalDocumentationPage } from '../pages/FinalDocumentationPage';
import { ProcessingPage } from '../pages/ProcessingPage';
import { SettingsPage } from '../pages/SettingsPage';
import { HistoryPage } from '../pages/HistoryPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<FileSelectionPage />} />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/documentation" element={<FinalDocumentationPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
