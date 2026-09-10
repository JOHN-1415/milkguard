import React from 'react';
import { Link } from 'react-router-dom';
import type { TestReading } from '../../types';
import { SpoilageBadge } from '../Quality/SpoilageBadge';
import { AdulterationBadge } from '../Quality/AdulterationBadge';
import { formatTimestamp } from '../../utils/formatters';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

interface TestTableProps {
  tests: TestReading[];
}

export const TestTable: React.FC<TestTableProps> = ({ tests }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs font-mono">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Test ID</th>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4">Device</th>
              <th className="py-3 px-4">Batch</th>
              <th className="py-3 px-4 text-center">Quality Score</th>
              <th className="py-3 px-4">Spoilage</th>
              <th className="py-3 px-4">Adulteration</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tests.map(test => {
              const { date, time } = formatTimestamp(test.timestamp);
              const score = test.result.qualityScore;
              const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

              return (
                <tr 
                  key={test.testId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <Link to={`/history/${test.testId}`} className="hover:text-emerald-500 flex items-center gap-1">
                      {test.testId}
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div>{date}</div>
                    <div className="text-[10px] text-slate-400">{time}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                      {test.deviceId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {test.batchId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold text-sm ${scoreColor}`}>
                      {score}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <SpoilageBadge state={test.result.spoilage} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <AdulterationBadge state={test.result.adulteration} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/history/${test.testId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs transition-colors"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
