import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { SuspectVessel } from '../../types';
import { Meter } from '../ui/Meter';
import { confidenceColor } from '../../utils/format';

function rankTone(rank: number) {
  if (rank === 1) return 'bg-signal-high/15 text-signal-high ring-signal-high/30';
  if (rank === 2) return 'bg-signal-med/15 text-signal-med ring-signal-med/30';
  return 'bg-white/[0.06] text-ink-300 ring-white/10';
}

export function SuspectTable({ suspects }: {suspects: SuspectVessel[];}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <caption className="sr-only">Ranked vessels potentially responsible for the detected spill</caption>
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.1em] text-ink-600">
              <th scope="col" className="px-5 py-3 font-semibold">Rank</th>
              <th scope="col" className="px-5 py-3 font-semibold">Vessel</th>
              <th scope="col" className="px-5 py-3 font-semibold">Type</th>
              <th scope="col" className="px-5 py-3 font-semibold">Distance</th>
              <th scope="col" className="px-5 py-3 font-semibold">Time diff.</th>
              <th scope="col" className="px-5 py-3 font-semibold">AIS gap</th>
              <th scope="col" className="px-5 py-3 font-semibold">Confidence</th>
              <th scope="col" className="px-5 py-3 font-semibold sr-only">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {suspects.map((s) =>
            <tr key={s.vesselId} className="transition-colors duration-150 ease-out hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <span
                  className={
                  'inline-flex h-7 w-9 items-center justify-center rounded-lg font-mono text-xs font-bold ring-1 ring-inset ' +
                  rankTone(s.rank)
                  }>
                  
                    #{s.rank}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link
                  to={`/app/vessels/${s.vesselId}`}
                  className="block text-[13px] font-semibold text-ink-100 transition-colors duration-150 ease-out hover:text-tide-400">
                  
                    {s.name}
                  </Link>
                  <span className="font-mono text-[11px] text-ink-500">MMSI {s.mmsi}</span>
                </td>
                <td className="px-5 py-4 text-[13px] text-ink-300">{s.type}</td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-[13px] tabular text-ink-200">
                  {s.distanceKm} km
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-[13px] tabular text-ink-200">
                  {Math.floor(s.timeDiffMinutes / 60)}h {s.timeDiffMinutes % 60}m
                </td>
                <td className="px-5 py-4">
                  <span
                  className={
                  'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ' + (
                  s.aisGap ?
                  'bg-signal-high/15 text-signal-high' :
                  'bg-white/[0.06] text-ink-400')
                  }>
                  
                    {s.aisGap ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex w-40 items-center gap-3">
                    <Meter
                    value={s.confidence}
                    showValue={false}
                    size="sm"
                    color={confidenceColor(s.confidence)} />
                  
                    <span className="font-mono text-[13px] font-semibold tabular text-white">
                      {s.confidence}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                  to={`/app/vessels/${s.vesselId}`}
                  aria-label={`Open detailed analysis for ${s.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-[border-color,color] duration-150 ease-out hover:border-tide-500/40 hover:text-tide-400">
                  
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 p-4 md:hidden">
        {suspects.map((s) =>
        <li key={s.vesselId}>
            <Link
            to={`/app/vessels/${s.vesselId}`}
            className="block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            
              <div className="flex items-center gap-3">
                <span
                className={
                'inline-flex h-7 w-9 items-center justify-center rounded-lg font-mono text-xs font-bold ring-1 ring-inset ' +
                rankTone(s.rank)
                }>
                
                  #{s.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink-100">{s.name}</span>
                  <span className="block font-mono text-[11px] text-ink-500">
                    {s.mmsi} · {s.type}
                  </span>
                </span>
                <span className="font-mono text-sm font-semibold tabular text-white">{s.confidence}%</span>
              </div>
              <Meter
              className="mt-3"
              value={s.confidence}
              showValue={false}
              size="sm"
              color={confidenceColor(s.confidence)} />
            
              <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <dt className="text-ink-600">Distance</dt>
                  <dd className="font-mono font-semibold text-ink-200">{s.distanceKm} km</dd>
                </div>
                <div>
                  <dt className="text-ink-600">Time diff.</dt>
                  <dd className="font-mono font-semibold text-ink-200">
                    {Math.floor(s.timeDiffMinutes / 60)}h {s.timeDiffMinutes % 60}m
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-600">AIS gap</dt>
                  <dd
                  className={
                  'font-semibold ' + (s.aisGap ? 'text-signal-high' : 'text-ink-300')
                  }>
                  
                    {s.aisGap ? 'Yes' : 'No'}
                  </dd>
                </div>
              </dl>
            </Link>
          </li>
        )}
      </ul>
    </>);

}