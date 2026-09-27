import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon, RadarIcon } from 'lucide-react';
import { assets } from '../../data/assets';
import { spills } from '../../data/spills';
import { vessels } from '../../data/vessels';
import { scanZones } from '../../data/zones';
import { OceanMap } from '../map/OceanMap';
import { ButtonLink } from '../ui/Button';

const metrics = [
{ value: '250,000', unit: 'km²', label: 'Ocean monitored' },
{ value: '92', unit: '%', label: 'Detection confidence' },
{ value: '38', unit: 'min', label: 'Median alert latency' }];


export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <img
        src={assets.heroOrbit}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-45" />
      
      <div className="absolute inset-0 bg-gradient-to-b from-abyss-950/70 via-abyss-950/85 to-abyss-950" />
      <div className="grid-field absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
          
          <p className="inline-flex items-center gap-2 rounded-full border border-tide-500/25 bg-tide-500/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-tide-400">
            <RadarIcon className="h-3.5 w-3.5" />
            Maritime intelligence platform
          </p>
          <h1 className="mt-6 text-[34px] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[56px]">
            Protecting our oceans with{' '}
            <span className="text-tide-500">AI and satellite intelligence</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
            Detect oil spills from satellite imagery and identify potentially responsible vessels
            using AIS data correlation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/app" size="lg">
              Explore dashboard
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink to="/app/detection" variant="secondary" size="lg">
              <PlayCircleIcon className="h-4 w-4" />
              View demo
            </ButtonLink>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-6">
            {metrics.map((m) =>
            <div key={m.label}>
                <dd className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-semibold tabular text-white sm:text-2xl">
                    {m.value}
                  </span>
                  <span className="text-xs font-medium text-tide-500">{m.unit}</span>
                </dd>
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500">
                  {m.label}
                </dt>
              </div>
            )}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="relative">
          
          <div className="rounded-3xl border border-white/[0.08] bg-abyss-900/60 p-2.5 shadow-panel backdrop-blur-xl">
            <div className="flex items-center justify-between px-2.5 py-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                Live detection feed · Arabian Sea
              </p>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-signal-low">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal-low" />
                SCANNING
              </span>
            </div>
            <OceanMap
              className="h-[300px] sm:h-[380px] lg:h-[460px]"
              spills={spills.slice(0, 3)}
              vessels={vessels.slice(0, 5)}
              scanZones={scanZones}
              selectedId={spills[0].id}
              showControls={false} />
            
          </div>
          <div className="pointer-events-none absolute -bottom-4 left-4 right-4 hidden justify-between gap-3 sm:flex">
            {[
            { k: 'OG-2026-001', v: '12.5 km² · 92%' },
            { k: 'Suspect', v: 'Ocean Voyager · 89%' }].
            map((c) =>
            <div
              key={c.k}
              className="rounded-xl border border-white/[0.08] bg-abyss-850/95 px-3.5 py-2.5 backdrop-blur-md">
              
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-500">
                  {c.k}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-ink-100">{c.v}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>);

}