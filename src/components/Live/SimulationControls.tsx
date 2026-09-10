import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { INITIAL_PRESETS } from '../../data/initialMockData';
import type { PresetType } from '../../types';
import { Play, Pause, RefreshCw, FlaskConical, AlertCircle } from 'lucide-react';

interface SimulationControlsProps {
  onStartAnalysis: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ onStartAnalysis }) => {
  const { 
    currentPreset, 
    setPreset, 
    isStreaming, 
    toggleStreaming, 
    isAnalyzing 
  } = useSimulation();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase">
              Specimen Preset Simulation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a simulated milk condition to feed virtual sensor readings to the analysis engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
              isStreaming
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {INITIAL_PRESETS.map(preset => {
          const isSelected = currentPreset === preset.id;
          let badgeColor = 'text-emerald-400 bg-emerald-500/10';

          if (preset.id === 'SPOILING_MILK') {
            badgeColor = 'text-amber-400 bg-amber-500/10';
          } else if (preset.id === 'SPOILED_MILK') {
            badgeColor = 'text-rose-400 bg-rose-500/10';
          } else if (preset.id === 'ADULTERATED_MILK') {
            badgeColor = 'text-cyan-400 bg-cyan-500/10';
          }

          return (
            <button
              key={preset.id}
              onClick={() => setPreset(preset.id as PresetType)}
              disabled={isAnalyzing}
              className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20 ring-1 ring-emerald-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
              } ${isAnalyzing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Target Score: ~{preset.expectedScore}%</span>
                <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${badgeColor}`}>
                  {preset.targetSpoilage}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Clicking start will run an animated multi-sensor acquisition cycle and save to history.</span>
        </div>

        <button
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white transition-all shadow-md ${
            isAnalyzing
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 active:scale-98'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Sample...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>[ START ANALYSIS ]</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
