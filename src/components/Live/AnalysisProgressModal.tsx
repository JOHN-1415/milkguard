
import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Activity, CheckCircle2, Loader2, Sparkles, Wind, Flame, Gauge } from 'lucide-react';

export const AnalysisProgressModal: React.FC = () => {
  const { isAnalyzing, analysisStep, analysisStatusText, cancelAnalysis } = useSimulation();

  if (!isAnalyzing) return null;

  const steps = [
    { num: 1, label: 'Headspace Purge & Calibration', icon: Wind },
    { num: 2, label: 'Thermal Probe Thermalization', icon: Flame },
    { num: 3, label: 'Multi-Sensor Data Acquisition', icon: Gauge },
    { num: 4, label: 'Biochemical Model Classification', icon: Sparkles }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Analyzing Sample...
              </h3>
              <p className="text-xs text-slate-400">
                MG-001 Hardware Node (Simulated Cycle)
              </p>
            </div>
          </div>

          <button
            onClick={cancelAnalysis}
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold px-2 py-1 rounded bg-slate-800"
          >
            Cancel
          </button>
        </div>

        {/* Current Dynamic Status */}
        <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-emerald-400">
            {analysisStatusText}
          </p>
        </div>

        {/* Steps Visualizer */}
        <div className="space-y-3">
          {steps.map(s => {
            const isDone = analysisStep > s.num;
            const isCurrent = analysisStep === s.num;
            const Icon = s.icon;

            return (
              <div
                key={s.num}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : isDone
                    ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                    : 'bg-transparent border-transparent text-slate-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : isCurrent
                    ? 'bg-emerald-400 text-slate-950 animate-bounce'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                </div>

                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-semibold flex-1">{s.label}</span>

                {isCurrent && (
                  <span className="text-[10px] font-bold text-emerald-400 animate-pulse uppercase">
                    Running...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
          ESP32 ADC Telemetry Protocol • 4.5s Simulated Stabilization Window
        </div>
      </div>
    </div>
  );
};
