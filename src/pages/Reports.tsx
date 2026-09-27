import React, { useState } from 'react';
import {
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  LoaderCircleIcon,
  SparklesIcon } from
'lucide-react';
import { assets } from '../data/assets';
import { primarySpill } from '../data/spills';
import { suspects } from '../data/vessels';
import { driftConditions } from '../data/zones';
import { SuspectTable } from '../components/vessel/SuspectTable';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Field';
import { Meter } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { KeyValue, Panel, PanelHeader } from '../components/ui/Panel';
import { confidenceColor, formatCoord, formatDate, formatTime } from '../utils/format';

const sectionDefaults = {
  satelliteImage: true,
  detectionResult: true,
  driftAnalysis: true,
  aisAnalysis: true,
  suspectRanking: true,
  evidenceSummary: true
};

export function Reports() {
  const [sections, setSections] = useState(sectionDefaults);
  const [state, setState] = useState<'idle' | 'generating' | 'ready'>('idle');

  const generate = () => {
    setState('generating');
    window.setTimeout(() => setState('ready'), 1400);
  };

  const included = Object.values(sections).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Investigation report · ${primarySpill.id}`}
        title="Report Generation"
        subtitle="Assemble the detection, drift and AIS evidence into a single investigation package."
        actions={
        <>
            <Button variant="secondary" disabled={state !== 'ready'}>
              <DownloadIcon className="h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={generate} disabled={state === 'generating'}>
              {state === 'generating' ?
            <>
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  Compiling…
                </> :

            <>
                  <FileTextIcon className="h-4 w-4" />
                  Generate investigation report
                </>
            }
            </Button>
          </>
        } />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel className="h-fit">
          <PanelHeader
            title="Report sections"
            subtitle={`${included} of 6 sections included`}
            icon={<SparklesIcon className="h-4 w-4" />} />
          
          <div className="mt-3 divide-y divide-white/[0.05]">
            <Toggle
              label="Satellite image"
              description="Original SAR scene with slick overlay"
              checked={sections.satelliteImage}
              onChange={(v) => setSections((s) => ({ ...s, satelliteImage: v }))} />
            
            <Toggle
              label="Detection result"
              description="Model output, area and confidence"
              checked={sections.detectionResult}
              onChange={(v) => setSections((s) => ({ ...s, detectionResult: v }))} />
            
            <Toggle
              label="Ocean drift analysis"
              description="Backtrack trajectory and release window"
              checked={sections.driftAnalysis}
              onChange={(v) => setSections((s) => ({ ...s, driftAnalysis: v }))} />
            
            <Toggle
              label="AIS vessel analysis"
              description="Candidate tracks and transponder gaps"
              checked={sections.aisAnalysis}
              onChange={(v) => setSections((s) => ({ ...s, aisAnalysis: v }))} />
            
            <Toggle
              label="Suspected vessel ranking"
              description="Ranked table with confidence scores"
              checked={sections.suspectRanking}
              onChange={(v) => setSections((s) => ({ ...s, suspectRanking: v }))} />
            
            <Toggle
              label="Evidence summary"
              description="Analyst conclusion and recommendation"
              checked={sections.evidenceSummary}
              onChange={(v) => setSections((s) => ({ ...s, evidenceSummary: v }))} />
            
          </div>

          {state === 'ready' ?
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-signal-low/25 bg-signal-low/[0.07] px-3.5 py-3">
              <CheckIcon className="h-4 w-4 shrink-0 text-signal-low" />
              <p className="text-[11px] leading-relaxed text-ink-300">
                Report OG-2026-001-INV compiled · 14 pages · ready for download.
              </p>
            </div> :
          null}
        </Panel>

        {/* Report preview */}
        <Panel flush>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <PanelHeader title="Preview" subtitle="Investigation package OG-2026-001-INV" />
            <StatusBadge status={state === 'ready' ? 'Analyzed' : 'Processing'} />
          </div>

          <div className="space-y-6 p-5">
            <header className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-tide-500">
                    Oil spill investigation report
                  </p>
                  <h2 className="mt-1.5 font-mono text-xl font-semibold text-white">
                    {primarySpill.id}
                  </h2>
                  <p className="mt-1 text-sm text-ink-400">{primarySpill.location}</p>
                </div>
                <RiskBadge risk={primarySpill.risk} />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <KeyValue label="Detected" value={formatDate(primarySpill.detectedAt)} />
                <KeyValue label="Capture" value={formatTime(primarySpill.detectedAt)} mono />
                <KeyValue label="Area" value={`${primarySpill.areaKm2} km²`} mono />
                <KeyValue label="Confidence" value={`${primarySpill.confidence}%`} mono />
                <div className="col-span-2">
                  <KeyValue label="Spill coordinates" value={formatCoord(primarySpill.coord)} mono />
                </div>
                <div className="col-span-2">
                  <KeyValue label="Satellite" value={`${primarySpill.satellite} · ${primarySpill.polarization}`} />
                </div>
              </dl>
            </header>

            {sections.satelliteImage ?
            <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  1 · Satellite image
                </h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
                  <img
                  src={assets.sarSpill}
                  alt="Sentinel-1 SAR scene with detected slick"
                  className="aspect-[16/7] w-full object-cover" />
                
                </div>
                <p className="mt-2 text-[11px] text-ink-500">
                  Sentinel-1A IW GRDH · VV polarization · 10 m ground range · slick polygon outlined by
                  SAR-UNet v4.2.1.
                </p>
              </section> :
            null}

            {sections.detectionResult ?
            <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  2 · Detection result
                </h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  {[
                { label: 'Oil spill detected', value: 'YES', tone: 'text-signal-high' },
                { label: 'Estimated area', value: `${primarySpill.areaKm2} km²`, tone: 'text-white' },
                { label: 'Model confidence', value: `${primarySpill.confidence}%`, tone: 'text-white' }].
                map((c) =>
                <div key={c.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-600">
                        {c.label}
                      </p>
                      <p className={'mt-1.5 font-mono text-lg font-semibold ' + c.tone}>{c.value}</p>
                    </div>
                )}
                </div>
              </section> :
            null}

            {sections.driftAnalysis ?
            <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  3 · Ocean drift analysis
                </h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:grid-cols-4">
                  <KeyValue label="Wind" value={`${driftConditions.windSpeedKt} kn ${driftConditions.windDirection}`} mono />
                  <KeyValue label="Current" value={`${driftConditions.currentSpeedKt} kn ${driftConditions.currentDirection}`} mono />
                  <KeyValue label="Drift direction" value={driftConditions.driftDirection} mono />
                  <KeyValue label="Release window" value={driftConditions.releaseWindow} />
                </dl>
              </section> :
            null}

            {sections.suspectRanking ?
            <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  4 · Suspected vessel ranking
                </h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
                  <SuspectTable suspects={suspects.slice(0, 3)} />
                </div>
              </section> :
            null}

            {sections.evidenceSummary ?
            <section>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  5 · Evidence summary
                </h3>
                <div className="mt-3 rounded-xl border border-signal-high/25 bg-signal-high/[0.06] p-4">
                  <p className="text-[13px] leading-relaxed text-ink-200">
                    Ocean Voyager (MMSI 123456789) transited within 2.4 km of the drift-corrected
                    release point and stopped transmitting AIS for 100 minutes across the estimated
                    release window. Vessel class and cargo profile are consistent with the detected
                    hydrocarbon signature. Recommendation:{' '}
                    <span className="font-semibold text-signal-high">
                      escalate for port-state inspection.
                    </span>
                  </p>
                  <Meter
                  className="mt-4 max-w-xs"
                  label="Final suspicion score"
                  value={suspects[0].confidence}
                  color={confidenceColor(suspects[0].confidence)} />
                
                </div>
              </section> :
            null}
          </div>
        </Panel>
      </div>
    </div>);

}