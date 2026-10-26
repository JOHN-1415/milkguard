import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useSimulation } from '../../context/SimulationContext';
import { Wifi, WifiOff, Cpu, Usb } from 'lucide-react';

export const NetworkStatusBar: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const { hardwareConnectionType, isHardwareConnected, openHardwareModal } = useSimulation();

  return (
    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono py-1 px-4 text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Hardware Mode Indicator Badge */}
        <button
          onClick={openHardwareModal}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer border text-xs font-semibold transition-all ${
            isHardwareConnected
              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40'
              : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40'
          }`}
          title="Click to switch between Simulation, USB Serial, and Wi-Fi Direct"
        >
          {isHardwareConnected ? (
            <Usb className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          ) : (
            <Cpu className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
          )}
          <span>{isHardwareConnected ? `ESP32 (${hardwareConnectionType})` : 'SIMULATION MODE'}</span>
          <span className="opacity-75 hidden sm:inline">
            {isHardwareConnected ? '– Live Hardware Telemetry' : '– Click to connect ESP32'}
          </span>
        </button>

        {/* Device target */}
        <div className="hidden md:flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <span>Target Architecture:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">ESP32 + DS18B20 + Turbidity + Cond + LCD</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Online / Offline Status */}
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online (PWA Ready)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Offline Mode (Cached Service Worker)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
