import React from 'react';
import type { RiskLevel } from '../../types';
import { cn } from '../../utils/cn';
import { riskTone, statusTone } from '../../utils/format';

export function Badge({
  children,
  className,
  dot




}: {children: React.ReactNode;className?: string;dot?: string;}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.07em] ring-1 ring-inset',
        className
      )}>
      
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', dot)} /> : null}
      {children}
    </span>);

}

export function RiskBadge({ risk, className }: {risk: RiskLevel;className?: string;}) {
  const tone = riskTone[risk];
  return (
    <Badge className={cn(tone.text, tone.bg, tone.ring, className)} dot={tone.dot}>
      {risk}
    </Badge>);

}

export function StatusBadge({ status, className }: {status: string;className?: string;}) {
  return <Badge className={cn(statusTone[status] ?? 'text-ink-300 bg-white/5 ring-white/10', className)}>{status}</Badge>;
}

export function Chip({
  children,
  active,
  onClick,
  className





}: {children: React.ReactNode;active?: boolean;onClick?: () => void;className?: string;}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color] duration-150 ease-out',
        active ?
        'border-tide-500/50 bg-tide-500/15 text-tide-400' :
        'border-white/10 bg-white/[0.03] text-ink-400 hover:border-white/20 hover:text-ink-100',
        className
      )}>
      
      {children}
    </button>);

}