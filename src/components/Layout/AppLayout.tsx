import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { NetworkStatusBar } from './NetworkStatusBar';
import { HardwarePluginModal } from '../Hardware/HardwarePluginModal';
import { useSimulation } from '../../context/SimulationContext';

export const AppLayout: React.FC = () => {
  const { isHardwareModalOpen, closeHardwareModal } = useSimulation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top network and simulation status bar */}
      <NetworkStatusBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-6">
          <Header />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Hardware Plugin Connection Manager Modal */}
      <HardwarePluginModal isOpen={isHardwareModalOpen} onClose={closeHardwareModal} />
    </div>
  );
};
