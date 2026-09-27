import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuitIcon,
  ChevronRightIcon,
  CompassIcon,
  CpuIcon,
  ShipIcon,
  SatelliteIcon,
  TriangleAlertIcon,
  WavesIcon } from
'lucide-react';
import { cn } from '../utils/cn';

export interface PipelineStep {
  id: string;
  label: string;
  caption: string;
  icon: React.ReactNode;
}

export const fullPipeline: PipelineStep[] = [
{
  id: 'image',
  label: 'Satellite image',
  caption: 'Sentinel-1 GRD scene ingested from the Copernicus hub.',
  icon: <SatelliteIcon className="h-4 w-4" />
},
{
  id: 'preprocess',
  label: 'SAR preprocessing',
  caption: 'Calibration, speckle filtering and terrain correction.',
  icon: <CpuIcon className="h-4 w-4" />
},
{
  id: 'model',
  label: 'AI model',
  caption: 'U-Net segmentation over VV/VH backscatter tiles.',
  icon: <BrainCircuitIcon className="h-4 w-4" />
},
{
  id: 'detect',
  label: 'Oil spill detection',
  caption: 'Slick polygons, area and confidence scoring.',
  icon: <WavesIcon className="h-4 w-4" />
},
{
  id: 'drift',
  label: 'Drift backtracking',
  caption: 'OpenDrift reverse advection to the release point.',
  icon: <CompassIcon className="h-4 w-4" />
},
{
  id: 'ais',
  label: 'AIS correlation',
  caption: 'Vessel tracks matched against the release window.',
  icon: <ShipIcon className="h-4 w-4" />
},
{
  id: 'rank',
  label: 'Suspect ranking',
  caption: 'Weighted evidence score per candidate vessel.',
  icon: <TriangleAlertIcon className="h-4 w-4" />
}];


interface PipelineFlowProps {
  steps?: PipelineStep[];
  /** Auto-advance the active highlight to convey a live pipeline */
  autoplay?: boolean;
  activeIndex?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function PipelineFlow({
  steps = fullPipeline,
  autoplay = true,
  activeIndex,
  orientation = 'horizontal',
  className
}: PipelineFlowProps) {
  const [index, setIndex] = useState(0);
  const active = activeIndex ?? index;

  useEffect(() => {
    if (!autoplay || activeIndex !== undefined) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % steps.length), 1600);
    return () => window.clearInterval(t);
  }, [autoplay, activeIndex, steps.length]);

  if (orientation === 'vertical') {
    return (
      <ol className={cn('relative space-y-1', className)}>
        {steps.map((s, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'idle';
          return (
            <li key={s.id} className="relative flex gap-3.5 pb-1">
              {i < steps.length - 1 ?
              <span
                className={cn(
                  'absolute left-[17px] top-9 h-[calc(100%-1rem)] w-px transition-colors duration-200 ease-out',
                  state === 'idle' ? 'bg-white/10' : 'bg-tide-500/45'
                )} /> :

              null}
              <span
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-[background-color,border-color,color] duration-200 ease-out',
                  state === 'active' ?
                  'border-tide-500/60 bg-tide-500/15 text-tide-400' :
                  state === 'done' ?
                  'border-tide-500/25 bg-tide-500/[0.08] text-tide-500' :
                  'border-white/10 bg-white/[0.03] text-ink-500'
                )}>
                
                {s.icon}
                {state === 'active' ?
                <span className="absolute inset-0 animate-pulsering rounded-xl border border-tide-500/60" /> :
                null}
              </span>
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    'text-sm font-semibold transition-colors duration-200 ease-out',
                    state === 'idle' ? 'text-ink-400' : 'text-ink-100'
                  )}>
                  
                  {s.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{s.caption}</p>
              </div>
            </li>);

        })}
      </ol>);

  }

  return (
    <div className={cn('w-full overflow-x-auto pb-2', className)}>
      <ol className="flex min-w-max items-stretch gap-2">
        {steps.map((s, i) => {
          const isActive = i === active;
          return (
            <li key={s.id} className="flex items-center gap-2">
              <motion.div
                animate={{
                  borderColor: isActive ? 'rgba(34,211,238,0.55)' : 'rgba(255,255,255,0.08)',
                  backgroundColor: isActive ? 'rgba(34,211,238,0.10)' : 'rgba(255,255,255,0.025)'
                }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="w-[176px] rounded-2xl border p-3.5">
                
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 ease-out',
                      isActive ? 'bg-tide-500/20 text-tide-400' : 'bg-white/[0.05] text-ink-400'
                    )}>
                    
                    {s.icon}
                  </span>
                  <span className="font-mono text-[10px] font-semibold tabular text-ink-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p
                  className={cn(
                    'mt-2.5 text-[13px] font-semibold leading-tight transition-colors duration-200 ease-out',
                    isActive ? 'text-white' : 'text-ink-300'
                  )}>
                  
                  {s.label}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-ink-500">{s.caption}</p>
              </motion.div>
              {i < steps.length - 1 ?
              <ChevronRightIcon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-200 ease-out',
                  i < active ? 'text-tide-500' : 'text-ink-600'
                )}
                aria-hidden="true" /> :

              null}
            </li>);

        })}
      </ol>
    </div>);

}