import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ShipIcon, SlidersHorizontalIcon } from 'lucide-react';
import { vessels } from '../data/vessels';
import type { Vessel, VesselType } from '../types';
import { OceanMap } from '../components/map/OceanMap';
import { VesselCallout } from '../components/vessel/VesselCallout';
import { Badge, Chip } from '../components/ui/Badge';
import { Input } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { EmptyState } from '../components/ui/States';
import { formatTime } from '../utils/format';

const types: (VesselType | 'All')[] = ['All', 'Oil Tanker', 'Tanker', 'Cargo Ship', 'Fishing', 'Passenger'];

export function VesselTracking() {
  const [type, setType] = useState<(typeof types)[number]>('All');
  const [query, setQuery] = useState('');
  const [minSpeed, setMinSpeed] = useState(0);
  const [selected, setSelected] = useState<Vessel | null>(vessels[0]);

  const filtered = useMemo(
    () =>
    vessels.filter((v) => {
      const q = query.trim().toLowerCase();
      return (
        (type === 'All' || v.type === type) &&
        v.speedKnots >= minSpeed && (
        q === '' || v.name.toLowerCase().includes(q) || v.mmsi.includes(q)));

    }),
    [type, query, minSpeed]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AIS network"
        title="AIS Vessel Tracking"
        subtitle="Replay live and historical AIS positions, and flag transponder gaps inside monitored waters."
        actions={
        <Badge className="bg-tide-500/10 text-tide-400 ring-tide-500/25" dot="bg-tide-500">
            {filtered.length} targets in view
          </Badge>
        } />
      

      <Panel>
        <PanelHeader
          title="Filters"
          subtitle="Narrow the AIS feed before correlating with a detection"
          icon={<SlidersHorizontalIcon className="h-4 w-4" />} />
        
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <Input
            label="Search vessel"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<SearchIcon className="h-4 w-4" />}
            placeholder="Name or MMSI" />
          
          <Input label="Position window" name="window" type="date" defaultValue="2026-09-04" />
          <div>
            <label htmlFor="speed" className="mb-1.5 block text-xs font-semibold text-ink-300">
              Minimum speed · {minSpeed} kn
            </label>
            <input
              id="speed"
              type="range"
              min={0}
              max={20}
              value={minSpeed}
              onChange={(e) => setMinSpeed(Number(e.target.value))}
              className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-tide-500" />
            
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {types.map((t) =>
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </Chip>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel flush>
          <OceanMap
            className="h-[400px] rounded-none border-0 xl:h-[560px]"
            vessels={filtered}
            selectedId={selected?.id ?? null}
            onSelectVessel={setSelected}
            legendExtra={[{ label: 'Dashed track = AIS gap', color: '#fb4d6a' }]}
            overlay={
            selected ?
            <VesselCallout floating vessel={selected} onClose={() => setSelected(null)} /> :
            null
            } />
          
        </Panel>

        <Panel flush className="flex flex-col">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <PanelHeader
              title="Vessels in range"
              subtitle={`${filtered.filter((v) => v.aisGap).length} with reporting gaps`}
              icon={<ShipIcon className="h-4 w-4" />} />
            
          </div>
          {filtered.length === 0 ?
          <EmptyState
            title="No vessels match these filters"
            description="Lower the minimum speed or clear the vessel type filter to widen the AIS query."
            icon={<ShipIcon className="h-5 w-5" />} /> :


          <ul className="max-h-[520px] divide-y divide-white/[0.05] overflow-y-auto">
              {filtered.map((v) =>
            <li key={v.id}>
                  <button
                type="button"
                onClick={() => setSelected(v)}
                className={
                'flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors duration-150 ease-out hover:bg-white/[0.04] ' + (
                selected?.id === v.id ? 'bg-tide-500/[0.07]' : '')
                }>
                
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                      <ShipIcon
                    className={'h-4 w-4 ' + (v.aisGap ? 'text-signal-high' : 'text-tide-500')} />
                  
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold text-ink-100">{v.name}</span>
                        {v.aisGap ?
                    <span className="shrink-0 rounded bg-signal-high/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-signal-high">
                            gap
                          </span> :
                    null}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-ink-500">
                        {v.mmsi} · {v.type} · {v.flag}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] tabular text-ink-400">
                        {v.speedKnots.toFixed(1)} kn · {v.headingLabel} · {formatTime(v.lastSeen)}
                      </span>
                    </span>
                  </button>
                </li>
            )}
            </ul>
          }
          <div className="mt-auto border-t border-white/[0.06] px-5 py-4">
            <Link
              to="/app/correlation"
              className="text-xs font-semibold text-tide-500 transition-colors duration-150 ease-out hover:text-tide-400">
              
              Correlate this feed with OG-2026-001 →
            </Link>
          </div>
        </Panel>
      </div>
    </div>);

}