
import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Wifi, WifiOff, Cpu } from 'lucide-react';

export const NetworkStatusBar: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-[11px] font-mono py-1 px-4 text-slate-400 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        {/* Hardware Mode Indicator */}
        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
          <Cpu className="w-3 h-3 animate-pulse" />
          <span className="font-semibold">SIMULATION MODE</span>
          <span className="text-amber-300/70 hidden sm:inline">– Hardware sensor not connected</span>
        </div>

        {/* Device indicator */}
        <div className="hidden md:flex items-center gap-1 text-slate-300">
          <span>Target Node:</span>
          <span className="font-bold text-emerald-400">MG-001 (ESP32 Sim)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Online / Offline status */}
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Online
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Offline (Cached Shell)
              </span>
            </>
          )}
        </div>

        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-400 hidden sm:inline">v0.1.0-alpha</span>
      </div>
    </div>
  );
};
