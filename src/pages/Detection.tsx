import React, { useState } from 'react';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  LoaderCircleIcon,
  PlayIcon,
  UploadIcon,
  ZoomInIcon,
  ZoomOutIcon } from
'lucide-react';
import { assets } from '../data/assets';
import { satelliteImages } from '../data/imagery';
import { primarySpill } from '../data/spills';
import { PipelineFlow, fullPipeline } from '../components/PipelineFlow';
import { Chip, RiskBadge, StatusBadge } from '../components/ui/Badge';
import { Button, ButtonLink, IconButton } from '../components/ui/Button';
import { Meter, ScoreRing } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { KeyValue, Panel, PanelHeader } from '../components/ui/Panel';
import { formatCoord, formatDate, formatTime } from '../utils/format';

type RunState = 'idle' | 'running' | 'done';

const analysed = satelliteImages.filter((i) => i.status === 'Analyzed');

export function Detection() {
  const [scene, setScene] = useState(analysed[0]);
  const [overlay, setOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [compare, setCompare] = useState(60);
  const [showCompare, setShowCompare] = useState(false);
  const [run, setRun] = useState<RunState>('done');
  const [stage, setStage] = useState(fullPipeline.length - 1);

  const startRun = () => {
    setRun('running');
    setOverlay(false);
    setStage(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setStage(i);
      if (i >= 4) {
        window.clearInterval(timer);
        setRun('done');
        setOverlay(true);
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detection console"
        title="AI Oil Spill Detection"
        subtitle="Inspect a Sentinel-1 scene, run the segmentation model and hand a positive detection to vessel correlation."
        actions={
        <>
            <Button variant="secondary">
              <UploadIcon className="h-4 w-4" />
              Upload satellite image
            </Button>
            <Button onClick={startRun} disabled={run === 'running'}>
              {run === 'running' ?
            <>
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  Running inference…
                </> :

            <>
                  <PlayIcon className="h-4 w-4" />
                  Run AI detection
                </>
            }
            </Button>
          </>
        } />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* SAR viewer */}
        <Panel flush className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <PanelHeader
              title="Satellite SAR image viewer"
              subtitle={`${scene.satellite} · ${scene.polarization} · ${scene.resolutionM} m/px`}
              icon={<ImageIcon className="h-4 w-4" />} />
            
            <div className="flex items-center gap-1.5">
              <IconButton label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}>
                <ZoomOutIcon className="h-4 w-4" />
              </IconButton>
              <IconButton label="Zoom in" onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}>
                <ZoomInIcon className="h-4 w-4" />
              </IconButton>
              <IconButton
                label={overlay ? 'Hide detection overlay' : 'Show detection overlay'}
                onClick={() => setOverlay((o) => !o)}
                className={overlay ? 'border-tide-500/40 text-tide-500' : undefined}>
                
                {overlay ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
              </IconButton>
            </div>
          </div>

          <div className="relative isolate m-3 overflow-hidden rounded-xl border border-white/[0.07] bg-abyss-950">
            <div
              className="relative aspect-[4/3] w-full origin-center transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}>
              
              <img
                src={showCompare ? assets.sarClean : assets.sarSpill}
                alt={`Sentinel-1 SAR scene ${scene.id}`}
                className="absolute inset-0 h-full w-full object-cover" />
              
              {showCompare ?
              <div
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-tide-500"
                style={{ width: `${compare}%` }}>
                
                  <img
                  src={assets.sarSpill}
                  alt="Scene after detection window"
                  className="absolute inset-y-0 left-0 h-full object-cover"
                  style={{ width: `${100 / compare * 100}%`, maxWidth: 'none' }} />
                
                </div> :
              null}

              {/* detection overlay */}
              {overlay && run === 'done' ?
              <svg
                viewBox="0 0 100 75"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true">
                
                  <path
                  d="M14,14 C22,10 30,18 36,24 C43,31 52,34 60,40 C66,44 70,50 64,54 C56,59 44,54 36,47 C28,40 18,34 13,26 C10,21 10,16 14,14 Z"
                  fill="rgba(251,77,106,0.16)"
                  stroke="#fb4d6a"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="4 3"
                  className="animate-dash" />
                
                </svg> :
              null}

              {run === 'running' ?
              <div className="absolute inset-0 overflow-hidden bg-abyss-950/40">
                  <div className="animate-sweep h-20 w-full bg-gradient-to-b from-transparent via-tide-500/25 to-transparent" />
                </div> :
              null}
            </div>

            {overlay && run === 'done' ?
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-signal-high/30 bg-abyss-950/85 px-2.5 py-1.5 backdrop-blur-md">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-signal-high">
                  Slick polygon · 12.5 km²
                </p>
              </div> :
            null}
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/10 bg-abyss-950/80 px-2.5 py-1 font-mono text-[10px] font-semibold text-ink-400 backdrop-blur-md">
              ×{zoom.toFixed(2)} · {scene.id}
            </div>
          </div>

          <div className="border-t border-white/[0.06] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Chip active={showCompare} onClick={() => setShowCompare((c) => !c)}>
                  Compare before / after
                </Chip>
                {showCompare ?
                <label className="flex items-center gap-2 text-[11px] font-medium text-ink-400">
                    Slider
                    <input
                    type="range"
                    min={5}
                    max={95}
                    value={compare}
                    onChange={(e) => setCompare(Number(e.target.value))}
                    aria-label="Before and after comparison position"
                    className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-white/15 accent-tide-500" />
                  
                  </label> :
                null}
              </div>
              <p className="font-mono text-[11px] text-ink-500">
                Captured {formatDate(scene.captureDate)} · {formatTime(scene.captureDate)}
              </p>
            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-600">
              Select image from dataset
            </p>
            <ul className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
              {satelliteImages.slice(0, 6).map((img) =>
              <li key={img.id}>
                  <button
                  type="button"
                  onClick={() => setScene(img)}
                  aria-pressed={scene.id === img.id}
                  className={
                  'group relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-[border-color] duration-150 ease-out ' + (
                  scene.id === img.id ?
                  'border-tide-500' :
                  'border-white/10 hover:border-white/30')
                  }>
                  
                    <img src={img.thumbnail} alt={img.id} className="h-full w-full object-cover" />
                    {img.spillDetected ?
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-signal-high ring-1 ring-abyss-950" /> :
                  null}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </Panel>

        {/* Results */}
        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader
              title="AI detection results"
              subtitle={run === 'running' ? 'Inference in progress' : 'Inference complete'}
              action={<StatusBadge status={run === 'running' ? 'Processing' : 'Analyzed'} />} />
            

            <div className="mt-5 flex items-center gap-5">
              <ScoreRing
                value={run === 'running' ? 0 : primarySpill.confidence}
                label="Confidence"
                color="#fb4d6a" />
              
              <div className="min-w-0 flex-1 space-y-3.5">
                <div className="flex items-center gap-2 rounded-xl border border-signal-high/25 bg-signal-high/[0.07] px-3 py-2.5">
                  <CheckCircle2Icon className="h-4 w-4 shrink-0 text-signal-high" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-500">
                      Oil spill detected
                    </p>
                    <p className="text-sm font-bold text-signal-high">
                      {run === 'running' ? '—' : 'YES'}
                    </p>
                  </div>
                </div>
                <RiskBadge risk={primarySpill.risk} />
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/[0.06] pt-4">
              <KeyValue label="Estimated area" value={`${primarySpill.areaKm2} km²`} mono />
              <KeyValue label="Spill ID" value={primarySpill.id} mono />
              <div className="col-span-2">
                <KeyValue label="Coordinates" value={formatCoord(primarySpill.coord)} mono />
              </div>
              <KeyValue label="Detection time" value={formatDate(primarySpill.detectedAt)} />
              <KeyValue label="Capture" value={formatTime(primarySpill.detectedAt)} mono />
            </dl>

            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
              <Meter label="Slick / look-alike separation" value={88} color="#22d3ee" />
              <Meter label="Edge sharpness" value={74} color="#22d3ee" />
              <Meter label="Wind-field plausibility" value={81} color="#22d3ee" />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <ButtonLink to="/app/correlation" className="flex-1">
                Start vessel analysis
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink to="/app/history" variant="secondary" className="flex-1">
                View detection details
              </ButtonLink>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Processing stages"
              subtitle={run === 'running' ? 'Streaming stage updates' : 'Last run · 4m 12s'} />
            
            <PipelineFlow
              className="mt-5"
              orientation="vertical"
              steps={fullPipeline.slice(0, 4)}
              activeIndex={Math.min(stage, 3)} />
            
          </Panel>
        </div>
      </div>
    </div>);

}