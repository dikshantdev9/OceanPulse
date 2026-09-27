import React from 'react';

const items = [
{ label: 'Confirmed oil spill', color: '#fb4d6a', shape: 'dot' as const },
{ label: 'Possible oil spill', color: '#f59e0b', shape: 'dot' as const },
{ label: 'Vessel (AIS)', color: '#22d3ee', shape: 'ship' as const },
{ label: 'Satellite coverage', color: '#a78bfa', shape: 'zone' as const }];


export function MapLegend({ extra }: {extra?: {label: string;color: string;}[];}) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-xl border border-white/10 bg-abyss-950/80 p-3 backdrop-blur-md">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">Legend</p>
      <ul className="space-y-1.5">
        {items.map((i) =>
        <li key={i.label} className="flex items-center gap-2 text-[11px] font-medium text-ink-300">
            {i.shape === 'dot' ?
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: i.color, boxShadow: `0 0 10px -1px ${i.color}` }} /> :

          i.shape === 'ship' ?
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
                <polygon points="5,0 9,10 5,7.5 1,10" fill={i.color} />
              </svg> :

          <span
            className="h-2.5 w-2.5 rounded-sm border border-dashed"
            style={{ borderColor: i.color, backgroundColor: `${i.color}22` }} />

          }
            {i.label}
          </li>
        )}
        {extra?.map((i) =>
        <li key={i.label} className="flex items-center gap-2 text-[11px] font-medium text-ink-300">
            <span className="h-0.5 w-2.5 rounded-full" style={{ backgroundColor: i.color }} />
            {i.label}
          </li>
        )}
      </ul>
    </div>);

}