import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BellRingIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import type { Alert } from '../../types';
import { cn } from '../../utils/cn';

const tone = {
  HIGH: {
    ring: 'border-signal-high/25',
    bg: 'bg-signal-high/[0.06]',
    text: 'text-signal-high',
    chip: 'bg-signal-high/15 text-signal-high',
    icon: TriangleAlertIcon,
    label: 'High priority'
  },
  MEDIUM: {
    ring: 'border-signal-med/25',
    bg: 'bg-signal-med/[0.05]',
    text: 'text-signal-med',
    chip: 'bg-signal-med/15 text-signal-med',
    icon: BellRingIcon,
    label: 'Medium priority'
  },
  LOW: {
    ring: 'border-signal-info/20',
    bg: 'bg-signal-info/[0.05]',
    text: 'text-signal-info',
    chip: 'bg-signal-info/15 text-signal-info',
    icon: InfoIcon,
    label: 'Low priority'
  }
} as const;

export function AlertCard({ alert, compact }: {alert: Alert;compact?: boolean;}) {
  const t = tone[alert.priority];
  const Icon = t.icon;

  return (
    <article
      className={cn(
        'rounded-2xl border transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5',
        t.ring,
        t.bg,
        compact ? 'p-3.5' : 'p-5'
      )}>
      
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.chip)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.09em]',
                t.chip
              )}>
              
              {t.label}
            </span>
            <span className="font-mono text-[10px] text-ink-500">
              {alert.id} · {alert.time}
            </span>
          </div>
          <h3 className={cn('mt-2 font-semibold leading-tight text-white', compact ? 'text-[13px]' : 'text-[15px]')}>
            {alert.title}
          </h3>
          {!compact ?
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{alert.detail}</p> :
          null}
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {alert.meta.map((m) =>
            <div key={m.label} className="flex items-baseline gap-1.5">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-600">
                  {m.label}
                </dt>
                <dd className="font-mono text-xs font-semibold text-ink-100">{m.value}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 pl-11">
        <Link
          to={alert.actionTo}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-ink-100 transition-[border-color,background-color] duration-150 ease-out hover:border-tide-500/40 hover:bg-tide-500/10">
          
          {alert.actionLabel}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
        {alert.unread ?
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-tide-400">
            <span className="h-1.5 w-1.5 rounded-full bg-tide-500" />
            Unacknowledged
          </span> :
        null}
      </div>
    </article>);

}