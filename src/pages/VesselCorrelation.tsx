import React, { useState } from 'react';
import {
  CompassIcon,
  FileTextIcon,
  LoaderCircleIcon,
  MapPinIcon,
  RefreshCwIcon,
  ShipIcon,
  TriangleAlertIcon,
  WavesIcon } from
'lucide-react';
import { primarySpill } from '../data/spills';
import { suspects, vessels } from '../data/vessels';
import { driftCoords } from '../data/zones';
import { OceanMap } from '../components/map/OceanMap';
import { PipelineFlow, type PipelineStep } from '../components/PipelineFlow';
import { SuspectTable } from '../components/vessel/SuspectTable';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { KeyValue, Panel, PanelHeader } from '../components/ui/Panel';
import { formatCoord, formatDate, formatTime } from '../utils/format';

const correlationSteps: PipelineStep[] = [
{
  id: 'detect',
  label: 'Oil spill detection',
  caption: 'Slick polygon confirmed at 92% on the 06:42 UTC pass.',
  icon: <WavesIcon className="h-4 w-4" />
},
{
  id: 'origin',
  label: 'Estimate spill origin',
  caption: 'Centroid and leading edge resolved from the slick geometry.',
  icon: <MapPinIcon className="h-4 w-4" />
},
{
  id: 'drift',
  label: 'Backtrack ocean drift',
  caption: '240-member OpenDrift ensemble run 8 hours in reverse.',
  icon: <CompassIcon className="h-4 w-4" />
},
{
  id: 'tracks',
  label: 'Find nearby vessel tracks',
  caption: '19 AIS targets intersected the release search radius.',
  icon: <ShipIcon className="h-4 w-4" />
},
{
  id: 'ais',
  label: 'Analyze AIS data',
  caption: 'Speed, course changes and transponder gaps scored per vessel.',
  icon: <RefreshCwIcon className="h-4 w-4" />
},
{
  id: 'rank',
  label: 'Rank potential vessels',
  caption: 'Weighted evidence model returns 4 ranked candidates.',
  icon: <TriangleAlertIcon className="h-4 w-4" />
}];


export function VesselCorrelation() {
  const [recomputing, setRecomputing] = useState(false);
  const nearby = vessels.filter((v) => suspects.some((s) => s.vesselId === v.id));

  const recompute = () => {
    setRecomputing(true);
    window.setTimeout(() => setRecomputing(false), 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Correlation · ${primarySpill.id}`}
        title="Potential Responsible Vessel Analysis"
        subtitle="Drift-corrected spill origin matched against AIS tracks inside the estimated release window."
        actions={
        <>
            <Button variant="secondary" onClick={recompute} disabled={recomputing}>
              {recomputing ?
            <>
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  Recomputing…
                </> :

            <>
                  <RefreshCwIcon className="h-4 w-4" />
                  Recompute ranking
                </>
            }
            </Button>
            <ButtonLink to="/app/reports">
              <FileTextIcon className="h-4 w-4" />
              Generate report
            </ButtonLink>
          </>
        } />
      

      {/* Spill summary strip */}
      <Panel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-signal-high/12 text-signal-high ring-1 ring-inset ring-signal-high/25">
              <WavesIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-[15px] font-semibold text-white">{primarySpill.id}</p>
                <RiskBadge risk={primarySpill.risk} />
                <StatusBadge status={primarySpill.status} />
              </div>
              <p className="mt-1 text-sm text-ink-400">{primarySpill.location}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <KeyValue label="Detected" value={formatDate(primarySpill.detectedAt)} />
            <KeyValue label="Area" value={`${primarySpill.areaKm2} km²`} mono />
            <KeyValue label="Confidence" value={`${primarySpill.confidence}%`} mono />
            <KeyValue label="Release window" value="22:20 – 22:50 UTC" mono />
          </dl>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Correlation timeline"
          subtitle="Every stage is reproducible from the stored scene and AIS archive" />
        
        <PipelineFlow className="mt-5" steps={correlationSteps} autoplay={!recomputing} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel flush>
          <div className="border-b border-white/[0.06] px-5 py-4">
            <PanelHeader
              title="Spill origin and candidate routes"
              subtitle="Red slick · amber estimated origin · cyan AIS tracks" />
            
          </div>
          <OceanMap
            className="h-[400px] rounded-none border-0 xl:h-[480px]"
            spills={[primarySpill]}
            vessels={nearby}
            origin={{ coord: primarySpill.originCoord, label: 'Estimated origin' }}
            driftPath={{ coords: driftCoords }}
            selectedId={primarySpill.id}
            legendExtra={[{ label: 'Drift backtrack path', color: '#f59e0b' }]} />
          
        </Panel>

        <Panel>
          <PanelHeader title="Evidence weighting" subtitle="Model weights applied to every candidate" />
          <ul className="mt-5 space-y-4">
            {[
            { label: 'Proximity to estimated origin', weight: '35%', note: '≤ 5 km scores highest' },
            { label: 'Time correlation with release', weight: '30%', note: 'Overlap with 22:20–22:50' },
            { label: 'AIS transponder gap', weight: '20%', note: 'Silence inside search radius' },
            { label: 'Vessel type risk', weight: '15%', note: 'Tankers weighted above cargo' }].
            map((f) =>
            <li key={f.label} className="border-b border-white/[0.05] pb-3.5 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold text-ink-100">{f.label}</p>
                  <span className="font-mono text-xs font-semibold text-tide-400">{f.weight}</span>
                </div>
                <p className="mt-1 text-[11px] text-ink-500">{f.note}</p>
              </li>
            )}
          </ul>
          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-600">
              Search parameters
            </p>
            <dl className="mt-2.5 space-y-1.5 font-mono text-[11px] text-ink-300">
              <div className="flex justify-between">
                <dt>Radius</dt>
                <dd>18 km</dd>
              </div>
              <div className="flex justify-between">
                <dt>Window</dt>
                <dd>±4 h</dd>
              </div>
              <div className="flex justify-between">
                <dt>AIS targets scanned</dt>
                <dd>19</dd>
              </div>
              <div className="flex justify-between">
                <dt>Origin coordinates</dt>
                <dd>{formatCoord(primarySpill.originCoord)}</dd>
              </div>
            </dl>
          </div>
        </Panel>
      </div>

      <Panel flush>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <PanelHeader
            title="Top suspected vessels"
            subtitle={`${suspects.length} candidates ranked · updated ${formatTime(
              primarySpill.detectedAt
            )}`}
            icon={<TriangleAlertIcon className="h-4 w-4" />} />
          
          <p className="text-[11px] text-ink-500">Select a vessel for the full evidence trail</p>
        </div>
        {recomputing ?
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-400">
            <LoaderCircleIcon className="h-4 w-4 animate-spin text-tide-500" />
            Re-scoring 19 AIS candidates…
          </div> :

        <SuspectTable suspects={suspects} />
        }
      </Panel>
    </div>);

}