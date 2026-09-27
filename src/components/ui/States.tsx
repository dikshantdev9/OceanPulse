import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon, SatelliteDishIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function EmptyState({
  title,
  description,
  icon,
  action,
  className






}: {title: string;description: string;icon?: React.ReactNode;action?: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-ink-400">
        {icon ?? <SatelliteDishIcon className="h-5 w-5" />}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-ink-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>);

}

export function ErrorState({
  title = 'Data feed unavailable',
  description,
  onRetry




}: {title?: string;description: string;onRetry?: () => void;}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center" role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-high/10 text-signal-high ring-1 ring-inset ring-signal-high/25">
        <AlertTriangleIcon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-ink-400">{description}</p>
      {onRetry ?
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCwIcon className="h-3.5 w-3.5" />
          Retry connection
        </Button> :
      null}
    </div>);

}

export function Skeleton({ className }: {className?: string;}) {
  return <div className={cn('animate-pulse rounded-lg bg-white/[0.06]', className)} />;
}

export function SkeletonRows({ rows = 5 }: {rows?: number;}) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) =>
      <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-24 sm:block" />
          <Skeleton className="h-3 w-12" />
        </div>
      )}
    </div>);

}

export function ScanningState({ label = 'Streaming AIS positions…' }: {label?: string;}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12" aria-busy="true">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border border-tide-500/30" />
        <span className="absolute inset-0 animate-pulsering rounded-full border border-tide-500/50" />
        <SatelliteDishIcon className="absolute inset-0 m-auto h-5 w-5 text-tide-500" />
      </div>
      <p className="text-xs font-medium text-ink-400">{label}</p>
    </div>);

}