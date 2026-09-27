import React from 'react';
import { Link } from 'react-router-dom';
import { GithubIcon, MailIcon } from 'lucide-react';
import { Logo } from '../layout/Logo';

const columns = [
{
  label: 'Platform',
  links: [
  { label: 'Dashboard', to: '/app' },
  { label: 'Oil spill detection', to: '/app/detection' },
  { label: 'AIS vessel tracking', to: '/app/ais' },
  { label: 'Reports', to: '/app/reports' }]

},
{
  label: 'Technology',
  links: [
  { label: 'Sentinel-1 pipeline', to: '/app/imagery' },
  { label: 'Drift backtracking', to: '/app/drift' },
  { label: 'Correlation engine', to: '/app/correlation' },
  { label: 'Analytics', to: '/app/analytics' }]

},
{
  label: 'Team',
  links: [
  { label: 'Research group', to: '/app/settings' },
  { label: 'Agency partners', to: '/app/settings' },
  { label: 'Contact', to: '/app/settings' }]

}];


export function SiteFooter() {
  return (
    <footer className="bg-abyss-950 py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-400">
              An AI-powered oil spill detection and vessel identification system for environmental
              agencies and marine researchers.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="#technology"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-ink-300 transition-[border-color,color] duration-150 ease-out hover:border-tide-500/40 hover:text-tide-400">
                
                <GithubIcon className="h-3.5 w-3.5" />
                GitHub
              </a>
              <a
                href="#impact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-ink-300 transition-[border-color,color] duration-150 ease-out hover:border-tide-500/40 hover:text-tide-400">
                
                <MailIcon className="h-3.5 w-3.5" />
                Contact
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((c) =>
            <div key={c.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-600">
                  {c.label}
                </p>
                <ul className="mt-3.5 space-y-2.5">
                  {c.links.map((l) =>
                <li key={l.label}>
                      <Link
                    to={l.to}
                    className="text-[13px] font-medium text-ink-400 transition-colors duration-150 ease-out hover:text-ink-100">
                    
                        {l.label}
                      </Link>
                    </li>
                )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            © 2026 Ocean Guard AI · Detect. Track. Protect the Ocean.
          </p>
          <p className="font-mono text-[11px] text-ink-600">
            Demo data · Sentinel-1 imagery courtesy of Copernicus
          </p>
        </div>
      </div>
    </footer>);

}