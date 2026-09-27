import React from 'react';
import { Link } from 'react-router-dom';
import { ShipIcon, XIcon } from 'lucide-react';
import type { Spill } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate, formatTime, formatCoord, confidenceColor } from '../../utils/format';
import { RiskBadge, StatusBadge } from '../ui/Badge';
import { Meter } from '../ui/Meter';
import { KeyValue } from '../ui/Panel';

interface SpillCalloutProps {
  spill: Spill;
  onClose?: () => void;
  className?: string;
  /** Rendered floating over a map */
  floating?: boolean;
}

export function SpillCallout({ spill, onClose, className, floating }: SpillCalloutProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-white/[0.1] bg-abyss-850/95 p-4 shadow-panel backdrop-blur-xl',
        floating && 'absolute bottom-3 right-3 z-30 w-[min(21rem,calc(100%-1.5rem))]',
        className
      )}
      aria-label={`Oil spill ${spill.id} details`}>
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-semibold text-white">{spill.id}</p>
          <p className="mt-0.5 truncate text-xs text-ink-400">{spill.location}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <RiskBadge risk={spill.risk} />
          {onClose ?
          <button
            type="button"
            onClick={onClose}
            aria-label="Close spill details"
            className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 ease-out hover:bg-white/[0.07] hover:text-ink-100">
            
              <XIcon className="h-3.5 w-3.5" />
            </button> :
          null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5">
        <KeyValue label="Detected" value={`${formatDate(spill.detectedAt)}`} />
        <KeyValue label="Capture time" value={formatTime(spill.detectedAt)} mono />
        <KeyValue label="Estimated area" value={`${spill.areaKm2} km²`} mono />
        <KeyValue label="Status" value={<StatusBadge status={spill.status} />} />
        <div className="col-span-2">
          <KeyValue label="Coordinates" value={formatCoord(spill.coord)} mono />
        </div>
      </dl>

      <div className="mt-4">
        <Meter
          value={spill.confidence}
          label="Detection confidence"
          color={confidenceColor(spill.confidence)} />
        
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          to="/app/correlation"
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-tide-500 px-3 text-xs font-semibold text-abyss-950 transition-[background-color,transform] duration-150 ease-out hover:bg-tide-400 active:scale-[0.985]">
          
          <ShipIcon className="h-3.5 w-3.5" />
          Analyze vessels
        </Link>
        <Link
          to="/app/detection"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-ink-200 transition-[border-color,color] duration-150 ease-out hover:border-tide-500/40 hover:text-tide-400">
          
          Detection detail
        </Link>
      </div>
      <p className="mt-2.5 text-[11px] text-ink-500">
        {spill.suspectCount > 0 ?
        `${spill.suspectCount} candidate vessels within the release window.` :
        'No AIS candidates inside the release window.'}
      </p>
    </article>);

}