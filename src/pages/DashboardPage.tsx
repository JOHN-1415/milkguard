import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { TestReading, AnalyticsSummary } from '../types';
import { QualityCard } from '../components/Quality/QualityCard';
import { SensorGrid } from '../components/Sensors/SensorGrid';
import { TestTable } from '../components/Tests/TestTable';
import { LoadingState } from '../components/Common/LoadingState';
import { MetricCard } from '../components/Common/MetricCard';
import { 
  Play, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Radio, 
  ShieldAlert 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [latestTest, setLatestTest] = useState<TestReading | null>(null);
  const [recentTests, setRecentTests] = useState<TestReading[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <LoadingState message="Connecting to simulated sensor telemetry node..." />;
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                System Online
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                Device: MG-001
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase">
                Simulated ESP32 Node
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              MilkGuard Telemetry & Quality Engine
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Multi-sensor electrochemical verification node for rapid raw milk grading, spoilage detection, and adulterant identification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/live"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Analysis</span>
            </Link>
          </div>
        </div>
      </div>

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
            subtext="Non-nominal ionic/pH profile"
            icon={ShieldAlert}
            accentColor="rose"
            badge={analytics.adulteratedSamples > 0 ? 'Action Required' : 'Nominal'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
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
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Physical Sensor Readings (Telemetry Stream)
          </h3>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
          </span>
        </div>
        <SensorGrid sensors={latestTest.sensors} />
      </div>

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
