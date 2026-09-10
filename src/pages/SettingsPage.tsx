import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  Settings, 
  Sliders, 
  ShieldAlert, 
  Info, 
  RotateCcw, 
  Check 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useTheme();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Reset all simulated test records and batches back to factory initial state?')) {
      await api.resetSimulationData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500" />
          <span>Application & Device Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure interface preferences, calibration limits, and simulation parameters.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>Application Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Visual Theme
            </label>
            <select
              value={settings.theme}
              onChange={e => updateSettings({ theme: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="dark">Dark Mode (Default)</option>
              <option value="light">Light Mode</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Temperature Unit
            </label>
            <select
              value={settings.tempUnit}
              onChange={e => updateSettings({ tempUnit: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Conductivity Unit
            </label>
            <select
              value={settings.condUnit}
              onChange={e => updateSettings({ condUnit: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="mS/cm">mS/cm (MilliSiemens / cm)</option>
              <option value="uS/cm">µS/cm (MicroSiemens / cm)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Node ID
            </label>
            <input
              type="text"
              value={settings.deviceId}
              onChange={e => updateSettings({ deviceId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-cyan-500" />
          <span>Classification Threshold Reference</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block font-bold mb-1">
              pH Acidity Thresholds
            </strong>
            <p>• Nominal Fresh Milk: 6.50 – 6.70 pH</p>
            <p>• Spoiling / Acidic: 6.20 – 6.45 pH</p>
            <p>• Spoiled Souring: &lt; 6.20 pH</p>
            <p>• Alkaline Neutralizer Adulteration: &gt; 6.90 pH</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block font-bold mb-1">
              Conductivity / TDS Thresholds
            </strong>
            <p>• Standard Milk Solids: 4.00 – 5.50 mS/cm</p>
            <p>• Water Dilution Flag: &lt; 3.50 mS/cm</p>
            <p>• Ionic Salt / Urea Adulterant: &gt; 6.20 mS/cm</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400" />
          <span>System & Demonstration Information</span>
        </h3>

        <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span>Application Name:</span>
            <span className="font-bold text-slate-900 dark:text-white">MilkGuard PWA</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span>Architecture Layer:</span>
            <span className="font-bold text-emerald-400">PWA Frontend + Mock API Service</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span>Future Hardware:</span>
            <span className="text-slate-300">ESP32 + Gas Arrays + Node.js REST + MongoDB</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Offline Shell Caching:</span>
            <span className="text-emerald-400 font-bold">Enabled (Service Worker)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Mock Data</span>
          </button>

          {resetSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
              <Check className="w-4 h-4" /> Reset Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
