import React from 'react';
import type { MilkBatch } from '../../types';
import { SpoilageBadge } from '../Quality/SpoilageBadge';
import { AdulterationBadge } from '../Quality/AdulterationBadge';
import { formatTimestamp } from '../../utils/formatters';
import { Layers, User, Calendar, Droplets } from 'lucide-react';

interface BatchCardProps {
  batch: MilkBatch;
  onSelect?: (batch: MilkBatch) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const { date } = formatTimestamp(batch.createdDate);
  const score = batch.averageQualityScore;
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

  const statusBadge = {
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ACTIVE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    ARCHIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }[batch.status];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all font-mono">
      <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {batch.batchId}
            </h3>
            <span className="text-[11px] text-slate-400">
              {batch.farmerName || batch.source}
            </span>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusBadge}`}>
          {batch.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase">Source ID</span>
          <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{batch.source}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase">Volume</span>
          <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <Droplets className="w-3.5 h-3.5 text-slate-400" />
            <span>{batch.volumeLiters} Liters</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase">Verified Tests</span>
          <div className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
            {batch.testCount} tests recorded
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase">Avg. Quality</span>
          <div className={`font-bold text-base mt-0.5 ${scoreColor}`}>
            {score > 0 ? `${score}%` : 'Pending'}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-1">
          <SpoilageBadge state={batch.latestResult.spoilage} size="sm" />
          <AdulterationBadge state={batch.latestResult.adulteration} size="sm" />
        </div>
      </div>
    </div>
  );
};
