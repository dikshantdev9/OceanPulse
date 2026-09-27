import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuitIcon, MapPinIcon, SatelliteIcon, ShipIcon, TriangleAlertIcon } from 'lucide-react';

const steps = [
{
  n: '01',
  title: 'Satellite monitoring',
  body: 'Sentinel-1 SAR imagery sweeps ocean surfaces day and night, unaffected by cloud cover.',
  icon: SatelliteIcon
},
{
  n: '02',
  title: 'AI oil spill detection',
  body: 'A segmentation model scores every tile and separates true slicks from look-alikes.',
  icon: BrainCircuitIcon
},
{
  n: '03',
  title: 'Spill location analysis',
  body: 'The system fixes the slick centroid, surface area and exact detection timestamp.',
  icon: MapPinIcon
},
{
  n: '04',
  title: 'AIS vessel correlation',
  body: 'Nearby vessel movement and AIS tracks are replayed against the estimated release window.',
  icon: ShipIcon
},
{
  n: '05',
  title: 'Responsible vessel ranking',
  body: 'Candidates are ranked with weighted confidence scores and an evidence trail per vessel.',
  icon: TriangleAlertIcon
}];


export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tide-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
            From orbit to a named suspect in five stages
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-400">
            Each stage produces auditable evidence, so an investigator can trace a ranking back to
            the pixels and AIS pings that produced it.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) =>
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            className="group relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-abyss-850/60 p-5 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-1 hover:border-tide-500/30">
            
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tide-500/10 text-tide-500 ring-1 ring-inset ring-tide-500/20">
                  <s.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-mono text-xs font-semibold tabular text-ink-600">{s.n}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold leading-tight text-white">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-400">{s.body}</p>
              {i < steps.length - 1 ?
            <span
              aria-hidden="true"
              className="absolute -right-2 top-1/2 hidden h-px w-4 bg-white/10 lg:block" /> :

            null}
            </motion.li>
          )}
        </ol>
      </div>
    </section>);

}