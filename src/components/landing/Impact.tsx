import React from 'react';
import { BarChart3Icon, GlobeIcon, ShipIcon, WavesIcon } from 'lucide-react';

const cards = [
{
  title: 'Faster oil spill detection',
  body: 'Automated inference on every Sentinel-1 pass cuts detection from days of manual review to under an hour.',
  icon: WavesIcon,
  stat: '38 min median alert'
},
{
  title: 'Vessel investigation',
  body: 'Drift backtracking plus AIS gap analysis produces a defensible shortlist of candidate vessels.',
  icon: ShipIcon,
  stat: '4 suspects ranked per spill'
},
{
  title: 'Environmental protection',
  body: 'Earlier containment decisions mean less oil reaching reefs, mangroves and fishing grounds.',
  icon: GlobeIcon,
  stat: '186 km² slick mapped in 2026'
},
{
  title: 'Data-driven decisions',
  body: 'Regional analytics show where enforcement patrols and future coverage should be prioritised.',
  icon: BarChart3Icon,
  stat: '5 regions under continuous watch'
}];


export function Impact() {
  return (
    <section id="impact" className="border-b border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tide-500">Impact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
            Why Ocean Guard AI?
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) =>
          <article
            key={c.title}
            className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-abyss-850/60 p-6 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-1 hover:border-tide-500/30">
            
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tide-500/10 text-tide-500 ring-1 ring-inset ring-tide-500/20">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold leading-tight text-white">{c.title}</h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-400">{c.body}</p>
              <p className="mt-auto pt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-tide-500">
                {c.stat}
              </p>
            </article>
          )}
        </div>
      </div>
    </section>);

}