import React, { useState } from 'react';
import { CompassIcon, GaugeIcon, PlayIcon, WavesIcon, WindIcon } from 'lucide-react';
import { primarySpill } from '../data/spills';
import { suspects, vessels } from '../data/vessels';
import { driftConditions, driftCoords, driftFrames } from '../data/zones';
import { OceanMap } from '../components/map/OceanMap';
import { Button, ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { KeyValue, Panel, PanelHeader } from '../components/ui/Panel';
import { formatCoord, formatDate, formatTime } from '../utils/format';
import { distanceKm } from '../components/map/projection';

export function DriftBacktracking() {
  const [frameIndex, setFrameIndex] = useState(0);
  const frame = driftFrames[frameIndex];
  const nearby = vessels.filter((v) => suspects.some((s) => s.vesselId === v.id));
  const displacement = distanceKm(driftFrames[0].coord, frame.coord);

  const play = () => {
    let i = 0;
    setFrameIndex(0);
    const t = window.setInterval(() => {
      i += 1;
      setFrameIndex(i);
      if (i >= driftFrames.length - 1) window.clearInterval(t);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Drift model · ${primarySpill.id}`}
        title="Drift Backtracking"
        subtitle="Reverse-advect the observed slick through the wind and current field to estimate where the oil was released."
        actions={
        <>
            <Button variant="secondary" onClick={play}>
              <PlayIcon className="h-4 w-4" />
              Animate backtrack
            </Button>
            <ButtonLink to="/app/correlation">Open correlation</ButtonLink>
          </>
        } />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <PanelHeader title="Wind" icon={<WindIcon className="h-4 w-4" />} />
          <p className="mt-4 font-mono text-2xl font-semibold tabular text-white">
            {driftConditions.windSpeedKt} <span className="text-sm text-ink-400">kn</span>
          </p>
          <p className="mt-1 text-xs text-ink-400">{driftConditions.windDirection}</p>
        </Panel>
        <Panel>
          <PanelHeader title="Ocean current" icon={<WavesIcon className="h-4 w-4" />} />
          <p className="mt-4 font-mono text-2xl font-semibold tabular text-white">
            {driftConditions.currentSpeedKt} <span className="text-sm text-ink-400">kn</span>
          </p>
          <p className="mt-1 text-xs text-ink-400">{driftConditions.currentDirection}</p>
        </Panel>
        <Panel>
          <PanelHeader title="Drift direction" icon={<CompassIcon className="h-4 w-4" />} />
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 rounded-full border border-white/10">
              <span
                className="absolute left-1/2 top-1/2 h-6 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full bg-tide-500"
                style={{ transform: 'translate(-50%,-100%) rotate(48deg)', transformOrigin: 'bottom center' }} />
              
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tide-500" />
              <span className="absolute inset-x-0 -top-4 text-center font-mono text-[9px] text-ink-600">N</span>
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-white">{driftConditions.driftDirection}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                Wind drift factor {driftConditions.driftFactorPct}%
              </p>
            </div>
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Estimated release" icon={<GaugeIcon className="h-4 w-4" />} />
          <p className="mt-4 text-sm font-semibold text-white">{driftConditions.releaseWindow}</p>
          <p className="mt-1 font-mono text-xs text-ink-400">
            {driftConditions.ensembleMembers}-member ensemble
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel flush>
          <div className="border-b border-white/[0.06] px-5 py-4">
            <PanelHeader
              title="Backtrack simulation"
              subtitle={`${frame.label} · ${formatTime(frame.time)}`} />
            
          </div>
          <OceanMap
            className="h-[380px] rounded-none border-0 xl:h-[460px]"
            spills={[{ ...primarySpill, coord: frame.coord }]}
            vessels={nearby}
            origin={{ coord: primarySpill.originCoord, label: 'Estimated release' }}
            driftPath={{ coords: driftCoords }}
            selectedId={primarySpill.id}
            legendExtra={[{ label: 'Reverse drift trajectory', color: '#f59e0b' }]} />
          

          {/* Timeline slider */}
          <div className="border-t border-white/[0.06] px-5 py-5">
            <label htmlFor="drift-slider" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-600">
              Backtrack timeline
            </label>
            <input
              id="drift-slider"
              type="range"
              min={0}
              max={driftFrames.length - 1}
              step={1}
              value={frameIndex}
              onChange={(e) => setFrameIndex(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-tide-500" />
            
            <ol className="mt-3 flex justify-between gap-2">
              {driftFrames.map((f, i) =>
              <li key={f.id} className="flex-1 text-center">
                  <button
                  type="button"
                  onClick={() => setFrameIndex(i)}
                  aria-current={i === frameIndex}
                  className={
                  'w-full rounded-lg px-1 py-1.5 text-[10px] font-semibold leading-tight transition-colors duration-150 ease-out ' + (
                  i === frameIndex ?
                  'bg-tide-500/15 text-tide-400' :
                  'text-ink-500 hover:bg-white/[0.05] hover:text-ink-300')
                  }>
                  
                    {f.offsetHours === 0 ? 'Detection' : `${Math.abs(f.offsetHours)}h back`}
                  </button>
                </li>
              )}
            </ol>
          </div>
        </Panel>

        <Panel className="flex flex-col">
          <PanelHeader title="Frame detail" subtitle={frame.label} />
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
            <KeyValue label="Timestamp" value={formatDate(frame.time)} />
            <KeyValue label="Time (UTC)" value={formatTime(frame.time)} mono />
            <div className="col-span-2">
              <KeyValue label="Slick centroid" value={formatCoord(frame.coord)} mono />
            </div>
            <KeyValue label="Displacement" value={`${displacement.toFixed(1)} km`} mono />
            <KeyValue
              label="Offset"
              value={frame.offsetHours === 0 ? 'Detection time' : `${Math.abs(frame.offsetHours)} h earlier`} />
            
          </dl>
          <p className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-xs leading-relaxed text-ink-300">
            {frame.note}
          </p>

          <div className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-4">
            {[
            { label: 'Oil movement direction', value: driftConditions.driftDirection },
            { label: 'Wind speed', value: `${driftConditions.windSpeedKt} kn` },
            { label: 'Current speed', value: `${driftConditions.currentSpeedKt} kn` },
            { label: 'Estimated release time', value: '22:35 UTC · 03 Sept' }].
            map((r) =>
            <div key={r.label} className="flex items-baseline justify-between gap-3">
                <p className="text-xs text-ink-400">{r.label}</p>
                <p className="font-mono text-xs font-semibold text-ink-100">{r.value}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-signal-med/25 bg-signal-med/[0.06] px-3.5 py-3">
            <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-signal-med" />
            <p className="text-[11px] leading-relaxed text-ink-300">
              Ensemble spread converges within a 1.9 km radius — sufficient for AIS correlation.
            </p>
          </div>
        </Panel>
      </div>
    </div>);

}