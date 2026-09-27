import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Panel } from './Panel';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: {direction: 'up' | 'down' | 'flat';value: string;note: string;goodWhen?: 'up' | 'down';};
  icon: React.ReactNode;
  accent?: 'tide' | 'high' | 'med' | 'scan';
  emphasis?: boolean;
}

const accents: Record<string, string> = {
  tide: 'text-tide-500 bg-tide-500/10 ring-tide-500/20',
  high: 'text-signal-high bg-signal-high/10 ring-signal-high/20',
  med: 'text-signal-med bg-signal-med/10 ring-signal-med/20',
  scan: 'text-signal-scan bg-signal-scan/10 ring-signal-scan/20'
};

export function StatCard({ label, value, unit, trend, icon, accent = 'tide', emphasis }: StatCardProps) {
  const good = trend ?
  trend.direction === 'flat' ?
  'flat' :
  trend.direction === (trend.goodWhen ?? 'up') ?
  'good' :
  'bad' :
  'flat';

  return (
    <Panel
      className={cn(
        'group flex flex-col justify-between transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-tide-500/25',
        emphasis && 'ring-1 ring-inset ring-signal-high/20'
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-500">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
            accents[accent]
          )}>
          
          {icon}
        </span>
      </div>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-mono font-semibold tabular tracking-tight text-white',
            emphasis ? 'text-4xl' : 'text-3xl'
          )}>
          
          {value}
        </span>
        {unit ? <span className="text-sm font-medium text-ink-400">{unit}</span> : null}
      </div>
      {trend ?
      <div className="mt-3 flex items-center gap-2 text-xs">
          <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold',
            good === 'good' && 'bg-signal-low/10 text-signal-low',
            good === 'bad' && 'bg-signal-high/10 text-signal-high',
            good === 'flat' && 'bg-white/[0.06] text-ink-400'
          )}>
          
            {trend.direction === 'up' ?
          <ArrowUpRightIcon className="h-3 w-3" /> :
          trend.direction === 'down' ?
          <ArrowDownRightIcon className="h-3 w-3" /> :

          <MinusIcon className="h-3 w-3" />
          }
            {trend.value}
          </span>
          <span className="truncate text-ink-500">{trend.note}</span>
        </div> :
      null}
    </Panel>);

}