import React from 'react';
import type { SpoilageState } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface SpoilageBadgeProps {
  state: SpoilageState;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SpoilageBadge: React.FC<SpoilageBadgeProps> = ({ state, size = 'md', showIcon = true }) => {
  let bg = '';
  let text = '';
  let border = '';
  let Icon = CheckCircle2;

  switch (state) {
    case 'GOOD':
      bg = 'bg-emerald-500/10 dark:bg-emerald-950/40';
      text = 'text-emerald-700 dark:text-emerald-400';
      border = 'border-emerald-500/30';
      Icon = CheckCircle2;
      break;
    case 'SPOILING':
      bg = 'bg-amber-500/10 dark:bg-amber-950/40';
      text = 'text-amber-700 dark:text-amber-400';
      border = 'border-amber-500/30';
      Icon = AlertTriangle;
      break;
    case 'SPOILED':
      bg = 'bg-rose-500/10 dark:bg-rose-950/40';
      text = 'text-rose-700 dark:text-rose-400';
      border = 'border-rose-500/30';
      Icon = XCircle;
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide uppercase',
    lg: 'px-3.5 py-1.5 text-sm font-bold tracking-wider uppercase'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-mono ${bg} ${text} ${border} ${sizeClasses}`}>
      {showIcon && <Icon className={iconSizes} />}
      <span>{state}</span>
    </span>
  );
};
