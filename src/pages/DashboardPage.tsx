import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { TestReading, AnalyticsSummary } from '../types';
import { QualityCard } from '../components/Quality/QualityCard';
import { SensorGrid } from '../components/Sensors/SensorGrid';
import { HardwareLCD } from '../components/Sensors/HardwareLCD';
import { TestTable } from '../components/Tests/TestTable';
import { LoadingState } from '../components/Common/LoadingState';
import { MetricCard } from '../components/Common/MetricCard';
import { useSimulation } from '../context/SimulationContext';
import { 
  Play, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Radio, 
  ShieldAlert,
  Cpu,
  Usb
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [latestTest, setLatestTest] = useState<TestReading | null>(null);
  const [recentTests, setRecentTests] = useState<TestReading[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const { liveSensors, lcdLines, hardwareConnectionType, isHardwareConnected, openHardwareModal } = useSimulation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [latest, history, summary] = await Promise.all([
        api.getLatestReading(),
        api.getTestHistory({ sortBy: 'newest' }),
        api.getAnalytics()
      ]);
      setLatestTest(latest);
      setRecentTests(history.slice(0, 5));
      setAnalytics(summary);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !latestTest) {
    return <LoadingState message="Connecting to MilkGuard hardware telemetry node..." />;
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Hero Banner with Adaptive Light/Dark Theme */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-white shadow-md relative overflow-hidden transition-colors duration-200">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                System Online
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider">
                Architecture: ESP32 + LCD
              </span>
              <button
                onClick={openHardwareModal}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                  isHardwareConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                {isHardwareConnected ? <Usb className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                <span>{isHardwareConnected ? `Connected (${hardwareConnectionType})` : 'Simulation Driver'}</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MilkGuard Telemetry & Quality Engine
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Multi-sensor verification node for raw milk grading, spoilage detection, and adulteration screening. Built for ESP32 with DS18B20, optical Turbidity, and Conductivity probes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={openHardwareModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>Connect ESP32</span>
            </button>

            <Link
              to="/live"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Analysis</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            title="Total Samples"
            value={analytics.totalTests}
            subtext="Lifetime verified"
            icon={Layers}
            accentColor="slate"
          />
          <MetricCard
            title="Good / Pass"
            value={analytics.goodSamples}
            subtext={`${analytics.passRate}% acceptance rate`}
            icon={CheckCircle2}
            accentColor="emerald"
            badge="Standard Grade"
          />
          <MetricCard
            title="Spoiling / Spoiled"
            value={analytics.spoilingSamples + analytics.spoiledSamples}
            subtext={`${analytics.spoiledSamples} spoiled samples`}
            icon={AlertTriangle}
            accentColor="amber"
          />
          <MetricCard
            title="Adulterated"
            value={analytics.adulteratedSamples}
            subtext="Non-nominal turbidity/EC"
            icon={ShieldAlert}
            accentColor="rose"
            badge={analytics.adulteratedSamples > 0 ? 'Action Required' : 'Nominal'}
          />
        </div>
      )}

      {/* Quality Decision & Hardware LCD Mirror Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Latest Specimen Classification (Test: {latestTest.testId})
            </h3>
            <span className="text-[11px] text-slate-400">
              Batch: {latestTest.batchId}
            </span>
          </div>
          <QualityCard result={latestTest.result} subtitle={`Sample verified at ${latestTest.timestamp}`} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Physical Hardware LCD Screen (Architecture Output)
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Synchronized
            </span>
          </div>
          <HardwareLCD lines={lcdLines} connectionStatus={isHardwareConnected ? `${hardwareConnectionType} Link` : 'ESP32 I2C (Sim)'} />
        </div>
      </div>

      {/* Live Sensors Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Physical Sensor Readings (Telemetry Stream)
          </h3>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
          </span>
        </div>
        <SensorGrid sensors={liveSensors} />
      </div>

      {/* Recent History Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Verification Tests
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing latest {recentTests.length} readings recorded on station MG-001
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TestTable tests={recentTests} />
      </div>
    </div>
  );
};
