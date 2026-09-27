import React from 'react';
import { cn } from '../../utils/cn';

interface MeterProps {
  value: number;
  label?: string;
  color?: string;
  className?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function Meter({ value, label, color = '#22d3ee', className, showValue = true, size = 'md' }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full', className)}>
      {label || showValue ?
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label ? <span className="text-xs font-medium text-ink-400">{label}</span> : null}
          {showValue ?
        <span className="font-mono text-xs font-semibold tabular text-ink-100">{clamped}%</span> :
        null}
        </div> :
      null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Score'}
        className={cn('w-full overflow-hidden rounded-full bg-white/[0.07]', size === 'sm' ? 'h-1' : 'h-1.5')}>
        
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color, boxShadow: `0 0 12px -2px ${color}` }} />
        
      </div>
    </div>);

}

export function ScoreRing({
  value,
  label,
  color = '#fb4d6a',
  size = 132





}: {value: number;label: string;color?: string;size?: number;}) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const offset = c - Math.min(100, Math.max(0, value)) / 100 * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.23,1,0.32,1)' }} />
          
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold tabular text-ink-100">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-[11px] font-medium uppercase tracking-[0.09em] text-ink-500">{label}</span>
    </div>);

}