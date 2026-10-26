import React, { useState, useEffect } from 'react';
import type { SensorValues } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface SensorLiveChartProps {
  currentSensors: SensorValues;
}

export const SensorLiveChart: React.FC<SensorLiveChartProps> = ({ currentSensors }) => {
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [chartMode, setChartMode] = useState<'ALL' | 'OPTICAL_THERMAL' | 'GAS_PH'>('ALL');

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setDataPoints(prev => {
      const next = [
        ...prev,
        {
          time: timeStr,
          mq137: currentSensors.mq137,
          mq135: currentSensors.mq135,
          mq3: currentSensors.mq3,
          ph: currentSensors.ph,
          conductivity: currentSensors.conductivity,
          temp: currentSensors.temperature,
          turbidity: currentSensors.turbidity ?? 2400
        }
      ];
      return next.slice(-20);
    });
  }, [currentSensors]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs font-mono transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Real-Time Hardware Telemetry Stream
          </h3>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            1 Hz Active
          </span>
        </div>

        {/* Channel Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[10px]">
          <button
            onClick={() => setChartMode('ALL')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              chartMode === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setChartMode('OPTICAL_THERMAL')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              chartMode === 'OPTICAL_THERMAL'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Turbidity & Temp
          </button>
          <button
            onClick={() => setChartMode('GAS_PH')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              chartMode === 'GAS_PH'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Conductivity & Gas
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} />

            {chartMode === 'OPTICAL_THERMAL' ? (
              <>
                <YAxis yAxisId="turb" stroke="#0ea5e9" fontSize={10} domain={[0, 4000]} label={{ value: 'Turbidity (NTU)', angle: -90, position: 'insideLeft', fill: '#0ea5e9', fontSize: 10 }} />
                <YAxis yAxisId="temp" orientation="right" stroke="#f97316" fontSize={10} domain={[0, 50]} label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="turb" type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#0ea5e9" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="temp" type="monotone" dataKey="temp" name="DS18B20 Temp (°C)" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
              </>
            ) : chartMode === 'GAS_PH' ? (
              <>
                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={[0, 450]} label={{ value: 'Gas (ADC/ppm)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={10} domain={[0, 10]} label={{ value: 'pH / TDS', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="mq137" name="MQ-137 (Ammonia)" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="mq135" name="MQ-135 (Air/VOC)" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="mq3" name="MQ-3 (Ethanol)" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="conductivity" name="Cond. (mS/cm)" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </>
            ) : (
              <>
                <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={[0, 450]} label={{ value: 'Gas / Temp', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={10} domain={[0, 12]} label={{ value: 'pH / TDS', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="mq137" name="MQ-137" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="mq135" name="MQ-135" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="mq3" name="MQ-3" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="DS18B20 Temp" stroke="#f97316" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="conductivity" name="Cond." stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
