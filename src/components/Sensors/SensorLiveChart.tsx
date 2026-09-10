import React, { useState, useEffect } from 'react';
import type { SensorValues } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface SensorLiveChartProps {
  currentSensors: SensorValues;
}

export const SensorLiveChart: React.FC<SensorLiveChartProps> = ({ currentSensors }) => {
  const [dataPoints, setDataPoints] = useState<any[]>([]);

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
          temp: currentSensors.temperature
        }
      ];
      return next.slice(-15);
    });
  }, [currentSensors]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs font-mono">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Real-Time Sensor Telemetry Stream
        </h3>
        <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          1 Hz Active Stream
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={10} domain={[0, 400]} label={{ value: 'Gas (ADC/ppm)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={10} domain={[0, 10]} label={{ value: 'pH / TDS', angle: 90, position: 'insideRight', fill: '#06b6d4', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line yAxisId="left" type="monotone" dataKey="mq137" name="MQ-137 (Ammonia)" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="mq135" name="MQ-135 (Air/VOC)" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="mq3" name="MQ-3 (Ethanol)" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="conductivity" name="Cond. (mS/cm)" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
