import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, XIcon } from 'lucide-react';
import type { Vessel } from '../../types';
import { cn } from '../../utils/cn';
import { formatCoord, formatTime } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { KeyValue } from '../ui/Panel';

export function VesselCallout({
  vessel,
  onClose,
  floating,
  className





}: {vessel: Vessel;onClose?: () => void;floating?: boolean;className?: string;}) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-white/[0.1] bg-abyss-850/95 p-4 shadow-panel backdrop-blur-xl',
        floating && 'absolute bottom-3 right-3 z-30 w-[min(21rem,calc(100%-1.5rem))]',
        className
      )}
      aria-label={`Vessel ${vessel.name} details`}>
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-white">{vessel.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-400">
            MMSI {vessel.mmsi} · {vessel.imo}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {vessel.aisGap ?
          <Badge className="bg-signal-high/10 text-signal-high ring-signal-high/25" dot="bg-signal-high">
              AIS gap
            </Badge> :

          <Badge className="bg-signal-low/10 text-signal-low ring-signal-low/25" dot="bg-signal-low">
              Reporting
            </Badge>
          }
          {onClose ?
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vessel details"
            className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 ease-out hover:bg-white/[0.07] hover:text-ink-100">
            
              <XIcon className="h-3.5 w-3.5" />
            </button> :
          null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5">
        <KeyValue label="Vessel type" value={vessel.type} />
        <KeyValue label="Flag" value={vessel.flag} />
        <KeyValue label="Speed" value={`${vessel.speedKnots.toFixed(1)} kn`} mono />
        <KeyValue label="Heading" value={`${vessel.headingLabel} · ${vessel.headingDeg}°`} />
        <div className="col-span-2">
          <KeyValue label="Last known location" value={formatCoord(vessel.coord)} mono />
        </div>
        <div className="col-span-2">
          <KeyValue label="Last AIS report" value={formatTime(vessel.lastSeen)} mono />
        </div>
      </dl>

      <Link
        to={`/app/vessels/${vessel.id}`}
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-tide-500 px-3 text-xs font-semibold text-abyss-950 transition-[background-color,transform] duration-150 ease-out hover:bg-tide-400 active:scale-[0.985]">
        
        Open vessel analysis
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </article>);

}