import React from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  /** Removes inner padding for map / media panels */
  flush?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside';
  ariaLabel?: string;
}

export function Panel({ children, className, flush, as = 'div', ariaLabel }: PanelProps) {
  const Tag = as;
  return (
    <Tag
      aria-label={ariaLabel}
      className={cn(
        'relative rounded-2xl border border-white/[0.07] bg-abyss-850/70 shadow-panel backdrop-blur-xl',
        flush ? 'overflow-hidden' : 'p-5',
        className
      )}>
      
      {children}
    </Tag>);

}

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PanelHeader({ title, subtitle, icon, action, className }: PanelHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ?
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tide-500/10 text-tide-500 ring-1 ring-tide-500/20">
            {icon}
          </span> :
        null}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-ink-100">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>);

}

export function KeyValue({
  label,
  value,
  mono,
  tone





}: {label: string;value: React.ReactNode;mono?: boolean;tone?: string;}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink-500">{label}</dt>
      <dd
        className={cn(
          'mt-1 truncate text-sm font-semibold text-ink-100',
          mono && 'font-mono text-[13px] tabular',
          tone
        )}>
        
        {value}
      </dd>
    </div>);

}