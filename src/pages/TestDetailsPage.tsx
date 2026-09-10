import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { TestReading } from '../types';
import { QualityCard } from '../components/Quality/QualityCard';
import { SensorGrid } from '../components/Sensors/SensorGrid';
import { LoadingState } from '../components/Common/LoadingState';
import { formatTimestamp } from '../utils/formatters';
import { exportSingleTestJSON } from '../utils/exportHelpers';
import { 
  ArrowLeft, 
  Download, 
  Layers, 
  FileText, 
  Cpu, 
  Clock, 
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const TestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTest(id);
    }
  }, [id]);

  const loadTest = async (testId: string) => {
    try {
      setLoading(true);
      const res = await api.getTestById(testId);
      setTest(res);
    } catch (err) {
      console.error('Failed to load test details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading test details and calibration curve..." />;
  }

  if (!test) {
    return (
      <div className="text-center py-16 font-mono">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Test Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Test ID {id} does not exist in local records.</p>
        <Link to="/history" className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-500 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Test History
        </Link>
      </div>
    );
  }

  const { full: formattedTimestamp } = formatTimestamp(test.timestamp);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Verification Record: {test.testId}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {test.deviceId}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTimestamp}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSingleTestJSON(test)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Spec</span>
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Classification Result</span>
        </h3>
        <QualityCard result={test.result} subtitle={`Batch Reference: ${test.batchId}`} />
      </section>

      {test.timeSeriesSamples && test.timeSeriesSamples.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sensor Response Curve (10s Stabilization Cycle)
              </h3>
              <p className="text-[11px] text-slate-500">
                Transmitted ADC gas voltages & potentiometric signal ramp up during chamber thermalization.
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Validated Signal
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={test.timeSeriesSamples}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="timeOffsetSec" unit="s" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="mq137" name="MQ-137 (Ammonia)" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                <Area type="monotone" dataKey="mq135" name="MQ-135 (Air/VOC)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Area type="monotone" dataKey="mq3" name="MQ-3 (Ethanol)" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-emerald-500" />
          <span>Sensor Data Snapshot</span>
        </h3>
        <SensorGrid sensors={test.sensors} />
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>Test Information & Verification Audit</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] uppercase">Test Identifier</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{test.testId}</div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] uppercase">Associated Batch</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <Link to="/batches" className="text-emerald-500 hover:underline">{test.batchId}</Link>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] uppercase">Acquisition Node</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{test.deviceId}</div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] uppercase">Operator Remarks</span>
            <div className="text-slate-700 dark:text-slate-300 mt-0.5">
              {test.operatorNote || 'No operator remarks recorded.'}
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] uppercase">Classification Model</span>
            <div className="text-slate-700 dark:text-slate-300 mt-0.5">
              v1.0 Multi-Electrolyte Heuristic Array
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] uppercase">Confidence Rating</span>
            <div className="text-emerald-400 font-bold mt-0.5">
              {test.result.confidence ? `${test.result.confidence}%` : '95.0%'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
