import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSimulation } from '../../context/SimulationContext';
import { Sun, Moon, Download, Cpu, Usb } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const Header: React.FC = () => {
  const location = useLocation();
  const { settings, toggleTheme } = useTheme();
  const { isHardwareConnected, openHardwareModal } = useSimulation();
  const { isInstallable, installApp } = usePWA();

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return { title: 'Dashboard', sub: 'Multi-Sensor Milk Quality Telemetry Overview' };
    if (p.startsWith('/live')) return { title: 'Live Analysis', sub: 'Real-Time Telemetry & Specimen Verification' };
    if (p.startsWith('/history')) return { title: 'Test History', sub: 'Historical Specimen Verification Records' };
    if (p.startsWith('/batches')) return { title: 'Batch Management', sub: 'Dairy Collection & Farmer Batch Tracking' };
    if (p.startsWith('/device')) return { title: 'Device Status', sub: 'ESP32 Hardware Schematic & Diagnostics' };
    if (p.startsWith('/analytics')) return { title: 'Analytics', sub: 'Aggregated Trends & Spoilage Metrics' };
    if (p.startsWith('/settings')) return { title: 'Settings', sub: 'System Parameters & Display Preferences' };
    return { title: 'MilkGuard', sub: 'Smart Milk Quality Verification' };
  };

  const { title, sub } = getPageTitle();

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 font-mono transition-colors duration-200">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          {sub}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Hardware Connection Action */}
        <button
          onClick={openHardwareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          title="Open Hardware Connection Manager"
        >
          {isHardwareConnected ? (
            <Usb className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="hidden sm:inline">
            {isHardwareConnected ? 'ESP32 Connected' : 'Connect Hardware'}
          </span>
        </button>

        {/* PWA Install Button if available */}
        {isInstallable && (
          <button
            onClick={installApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install PWA</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
