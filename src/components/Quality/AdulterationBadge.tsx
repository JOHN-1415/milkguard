import React from 'react';
import type { AdulterationState } from '../../types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface AdulterationBadgeProps {
  state: AdulterationState;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AdulterationBadge: React.FC<AdulterationBadgeProps> = ({ state, size = 'md', showIcon = true }) => {
  const isDetected = state === 'DETECTED';

  const bg = isDetected 
    ? 'bg-rose-500/15 dark:bg-rose-950/50' 
    : 'bg-cyan-500/10 dark:bg-cyan-950/40';
  const text = isDetected 
    ? 'text-rose-700 dark:text-rose-400' 
    : 'text-cyan-700 dark:text-cyan-400';
  const border = isDetected 
    ? 'border-rose-500/40' 
    : 'border-cyan-500/30';
  const Icon = isDetected ? ShieldAlert : ShieldCheck;
  const label = isDetected ? 'DETECTED' : 'NOT DETECTED';

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
      <span>{label}</span>
    </span>
  );
};
