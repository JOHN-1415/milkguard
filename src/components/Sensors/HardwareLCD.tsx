import React, { useState } from 'react';
import { Monitor, Palette } from 'lucide-react';

interface HardwareLCDProps {
  lines?: string[];
  connectionStatus?: string;
}

export const HardwareLCD: React.FC<HardwareLCDProps> = ({ lines = [], connectionStatus = 'ESP32 I2C (0x27)' }) => {
  const [backlight, setBacklight] = useState<'blue' | 'green' | 'amber'>('blue');

  const themes = {
    blue: {
      bg: 'bg-[#002244]',
      text: 'text-[#e0f2fe]',
      border: 'border-[#0369a1]',
      glow: 'shadow-[0_0_20px_rgba(2,132,199,0.35)]',
      textGlow: '0 0 8px rgba(56,189,248,0.8)'
    },
    green: {
      bg: 'bg-[#052e16]',
      text: 'text-[#86efac]',
      border: 'border-[#15803d]',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.35)]',
      textGlow: '0 0 8px rgba(74,222,128,0.8)'
    },
    amber: {
      bg: 'bg-[#451a03]',
      text: 'text-[#fde047]',
      border: 'border-[#b45309]',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      textGlow: '0 0 8px rgba(250,204,21,0.8)'
    }
  }[backlight];

  // Pad or slice to exactly 4 lines of 20 chars
  const formattedLines = [0, 1, 2, 3].map(i => {
    const raw = lines && lines[i] ? lines[i] : '';
    return raw.padEnd(20, ' ').slice(0, 20);
  });

  return (
    <div className="bg-slate-900 dark:bg-slate-950 border border-slate-700/80 rounded-xl p-4 shadow-lg text-slate-100 font-mono">
      {/* Top Bezel / Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200 tracking-wide">PHYSICAL LCD 2004 MIRROR</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            20x4 I2C (0x27)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBacklight(b => b === 'blue' ? 'green' : b === 'green' ? 'amber' : 'blue')}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Toggle LCD Backlight Color"
          >
            <Palette className="w-3 h-3 text-amber-400" />
            <span className="capitalize">{backlight}</span>
          </button>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Retro LCD Screen Bezel */}
      <div className="bg-black/90 p-2 sm:p-3 rounded-lg border-2 border-slate-800 shadow-inner">
        <div
          className={`p-3 sm:p-4 rounded border transition-all duration-300 tracking-widest leading-relaxed select-none ${themes.bg} ${themes.text} ${themes.border} ${themes.glow}`}
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            textShadow: themes.textGlow
          }}
        >
          {formattedLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre text-xs sm:text-sm font-bold tracking-[0.18em] my-0.5 flex justify-between">
              <span>{line}</span>
              <span className="text-[10px] opacity-30 select-none hidden sm:inline">L{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Bus Pinout Annotation */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
        <div>
          <span className="text-slate-400">ESP32 Pinout:</span> SDA: <span className="text-emerald-400 font-semibold">GPIO 21</span> | SCL: <span className="text-emerald-400 font-semibold">GPIO 22</span>
        </div>
        <div className="text-slate-400">
          Hardware Diagram Output Mirror
        </div>
      </div>
    </div>
  );
};
