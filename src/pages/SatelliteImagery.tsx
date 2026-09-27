import React, { useMemo, useState } from 'react';
import {
  DownloadIcon,
  LoaderCircleIcon,
  ScanSearchIcon,
  SearchIcon,
  SquareDashedIcon } from
'lucide-react';
import { satelliteImages } from '../data/imagery';
import { spills } from '../data/spills';
import { scanZones } from '../data/zones';
import { OceanMap } from '../components/map/OceanMap';
import { Chip, StatusBadge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { EmptyState, Skeleton } from '../components/ui/States';
import { formatDate, formatTime } from '../utils/format';

export function SatelliteImagery() {
  const [satellite, setSatellite] = useState('all');
  const [pol, setPol] = useState<'all' | 'VV' | 'VH'>('all');
  const [status, setStatus] = useState<'all' | 'Available' | 'Processing' | 'Analyzed'>('all');
  const [start, setStart] = useState('2026-08-20');
  const [end, setEnd] = useState('2026-09-04');
  const [searching, setSearching] = useState(false);

  const results = useMemo(
    () =>
    satelliteImages.filter((i) => {
      const d = i.captureDate.slice(0, 10);
      return (
        (satellite === 'all' || i.satellite === satellite) && (
        pol === 'all' || i.polarization === pol) && (
        status === 'all' || i.status === status) &&
        d >= start &&
        d <= end);

    }),
    [satellite, pol, status, start, end]
  );

  const search = () => {
    setSearching(true);
    window.setTimeout(() => setSearching(false), 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Data catalogue"
        title="Satellite Imagery"
        subtitle="Query the Sentinel-1 archive by area, date and polarization, then push a scene into the detection queue."
        actions={
        <>
            <Button variant="secondary">
              <DownloadIcon className="h-4 w-4" />
              Download data
            </Button>
            <ButtonLink to="/app/detection">
              <ScanSearchIcon className="h-4 w-4" />
              Analyze image
            </ButtonLink>
          </>
        } />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Panel className="h-fit">
          <PanelHeader
            title="Search area"
            subtitle="Drag on the map to refine the footprint"
            icon={<SquareDashedIcon className="h-4 w-4" />} />
          
          <OceanMap
            className="mt-4 h-52"
            spills={spills.slice(0, 4)}
            scanZones={scanZones}
            showLegend={false}
            showControls={false}
            sweep={false} />
          
          <p className="mt-2 font-mono text-[11px] text-ink-500">
            BBOX 68.0,15.5 → 76.0,22.5 · EPSG:4326
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date"
              name="start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)} />
            
            <Input
              label="End date"
              name="end"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)} />
            
          </div>

          <div className="mt-4">
            <Select
              label="Satellite"
              name="satellite"
              value={satellite}
              onChange={(e) => setSatellite(e.target.value)}
              options={[
              { value: 'all', label: 'All Sentinel-1 platforms' },
              { value: 'Sentinel-1A', label: 'Sentinel-1A' },
              { value: 'Sentinel-1B', label: 'Sentinel-1B' }]
              } />
            
          </div>

          <fieldset className="mt-4">
            <legend className="mb-1.5 text-xs font-semibold text-ink-300">Polarization</legend>
            <div className="flex gap-2">
              {(['all', 'VV', 'VH'] as const).map((p) =>
              <Chip key={p} active={pol === p} onClick={() => setPol(p)}>
                  {p === 'all' ? 'Both' : p}
                </Chip>
              )}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="mb-1.5 text-xs font-semibold text-ink-300">Status</legend>
            <div className="flex flex-wrap gap-2">
              {(['all', 'Available', 'Processing', 'Analyzed'] as const).map((s) =>
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                  {s === 'all' ? 'Any' : s}
                </Chip>
              )}
            </div>
          </fieldset>

          <Button className="mt-6 w-full" onClick={search} disabled={searching}>
            {searching ?
            <>
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                Querying archive…
              </> :

            <>
                <SearchIcon className="h-4 w-4" />
                Search imagery
              </>
            }
          </Button>
        </Panel>

        <Panel flush>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <PanelHeader
              title="Archive results"
              subtitle={`${results.length} scenes matched · ${results.
              reduce((a, b) => a + b.sizeGb, 0).
              toFixed(1)} GB`} />
            
            <p className="font-mono text-[11px] text-ink-500">IW GRDH · 10 m ground range</p>
          </div>

          {searching ?
          <div className="grid gap-4 p-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) =>
            <div key={i} className="space-y-3 rounded-2xl border border-white/[0.06] p-3">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
            )}
            </div> :
          results.length === 0 ?
          <EmptyState
            title="No scenes in this window"
            description="Widen the date range or clear the polarization filter. Sentinel-1 revisits this footprint every 6 days."
            action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPol('all');
                setStatus('all');
                setSatellite('all');
                setStart('2026-08-01');
              }}>
              
                  Reset filters
                </Button>
            } /> :


          <ul className="grid gap-4 p-5 sm:grid-cols-2">
              {results.map((img) =>
            <li key={img.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-tide-500/30">
                    <div className="relative aspect-[16/9] overflow-hidden bg-abyss-950">
                      <img
                    src={img.thumbnail}
                    alt={`SAR preview of ${img.location}`}
                    className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]" />
                  
                      <div className="absolute left-2.5 top-2.5">
                        <StatusBadge status={img.status} />
                      </div>
                      {img.spillDetected ?
                  <span className="absolute right-2.5 top-2.5 rounded-md bg-signal-high/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          Slick found
                        </span> :
                  null}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="truncate font-mono text-[12px] font-semibold text-ink-100">
                        {img.id}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink-400">{img.location}</p>
                      <dl className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                        <div>
                          <dt className="text-ink-600">Satellite</dt>
                          <dd className="font-semibold text-ink-200">{img.satellite}</dd>
                        </div>
                        <div>
                          <dt className="text-ink-600">Capture</dt>
                          <dd className="font-mono font-semibold text-ink-200">
                            {formatDate(img.captureDate)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-ink-600">Resolution</dt>
                          <dd className="font-mono font-semibold text-ink-200">{img.resolutionM} m</dd>
                        </div>
                        <div>
                          <dt className="text-ink-600">Pass time</dt>
                          <dd className="font-mono font-semibold text-ink-200">
                            {formatTime(img.captureDate)}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-auto flex items-center gap-2 pt-4">
                        <ButtonLink to="/app/detection" size="sm" variant="secondary" className="flex-1">
                          Analyze
                        </ButtonLink>
                        <Button size="sm" variant="ghost" aria-label={`Download ${img.id}`}>
                          <DownloadIcon className="h-3.5 w-3.5" />
                          {img.sizeGb} GB
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
            )}
            </ul>
          }
        </Panel>
      </div>
    </div>);

}