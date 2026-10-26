import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSimulation } from '../context/SimulationContext';
import { api } from '../services/api';
import { 
  Settings, 
  Sliders, 
  ShieldAlert, 
  Info, 
  RotateCcw, 
  Check,
  Cpu,
  Usb,
  Sun,
  Moon
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, toggleTheme } = useTheme();
  const { hardwareConnectionType, isHardwareConnected, openHardwareModal } = useSimulation();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Reset all simulated test records and batches back to factory initial state?')) {
      await api.resetSimulationData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono transition-colors duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500" />
          <span>Application & Device Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure interface theme preferences, calibration thresholds, and hardware connection.
        </p>
      </div>

      {/* Hardware Connection Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Hardware Driver & Plugin Interface
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            isHardwareConnected 
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
              : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
          }`}>
            {isHardwareConnected ? `Connected (${hardwareConnectionType})` : 'Simulation Active'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <p className="text-[11px] leading-relaxed">
            Ready to attach physical ESP32 with DS18B20 (GPIO 4), Turbidity (GPIO 34), Conductivity (GPIO 35), and LCD (GPIO 21/22).
          </p>
          <button
            onClick={openHardwareModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <Usb className="w-3.5 h-3.5" />
            <span>Manage Hardware Connection</span>
          </button>
        </div>
      </div>

      {/* Application Theme & Measurement Units */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>Application Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Visual Theme</span>
              <button
                onClick={toggleTheme}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {settings.theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                <span>Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </label>
            <select
              value={settings.theme}
              onChange={e => updateSettings({ theme: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
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

      {/* Thresholds Reference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-cyan-500" />
          <span>Classification Threshold Reference</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block font-bold mb-1">
              Turbidity (Optical)
            </strong>
            <p>• Standard Fresh: 1500 – 3000 NTU</p>
            <p>• Water Dilution: &lt; 1400 NTU</p>
            <p>• Curdling/Coagulation: &gt; 3200 NTU</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block font-bold mb-1">
              pH Acidity
            </strong>
            <p>• Nominal Fresh Milk: 6.50 – 6.70 pH</p>
            <p>• Spoiling / Acidic: 6.20 – 6.45 pH</p>
            <p>• Spoiled Souring: &lt; 6.20 pH</p>
            <p>• Alkaline Neutralizer: &gt; 6.90 pH</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <strong className="text-slate-900 dark:text-white block font-bold mb-1">
              Conductivity / TDS
            </strong>
            <p>• Standard Milk Solids: 4.00 – 5.50 mS/cm</p>
            <p>• Water Dilution Flag: &lt; 3.50 mS/cm</p>
            <p>• Salt / Urea Adulterant: &gt; 6.20 mS/cm</p>
          </div>
        </div>
      </div>

      {/* System Information */}
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
            <span className="font-bold text-emerald-600 dark:text-emerald-400">PWA Frontend + Hardware Plugin Manager</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span>Hardware Diagram:</span>
            <span className="text-slate-700 dark:text-slate-300">ESP32 + DS18B20 + Turbidity + Cond + LCD 2004</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Offline Shell Caching:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Enabled (Service Worker)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Mock Data</span>
          </button>

          {resetSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
              <Check className="w-4 h-4" /> Reset Complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
