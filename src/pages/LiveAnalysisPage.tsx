import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { api } from '../services/api';
import { SimulationControls } from '../components/Live/SimulationControls';
import { AnalysisProgressModal } from '../components/Live/AnalysisProgressModal';
import { QualityCard } from '../components/Quality/QualityCard';
import { SensorGrid } from '../components/Sensors/SensorGrid';
import { SensorLiveChart } from '../components/Sensors/SensorLiveChart';
import { Radio, AlertCircle, CheckCircle2, History } from 'lucide-react';

export const LiveAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { liveSensors, startAnalysisCycle, currentPreset } = useSimulation();
  const [latestAnalysisResult, setLatestAnalysisResult] = useState<any>(null);
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-001');

  const handleStartAnalysis = () => {
    startAnalysisCycle(async (finalSensors) => {
      try {
        const savedTest = await api.runAnalysis(
          finalSensors, 
          selectedBatchId, 
          `Live verification run with preset ${currentPreset}.`
        );
        setLatestAnalysisResult(savedTest);
      } catch (err) {
        console.error('Analysis save failed', err);
      }
    });
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong className="font-bold uppercase tracking-wider block">
            Simulation Mode – Hardware sensor not connected
          </strong>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-300/80">
            Electro-chemical sensor signals (MQ-3, MQ-135, MQ-137, pH electrode, TDS conductivity) are synthesized 
            in real time. The classification model uses these values to demonstrate real-time quality verification.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>DEVICE MG-001</span>
              <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                Connected / Simulated
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Protocol: Wi-Fi REST Telemetry • 1000ms Polling Rate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Assigned Batch:</label>
          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="BATCH-001">BATCH-001 (Green Valley Dairy)</option>
            <option value="BATCH-002">BATCH-002 (Sunrise Cooperative)</option>
            <option value="BATCH-003">BATCH-003 (Highland Farm)</option>
            <option value="BATCH-004">BATCH-004 (Riverdale Organic)</option>
          </select>
        </div>
      </div>

      <SimulationControls onStartAnalysis={handleStartAnalysis} />

      {latestAnalysisResult && (
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm uppercase">
                Analysis Completed • Test ID: {latestAnalysisResult.testId}
              </span>
            </div>

            <button
              onClick={() => navigate(`/history/${latestAnalysisResult.testId}`)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Open Detailed Report</span>
            </button>
          </div>

          <QualityCard result={latestAnalysisResult.result} subtitle="Recorded specimen verification result" />
        </div>
      )}

      <SensorLiveChart currentSensors={liveSensors} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Real-Time Probe Readings
          </h3>
          <span className="text-[11px] text-slate-400">
            Auto-stabilizing toward preset target
          </span>
        </div>
        <SensorGrid sensors={liveSensors} />
      </div>

      <AnalysisProgressModal />
    </div>
  );
};
