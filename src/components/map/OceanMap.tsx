import React, { useState } from 'react';
import {
  LayersIcon,
  LocateFixedIcon,
  MinusIcon,
  PlusIcon,
  SatelliteIcon,
  MoonIcon } from
'lucide-react';
import type { Coordinate, Spill, Vessel } from '../../types';
import { assets } from '../../data/assets';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { MapLegend } from './MapLegend';
import { defaultBounds, polyline, project, type Bounds } from './projection';

export interface ScanZone {
  id: string;
  center: Coordinate;
  widthPct: number;
  heightPct: number;
  label: string;
}

export interface DriftPath {
  coords: Coordinate[];
  label?: string;
}

interface OceanMapProps {
  bounds?: Bounds;
  spills?: Spill[];
  vessels?: Vessel[];
  scanZones?: ScanZone[];
  origin?: {coord: Coordinate;label: string;};
  driftPath?: DriftPath;
  showVesselTracks?: boolean;
  selectedId?: string | null;
  onSelectSpill?: (spill: Spill) => void;
  onSelectVessel?: (vessel: Vessel) => void;
  className?: string;
  showLegend?: boolean;
  showControls?: boolean;
  overlay?: React.ReactNode;
  sweep?: boolean;
  legendExtra?: {label: string;color: string;}[];
}

