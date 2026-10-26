import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { api } from '../services/api';
import { SimulationControls } from '../components/Live/SimulationControls';
import { AnalysisProgressModal } from '../components/Live/AnalysisProgressModal';
import { QualityCard } from '../components/Quality/QualityCard';
import { SensorGrid } from '../components/Sensors/SensorGrid';
import { SensorLiveChart } from '../components/Sensors/SensorLiveChart';
import { HardwareLCD } from '../components/Sensors/HardwareLCD';
import { Radio, AlertCircle, CheckCircle2, History, Cpu, Usb, Monitor } from 'lucide-react';

export const LiveAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    liveSensors, 
    lcdLines,
    startAnalysisCycle, 
    currentPreset, 
    hardwareConnectionType, 
    isHardwareConnected, 
    openHardwareModal 
  } = useSimulation();

  const [latestAnalysisResult, setLatestAnalysisResult] = useState<any>(null);
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-001');
  const [showLcdMirror, setShowLcdMirror] = useState(true);

  const handleStartAnalysis = () => {
    startAnalysisCycle(async (finalSensors) => {
      try {
        const savedTest = await api.runAnalysis(
          finalSensors, 
          selectedBatchId, 
          `Live verification run with preset ${currentPreset} on ${isHardwareConnected ? hardwareConnectionType : 'Simulator'}.`
        );
        setLatestAnalysisResult(savedTest);
      } catch (err) {
        console.error('Analysis save failed', err);
      }
    });
  };

  return (
    <div className="space-y-6 font-mono transition-colors duration-200">
      {/* Hardware Connection Banner */}
      <div className={`rounded-xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
        isHardwareConnected 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
          : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
      }`}>
        <div className="flex items-start gap-3">
          {isHardwareConnected ? (
            <Usb className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500 animate-pulse" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          )}
          <div>
            <strong className="font-bold uppercase tracking-wider block">
              {isHardwareConnected ? `PHYSICAL HARDWARE LINK: ${hardwareConnectionType}` : 'SIMULATION DRIVER ACTIVE'}
            </strong>
            <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
              {isHardwareConnected 
                ? 'Receiving direct sensor telemetry from ESP32 pins (GPIO 4, 34, 35) and driving LCD output.' 
                : 'Sensor signals (DS18B20 temp, optical turbidity, conductivity, pH, gas array) are synthesized in real time. Plug in ESP32 anytime to switch to live hardware.'}
            </p>
          </div>
        </div>

        <button
          onClick={openHardwareModal}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isHardwareConnected ? 'Hardware Config' : 'Connect Hardware'}</span>
        </button>
      </div>

      {/* Target Node & Batch Selection */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>NODE: ESP32-MG001</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                isHardwareConnected 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {isHardwareConnected ? 'Hardware Online' : 'Simulated Telemetry'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Architecture: DS18B20 (GPIO 4) • Turbidity (GPIO 34) • Conductivity (GPIO 35)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLcdMirror(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showLcdMirror
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{showLcdMirror ? 'Hide LCD Mirror' : 'Show LCD Mirror'}</span>
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Target Batch:</label>
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
      </div>

      {/* Hardware LCD Screen Mirror (Collapsible/Toggleable) */}
      {showLcdMirror && (
        <div className="animate-in fade-in duration-200">
          <HardwareLCD 
            lines={lcdLines} 
            connectionStatus={isHardwareConnected ? `${hardwareConnectionType} Active` : 'ESP32 I2C (Simulated)'} 
          />
        </div>
      )}

      {/* Preset Controls */}
      <SimulationControls onStartAnalysis={handleStartAnalysis} />

      {/* Latest Analysis Result Card */}
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
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Open Detailed Report</span>
            </button>
          </div>

          <QualityCard result={latestAnalysisResult.result} subtitle="Recorded specimen verification result" />
        </div>
      )}

      {/* Live Chart with Turbidity */}
      <SensorLiveChart currentSensors={liveSensors} />

      {/* Live Probe Readings Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Real-Time Probe Readings (Multi-Sensor Telemetry)
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Continuous 1 Hz Acquisition
          </span>
        </div>
        <SensorGrid sensors={liveSensors} />
      </div>

      <AnalysisProgressModal />
    </div>
  );
};
