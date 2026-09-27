import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIcon, RadioIcon, ShipIcon, WavesIcon } from 'lucide-react';
import { spills } from '../data/spills';
import { suspects } from '../data/vessels';
import type { Spill, Vessel } from '../types';
import { GoogleLiveMap } from '../components/map/GoogleLiveMap';
import { Chip, RiskBadge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { formatNumber, formatTime } from '../utils/format';
import { getLiveTrackingMode, rankPotentiallyResponsibleVessels, subscribeToLiveVessels } from '../services/liveTrackingService';

export function LiveMonitoring() {
  const [liveVessels, setLiveVessels] = useState<Vessel[]>([]);
  const [selectedSpill, setSelectedSpill] = useState<Spill | null>(spills[0]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showVessels, setShowVessels] = useState(true);
  const [showSpills, setShowSpills] = useState(true);
  const [mapView, setMapView] = useState<'terrain' | 'satellite'>('terrain');
  const [trackingMode, setTrackingMode] = useState(getLiveTrackingMode());

  useEffect(() => {
    const unsubscribe = subscribeToLiveVessels(setLiveVessels, 4000);
    setTrackingMode(getLiveTrackingMode());
    return unsubscribe;
  }, []);

  const activeSpills = spills.filter((spill) => spill.status !== 'Resolved');
  const suspectMap = useMemo(
    () => new Set(rankPotentiallyResponsibleVessels(liveVessels, activeSpills).map(({ vessel }) => vessel.id)),
    [activeSpills, liveVessels]
  );

  const likelyResponsible = useMemo(
    () => rankPotentiallyResponsibleVessels(liveVessels, activeSpills).slice(0, 3),
    [activeSpills, liveVessels]
  );

  const highlightedVesselId = selectedVessel?.id ?? (likelyResponsible[0]?.vessel.id ?? null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live monitoring"
        title="Live Ocean Monitoring"
        subtitle="Real-time vessel tracking and oil spill monitoring powered by satellite intelligence and AIS data."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-amber-300">
              <span className={`h-2 w-2 rounded-full ${trackingMode === 'LIVE' ? 'bg-signal-low' : 'bg-amber-400 animate-pulse'}`} />
              {trackingMode === 'LIVE' ? 'LIVE AIS' : '🟡 DEMO MODE · Simulated Maritime AIS Data'}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>🌊 Ocean Navigation Active</span>
            </div>
            <Chip active={showVessels} onClick={() => setShowVessels((value) => !value)} className="border-0">Vessels ({liveVessels.length})</Chip>
            <Chip active={showSpills} onClick={() => setShowSpills((value) => !value)} className="border-0">Spills ({activeSpills.length})</Chip>
            <Chip active={mapView === 'terrain'} onClick={() => setMapView('terrain')} className="border-0">Map</Chip>
            <Chip active={mapView === 'satellite'} onClick={() => setMapView('satellite')} className="border-0">Satellite</Chip>
          </div>
        }
      />

      <section aria-label="Live monitoring summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Active Vessels" value={formatNumber(liveVessels.length || 2450)} icon={<ShipIcon className="h-4 w-4" />} accent="tide" trend={{ direction: 'up', value: '+118', note: 'AIS targets in range', goodWhen: 'up' }} />
        <StatCard label="Oil Spills Detected" value={String(activeSpills.length || 12)} icon={<WavesIcon className="h-4 w-4" />} accent="med" trend={{ direction: 'up', value: '+3', note: 'new this week', goodWhen: 'down' }} />
        <StatCard label="High Risk Vessels" value={String(Math.max(3, likelyResponsible.length || 3))} icon={<RiskBadge risk="HIGH" className="px-1.5 py-0.5" />} accent="high" emphasis trend={{ direction: 'down', value: '-1', note: 'since yesterday', goodWhen: 'down' }} />
        <StatCard label="Monitoring Area" value="250,000" unit="km²" icon={<ActivityIcon className="h-4 w-4" />} accent="scan" trend={{ direction: 'up', value: '+6.2%', note: 'coverage gain', goodWhen: 'up' }} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
        <Panel flush className="relative overflow-hidden">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-slate-950/70 px-3 py-2 backdrop-blur-md">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">AIS Tracking Active</p>
              <p className="text-[11px] font-medium text-ink-200">Last updated: {formatTime(new Date().toISOString())}</p>
            </div>
          </div>

          <GoogleLiveMap
            className="h-[420px] rounded-none border-0 xl:h-[660px]"
            vessels={liveVessels}
            spills={showSpills ? activeSpills : []}
            selectedVesselId={highlightedVesselId}
            selectedSpillId={selectedSpill?.id ?? null}
            onSelectVessel={(vessel) => {
              setSelectedSpill(null);
              setSelectedVessel(vessel);
            }}
            onSelectSpill={(spill) => {
              setSelectedVessel(null);
              setSelectedSpill(spill);
            }}
            showVessels={showVessels}
            showSpills={showSpills}
            mapView={mapView}
            suspectIds={Array.from(suspectMap)}
          />
        </Panel>

        <div className="flex flex-col gap-4">
          {selectedVessel && (
            <Panel className="border-tide-500/30 bg-tide-500/[0.04]">
              <div className="flex items-center justify-between">
                <PanelHeader
                  title={selectedVessel.name}
                  subtitle={`MMSI: ${selectedVessel.mmsi} · ${selectedVessel.type}`}
                  icon={<ShipIcon className="h-4 w-4 text-tide-400" />}
                />
                <button
                  type="button"
                  onClick={() => setSelectedVessel(null)}
                  className="rounded-lg border border-white/10 px-2 py-0.5 text-xs text-ink-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-white/[0.03] p-2">
                  <span className="text-[10px] uppercase text-ink-500">Speed</span>
                  <p className="font-mono text-sm font-semibold text-ink-100">{selectedVessel.speedKnots.toFixed(1)} kn</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-2">
                  <span className="text-[10px] uppercase text-ink-500">Heading</span>
                  <p className="font-mono text-sm font-semibold text-ink-100">{selectedVessel.headingDeg}° ({selectedVessel.headingLabel})</p>
                </div>
                <div className="col-span-2 rounded-lg bg-white/[0.03] p-2">
                  <span className="text-[10px] uppercase text-ink-500">Ocean Coordinates</span>
                  <p className="font-mono text-xs text-tide-300">
                    {Math.abs(selectedVessel.coord.lat).toFixed(4)}° N, {Math.abs(selectedVessel.coord.lon).toFixed(4)}° E
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-400">🟢 MOVING · Continuous AIS</span>
                <span className="text-ink-400">{selectedVessel.flag}</span>
              </div>
            </Panel>
          )}

          <Panel>
            <PanelHeader title="POTENTIALLY RESPONSIBLE VESSELS" subtitle="Correlation with active oil slick corridor" icon={<RadioIcon className="h-4 w-4" />} />
            <div className="mt-4 space-y-3">
              {likelyResponsible.length > 0 ? likelyResponsible.map(({ vessel, score }) => (
                <button
                  key={vessel.id}
                  type="button"
                  onClick={() => setSelectedVessel(vessel)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${selectedVessel?.id === vessel.id ? 'border-red-400/40 bg-red-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-tide-500/30 hover:bg-tide-500/[0.04]'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <p className="text-[13px] font-semibold text-white">{vessel.name}</p>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-500">{vessel.type} · MMSI {vessel.mmsi}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-signal-high">{score}%</span>
                  </div>
                  <p className="mt-2 text-xs text-ink-400">{vessel.speedKnots.toFixed(1)} knots · {vessel.headingLabel}</p>
                </button>
              )) : (
                <p className="text-sm text-ink-400">No pending vessel correlation alerts.</p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Active detections" subtitle={`${activeSpills.length} slicks under watch`} icon={<WavesIcon className="h-4 w-4" />} />
            <ul className="mt-4 space-y-2">
              {activeSpills.slice(0, 4).map((spill) => (
                <li key={spill.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSpill(spill)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left transition-all ${selectedSpill?.id === spill.id ? 'border-tide-500/40 bg-tide-500/[0.07]' : 'border-white/[0.06] bg-white/[0.02]'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-semibold text-white">{spill.id}</span>
                      <RiskBadge risk={spill.risk} />
                    </div>
                    <p className="mt-1 text-xs text-ink-400">{spill.location}</p>
                    <p className="mt-1.5 font-mono text-[10px] text-ink-500">{spill.areaKm2} km² · {spill.confidence}% · {formatTime(spill.detectedAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Suspected vessel analysis" subtitle="Potentially Responsible Vessel" icon={<ShipIcon className="h-4 w-4" />} />
            <ul className="mt-4 space-y-2">
              {suspects.slice(0, 3).map((suspect) => (
                <li key={suspect.vesselId} className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-white">{suspect.name}</p>
                      <p className="font-mono text-[11px] text-ink-500">{suspect.type}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-signal-high">{suspect.confidence}%</span>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-400">Distance: {suspect.distanceKm} km · AIS gap: {suspect.aisGap ? 'Yes' : 'No'}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
