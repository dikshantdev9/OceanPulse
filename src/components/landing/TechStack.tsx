import React from 'react';

const groups = [
{
  label: 'Earth observation',
  items: ['Sentinel-1', 'Copernicus Hub', 'GeoServer', 'PostGIS']
},
{
  label: 'AI & modelling',
  items: ['Python', 'PyTorch', 'TensorFlow', 'OpenDrift']
},
{
  label: 'Maritime data',
  items: ['AIS Data', 'GeoSpatial APIs', 'Node.js']
},
{
  label: 'Interface',
  items: ['React', 'Next.js', 'Tailwind CSS', 'Leaflet']
}];


export function TechStack() {
  return (
    <section id="technology" className="border-b border-white/[0.06] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tide-500">
              Technology stack
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
              Built on open earth-observation infrastructure
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-400">
              Every layer is replaceable. The detection model, drift solver and AIS ingestion run as
              independent services behind a single geospatial API.
            </p>
          </div>

          <dl className="grid flex-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:max-w-2xl">
            {groups.map((g) =>
            <div key={g.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-600">
                  {g.label}
                </dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {g.items.map((i) =>
                <span
                  key={i}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs font-medium text-ink-200 transition-[border-color,color] duration-150 ease-out hover:border-tide-500/35 hover:text-tide-400">
                  
                      {i}
                    </span>
                )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>);

}