export function OceanMap({
  bounds = defaultBounds,
  spills = [],
  vessels = [],
  scanZones = [],
  origin,
  driftPath,
  showVesselTracks = true,
  selectedId,
  onSelectSpill,
  onSelectVessel,
  className,
  showLegend = true,
  showControls = true,
  overlay,
  sweep = true,
  legendExtra
}: OceanMapProps) {
  const { resolvedTheme } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [satellite, setSatellite] = useState(false);
  const [layers, setLayers] = useState({ spills: true, vessels: true, zones: true, tracks: true });
  const [layerMenu, setLayerMenu] = useState(false);

  const isLight = resolvedTheme === 'light';

  const toggleLayer = (key: keyof typeof layers) =>
  setLayers((l) => ({ ...l, [key]: !l[key] }));

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-2xl border border-white/[0.07] bg-abyss-950',
        className
      )}
      role="application"
      aria-label="Interactive ocean monitoring map">
      
      {/* Ocean base */}
      <div
        className="absolute inset-0"
        style={{
          background: satellite ?
          (isLight ? '#334155' : '#0a1120') :
          isLight ?
          'radial-gradient(120% 100% at 20% 0%, #cbe7f8 0%, #e0f2fe 45%, #f1f8fc 100%)' :
          'radial-gradient(120% 100% at 20% 0%, #0d2743 0%, #071324 45%, #04070f 100%)'
        }} />
      
      {satellite ?
      <div
        className="absolute inset-0 opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: `url(${assets.sarTile})`, backgroundSize: '380px 380px' }}
        aria-hidden="true" /> :

      null}

      <div
        className="absolute inset-0 origin-center transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoom})` }}>
        
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true">
          
          {/* graticule */}
          {Array.from({ length: 9 }).map((_, i) =>
          <line
            key={`v${i}`}
            x1={(i + 1) * 10}
            y1={0}
            x2={(i + 1) * 10}
            y2={100}
            stroke={isLight ? 'rgba(2,132,199,0.14)' : 'rgba(99,121,155,0.13)'}
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke" />

          )}
          {Array.from({ length: 9 }).map((_, i) =>
          <line
            key={`h${i}`}
            x1={0}
            y1={(i + 1) * 10}
            x2={100}
            y2={(i + 1) * 10}
            stroke={isLight ? 'rgba(2,132,199,0.14)' : 'rgba(99,121,155,0.13)'}
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke" />

          )}

          {/* stylised coastline / landmass to the east */}
          <path
            d="M100,0 L100,100 L84,100 L80,88 L83,74 L78,62 L82,48 L76,36 L80,22 L74,10 L78,0 Z"
            fill={
              satellite
                ? 'rgba(20,38,62,0.92)'
                : isLight
                ? 'rgba(226,232,240,0.95)'
                : 'rgba(11,22,38,0.95)'
            }
            stroke={isLight ? 'rgba(2,132,199,0.4)' : 'rgba(34,211,238,0.28)'}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke" />
          
          <path
            d="M40,100 L44,92 L38,84 L30,86 L24,96 L26,100 Z"
            fill={
              satellite
                ? 'rgba(20,38,62,0.8)'
                : isLight
                ? 'rgba(226,232,240,0.85)'
                : 'rgba(11,22,38,0.85)'
            }
            stroke={isLight ? 'rgba(2,132,199,0.3)' : 'rgba(34,211,238,0.18)'}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke" />
          

          {/* satellite coverage zones */}
          {layers.zones &&
          scanZones.map((z) => {
            const p = project(z.center, bounds);
            return (
              <g key={z.id}>
                  <rect
                  x={p.x - z.widthPct / 2}
                  y={p.y - z.heightPct / 2}
                  width={z.widthPct}
                  height={z.heightPct}
                  rx={1.5}
                  fill="rgba(167,139,250,0.09)"
                  stroke="rgba(167,139,250,0.5)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke" />
                
                </g>);

          })}

          {/* drift path */}
          {driftPath ?
          <polyline
            points={polyline(driftPath.coords, bounds)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="animate-dash" /> :

          null}

          {/* vessel tracks */}
          {showVesselTracks &&
          layers.tracks &&
          layers.vessels &&
          vessels.map((v) =>
          <polyline
            key={`t-${v.id}`}
            points={polyline(v.track, bounds)}
            fill="none"
            stroke={selectedId === v.id ? '#22d3ee' : 'rgba(34,211,238,0.35)'}
            strokeWidth={selectedId === v.id ? 2 : 1.25}
            strokeDasharray={v.aisGap ? '3 4' : undefined}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke" />

          )}
        </svg>

        {/* Spill markers */}
        {layers.spills &&
        spills.map((s) => {
          const p = project(s.coord, bounds);
          const color = s.classification === 'confirmed' ? '#fb4d6a' : '#f59e0b';
          const active = selectedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSpill?.(s)}
              aria-label={`Oil spill ${s.id}, ${s.location}, risk ${s.risk}`}
              aria-pressed={active}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 transition-transform duration-150 ease-out hover:scale-110"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              
                <span
                className="absolute inset-0 m-auto h-9 w-9 animate-pulsering rounded-full"
                style={{ border: `1px solid ${color}`, animationDelay: `${p.x % 5 * 0.3}s` }} />
              
                <span
                className={cn(
                  'relative block h-3.5 w-3.5 rounded-full ring-2 ring-abyss-950 transition-transform duration-150 ease-out',
                  active && 'scale-125'
                )}
                style={{ backgroundColor: color, boxShadow: `0 0 16px -2px ${color}` }} />
              
                <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-abyss-950/90 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-100 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100',
                  active && 'opacity-100'
                )}>
                
                  {s.id}
                </span>
              </button>);

        })}

        {/* Estimated origin */}
        {origin ?
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${project(origin.coord, bounds).x}%`,
            top: `${project(origin.coord, bounds).y}%`
          }}>
          
            <div className="relative flex h-6 w-6 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-dashed border-signal-med/70" />
              <span className="h-2 w-2 rotate-45 bg-signal-med" />
            </div>
            <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-signal-med/15 px-1.5 py-0.5 text-[10px] font-semibold text-signal-med">
              {origin.label}
            </span>
          </div> :
        null}

        {/* Vessels */}
        {layers.vessels &&
        vessels.map((v) => {
          const p = project(v.coord, bounds);
          const active = selectedId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVessel?.(v)}
              aria-label={`Vessel ${v.name}, ${v.type}, ${v.speedKnots} knots`}
              aria-pressed={active}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2 transition-transform duration-150 ease-out hover:scale-110"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              
                <svg
                viewBox="0 0 10 10"
                className={cn('h-3.5 w-3.5 drop-shadow', active ? 'text-white' : 'text-tide-500')}
                style={{ transform: `rotate(${v.headingDeg}deg)` }}
                aria-hidden="true">
                
                  <polygon points="5,0 9,10 5,7.4 1,10" fill="currentColor" />
                </svg>
                {v.aisGap ?
              <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-signal-high ring-1 ring-abyss-950" /> :
              null}
                <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-abyss-950/90 px-1.5 py-0.5 text-[10px] font-semibold text-ink-100 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100',
                  active && 'opacity-100'
                )}>
                
                  {v.name}
                </span>
              </button>);

        })}
      </div>

      {/* radar sweep */}
      {sweep ?
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="animate-sweep h-24 w-full bg-gradient-to-b from-transparent via-tide-500/[0.07] to-transparent" />
        </div> :
      null}

      {/* Controls */}
      {showControls ?
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-abyss-950/85 backdrop-blur-md">
            <MapControl label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(2)))}>
              <PlusIcon className="h-4 w-4" />
            </MapControl>
            <MapControl label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}>
              <MinusIcon className="h-4 w-4" />
            </MapControl>
            <MapControl label="Reset view" onClick={() => setZoom(1)}>
              <LocateFixedIcon className="h-4 w-4" />
            </MapControl>
          </div>
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-abyss-950/85 backdrop-blur-md">
            <MapControl
            label={satellite ? 'Switch to dark mode' : 'Switch to satellite view'}
            active={satellite}
            onClick={() => setSatellite((s) => !s)}>
            
              {satellite ? <MoonIcon className="h-4 w-4" /> : <SatelliteIcon className="h-4 w-4" />}
            </MapControl>
            <MapControl label="Layer selection" active={layerMenu} onClick={() => setLayerMenu((m) => !m)}>
              <LayersIcon className="h-4 w-4" />
            </MapControl>
          </div>
          {layerMenu ?
        <div className="w-44 rounded-xl border border-white/10 bg-abyss-950/92 p-2.5 backdrop-blur-md">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">Layers</p>
              <ul className="space-y-1">
                {(
            [
            ['spills', 'Oil spills'],
            ['vessels', 'AIS vessels'],
            ['tracks', 'Vessel tracks'],
            ['zones', 'Satellite coverage']] as
            const).
            map(([key, label]) =>
            <li key={key}>
                    <button
                type="button"
                onClick={() => toggleLayer(key)}
                aria-pressed={layers[key]}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium text-ink-300 transition-colors duration-150 ease-out hover:bg-white/[0.06]">
                
                      {label}
                      <span
                  className={cn(
                    'h-3.5 w-3.5 rounded border',
                    layers[key] ? 'border-tide-500 bg-tide-500/70' : 'border-white/20'
                  )} />
                
                    </button>
                  </li>
            )}
              </ul>
            </div> :
        null}
        </div> :
      null}

      {/* Zoom readout */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-lg border border-white/10 bg-abyss-950/80 px-2.5 py-1 font-mono text-[10px] font-semibold tabular text-ink-400 backdrop-blur-md">
        {satellite ? 'SAR COMPOSITE' : isLight ? 'NAUTICAL BATHYMETRY' : 'DARK BATHYMETRY'} · ×{zoom.toFixed(1)}
      </div>

      {showLegend ? <MapLegend extra={legendExtra} /> : null}
      {overlay}
    </div>);

}

function MapControl({
  label,
  onClick,
  children,
  active





}: {label: string;onClick: () => void;children: React.ReactNode;active?: boolean;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center border-b border-white/[0.06] transition-colors duration-150 ease-out last:border-b-0 hover:bg-tide-500/15 hover:text-tide-400',
        active ? 'bg-tide-500/15 text-tide-400' : 'text-ink-300'
      )}>
      
      {children}
    </button>);

}