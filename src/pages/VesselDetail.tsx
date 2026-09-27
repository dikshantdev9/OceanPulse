import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FileTextIcon, ShipIcon, TriangleAlertIcon } from 'lucide-react';
import { primarySpill } from '../data/spills';
import { suspects, vesselById, vesselTimeline } from '../data/vessels';
import { driftCoords } from '../data/zones';
import { OceanMap } from '../components/map/OceanMap';
import { Badge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Meter, ScoreRing } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { KeyValue, Panel, PanelHeader } from '../components/ui/Panel';
import { EmptyState } from '../components/ui/States';
import { formatCoord, formatNumber, formatTime } from '../utils/format';

const toneStyles = {
  neutral: 'bg-white/[0.08] text-ink-300 ring-white/10',
  warn: 'bg-signal-med/15 text-signal-med ring-signal-med/25',
  danger: 'bg-signal-high/15 text-signal-high ring-signal-high/25',
  ok: 'bg-signal-low/15 text-signal-low ring-signal-low/25'
} as const;

export function VesselDetail() {
  const { vesselId } = useParams();
  const vessel = vesselById(vesselId ?? '');
  const suspect = suspects.find((s) => s.vesselId === vesselId);

  if (!vessel) {
    return (
      <Panel>
        <EmptyState
          title="Vessel not found"
          description="This MMSI is not in the current AIS snapshot. Return to tracking to pick a vessel in range."
          icon={<ShipIcon className="h-5 w-5" />}
          action={
          <ButtonLink to="/app/ais" variant="secondary" size="sm">
              Back to AIS tracking
            </ButtonLink>
          } />
        
      </Panel>);

  }

  const scores = suspect?.scores ?? {
    distance: 42,
    timeCorrelation: 38,
    aisGapSuspicion: vessel.aisGap ? 70 : 20,
    vesselTypeRisk: vessel.type.includes('Tanker') ? 80 : 50
  };
  const final = suspect?.confidence ?? 41;
  const priority = final >= 75 ? 'HIGH PRIORITY INVESTIGATION' : final >= 50 ? 'MONITOR' : 'LOW PRIORITY';

  return (
    <div className="space-y-6">
      <Link
        to="/app/correlation"
        className="inline-flex items-center gap-2 text-xs font-semibold text-ink-400 transition-colors duration-150 ease-out hover:text-ink-100">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to correlation analysis
      </Link>

      <PageHeader
        eyebrow={suspect ? `Suspect #${suspect.rank} · ${primarySpill.id}` : 'AIS record'}
        title={vessel.name}
        subtitle={`${vessel.type} · MMSI ${vessel.mmsi} · ${vessel.imo}`}
        actions={
        <>
            {vessel.aisGap ?
          <Badge className="bg-signal-high/10 text-signal-high ring-signal-high/25" dot="bg-signal-high">
                AIS gap {vessel.aisGapMinutes} min
              </Badge> :
          null}
            <ButtonLink to="/app/reports">
              <FileTextIcon className="h-4 w-4" />
              Add to report
            </ButtonLink>
          </>
        } />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <Panel>
          <PanelHeader title="Vessel information" icon={<ShipIcon className="h-4 w-4" />} />
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
            <KeyValue label="Vessel name" value={vessel.name} />
            <KeyValue label="Vessel type" value={vessel.type} />
            <KeyValue label="MMSI" value={vessel.mmsi} mono />
            <KeyValue label="IMO" value={vessel.imo.replace('IMO ', '')} mono />
            <KeyValue label="Flag country" value={vessel.flag} />
            <KeyValue label="Destination" value={vessel.destination} />
            <KeyValue label="Length" value={`${vessel.lengthM} m`} mono />
            <KeyValue label="Gross tonnage" value={formatNumber(vessel.grossTonnage)} mono />
            <div className="col-span-2">
              <KeyValue label="Current position" value={formatCoord(vessel.coord)} mono />
            </div>
            <KeyValue label="Speed" value={`${vessel.speedKnots.toFixed(1)} kn`} mono />
            <KeyValue label="Heading" value={`${vessel.headingLabel} · ${vessel.headingDeg}°`} />
          </dl>
        </Panel>

        <Panel flush>
          <div className="border-b border-white/[0.06] px-5 py-4">
            <PanelHeader
              title="AIS track visualisation"
              subtitle="Reported positions, transponder gap and estimated spill origin" />
            
          </div>
          <OceanMap
            className="h-[340px] rounded-none border-0 xl:h-[420px]"
            spills={[primarySpill]}
            vessels={[vessel]}
            origin={{ coord: primarySpill.originCoord, label: 'Estimated origin' }}
            driftPath={{ coords: driftCoords }}
            selectedId={vessel.id}
            legendExtra={[{ label: 'Dashed = AIS signal gap', color: '#fb4d6a' }]} />
          
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader title="Movement timeline" subtitle="03 Sept 2026 · UTC" />
          <ol className="mt-5">
            {vesselTimeline.map((e, i) =>
            <li key={e.time + e.title} className="relative flex gap-4 pb-5 last:pb-0">
                {i < vesselTimeline.length - 1 ?
              <span className="absolute left-[27px] top-8 h-full w-px bg-white/[0.08]" /> :
              null}
                <span
                className={
                'relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl font-mono text-[11px] font-bold ring-1 ring-inset ' +
                toneStyles[e.tone]
                }>
                
                  {e.time}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-[13px] font-semibold text-ink-100">{e.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">{e.detail}</p>
                </div>
              </li>
            )}
          </ol>
        </Panel>

        <Panel className="flex flex-col">
          <PanelHeader
            title="Evidence score"
            subtitle="Weighted factors from the correlation engine"
            icon={<TriangleAlertIcon className="h-4 w-4" />} />
          
          <div className="mt-5 flex items-center gap-6">
            <ScoreRing value={final} label="Final suspicion" color={final >= 75 ? '#fb4d6a' : '#f59e0b'} />
            <div className="min-w-0 flex-1 space-y-3.5">
              <Meter label="Distance score" value={scores.distance} color="#fb4d6a" />
              <Meter label="Time correlation" value={scores.timeCorrelation} color="#f59e0b" />
              <Meter label="AIS gap suspicion" value={scores.aisGapSuspicion} color="#fb4d6a" />
              <Meter label="Vessel type risk" value={scores.vesselTypeRisk} color="#22d3ee" />
            </div>
          </div>

          <div
            className={
            'mt-6 flex items-center gap-3 rounded-xl border px-4 py-3.5 ' + (
            final >= 75 ?
            'border-signal-high/30 bg-signal-high/[0.08]' :
            'border-signal-med/25 bg-signal-med/[0.06]')
            }
            role="status">
            
            <TriangleAlertIcon
              className={'h-5 w-5 shrink-0 ' + (final >= 75 ? 'text-signal-high' : 'text-signal-med')} />
            
            <div>
              <p
                className={
                'text-sm font-bold tracking-tight ' + (
                final >= 75 ? 'text-signal-high' : 'text-signal-med')
                }>
                
                {priority}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-400">
                {suspect ?
                `${suspect.distanceKm} km from origin · ${Math.floor(
                  suspect.timeDiffMinutes / 60
                )}h ${suspect.timeDiffMinutes % 60}m offset · last report ${formatTime(
                  vessel.lastSeen
                )}` :
                'Not currently ranked against an active detection.'}
              </p>
            </div>
          </div>

          <ButtonLink to="/app/drift" variant="secondary" className="mt-6">
            Review drift backtracking
          </ButtonLink>
        </Panel>
      </div>
    </div>);

}