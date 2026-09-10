import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  normalRange: string;
  status?: 'nominal' | 'warning' | 'critical';
  description?: string;
  subtext?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  normalRange,
  status = 'nominal',
  subtext
}) => {
  const statusColors = {
    nominal: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    warning: 'text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/5',
    critical: 'text-rose-500 dark:text-rose-400 border-rose-500/30 bg-rose-500/5'
  }[status];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className={`p-1.5 rounded-md border ${statusColors}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
          {unit}
        </span>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <span>Range: {normalRange}</span>
        {subtext && <span className="text-slate-400">{subtext}</span>}
      </div>
    </div>
  );
};
