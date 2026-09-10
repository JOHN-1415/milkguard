import React from 'react';
import type { ClassificationResult } from '../../types';
import { SpoilageBadge } from './SpoilageBadge';
import { AdulterationBadge } from './AdulterationBadge';
import { Activity, AlertCircle, Info } from 'lucide-react';

interface QualityCardProps {
  result: ClassificationResult;
  subtitle?: string;
  compact?: boolean;
}

export const QualityCard: React.FC<QualityCardProps> = ({ result, subtitle, compact = false }) => {
  const score = result.qualityScore;

  let scoreColor = 'text-emerald-500 dark:text-emerald-400';
  let progressBg = 'bg-emerald-500';
  let qualityStatus = 'EXCELLENT / GOOD';

  if (score < 50) {
    scoreColor = 'text-rose-500 dark:text-rose-400';
    progressBg = 'bg-rose-500';
    qualityStatus = 'CRITICAL / REJECT';
  } else if (score < 80) {
    scoreColor = 'text-amber-500 dark:text-amber-400';
    progressBg = 'bg-amber-500';
    qualityStatus = 'DEGRADED / ATTENTION';
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Milk Quality Verification
            </h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          MG-001 TELEMETRY
        </span>
      </div>

      <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="flex items-baseline gap-2">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Quality Score</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold tracking-tight font-mono ${scoreColor}`}>
                {score}
              </span>
              <span className="text-lg font-bold text-slate-400 font-mono">%</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 font-mono">
              STATUS: {result.spoilage === 'GOOD' && result.adulteration === 'NOT_DETECTED' ? 'GOOD' : qualityStatus}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Spoilage State
            </div>
            <div>
              <SpoilageBadge state={result.spoilage} size="md" />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Adulteration State
            </div>
            <div>
              <AdulterationBadge state={result.adulteration} size="md" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full transition-all duration-500 ${progressBg}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {!compact && (
        <div className="space-y-2 pt-2 text-xs">
          {result.detectedAdulterants && result.detectedAdulterants.length > 0 && (
            <div className="p-2.5 rounded bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <strong className="font-semibold">Detected Adulterants:</strong>
                <ul className="list-disc list-inside mt-0.5 text-[11px] space-y-0.5">
                  {result.detectedAdulterants.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {result.spoilageNotes && (
            <p className="text-slate-600 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{result.spoilageNotes}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
