
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LiveAnalysisPage } from './pages/LiveAnalysisPage';
import { TestHistoryPage } from './pages/TestHistoryPage';
import { TestDetailsPage } from './pages/TestDetailsPage';
import { BatchManagementPage } from './pages/BatchManagementPage';
import { DeviceStatusPage } from './pages/DeviceStatusPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="live" element={<LiveAnalysisPage />} />
        <Route path="history" element={<TestHistoryPage />} />
        <Route path="history/:id" element={<TestDetailsPage />} />
        <Route path="batches" element={<BatchManagementPage />} />
        <Route path="device" element={<DeviceStatusPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
