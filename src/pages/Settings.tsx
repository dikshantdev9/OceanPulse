import React, { useState } from 'react';
import { BellIcon, LaptopIcon, MoonIcon, PaletteIcon, SatelliteIcon, SlidersHorizontalIcon, SunIcon, UserIcon, CheckCircle2Icon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select, Toggle } from '../components/ui/Field';
import { Meter } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { useTheme, type Theme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

export function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [notif, setNotif] = useState({ high: true, medium: true, digest: false, aisGap: true });
  const [threshold, setThreshold] = useState(80);
  const [saved, setSaved] = useState(false);

  const themeOptions: {
    id: Theme;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    previewClasses: {
      bg: string;
      card: string;
      accent: string;
      text: string;
    };
  }[] = [
    {
      id: 'dark',
      title: 'Dark (Deep Ocean)',
      description: 'Signature midnight bathymetry with cyan bioluminescent highlights',
      icon: MoonIcon,
      previewClasses: {
        bg: 'bg-[#04070f]',
        card: 'bg-[#0b1626] border-white/10',
        accent: 'bg-[#22d3ee]',
        text: 'text-[#eaf2ff]',
      },
    },
    {
      id: 'light',
      title: 'Light (Coastal Marine)',
      description: 'Crisp high-contrast ocean breeze with deep navy and azure accents',
      icon: SunIcon,
      previewClasses: {
        bg: 'bg-[#f5f8fd]',
        card: 'bg-white border-[#cbd5e1] shadow-sm',
        accent: 'bg-[#0284c7]',
        text: 'text-[#0f172a]',
      },
    },
    {
      id: 'system',
      title: 'System (Auto Sync)',
      description: `Synchronizes with your operating system preference (Currently ${resolvedTheme})`,
      icon: LaptopIcon,
      previewClasses: {
        bg: 'bg-gradient-to-r from-[#04070f] to-[#f5f8fd]',
        card: 'bg-gradient-to-r from-[#0b1626] to-white border-white/20',
        accent: 'bg-[#0ea5e9]',
        text: 'text-ink-100',
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        subtitle="Profile, appearance & theme, detection thresholds, data feeds and alert routing for your organisation."
        actions={
        <Button
          onClick={() => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 1800);
          }}>
          
            {saved ? 'Changes saved' : 'Save changes'}
          </Button>
        } />
      

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Appearance & Theme Panel */}
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Appearance & Theme"
            subtitle="Customize the visual experience between Dark, Light, or automatic system matching"
            icon={<PaletteIcon className="h-4 w-4" />}
            action={
              <span className="rounded-lg bg-tide-500/10 px-2.5 py-1 text-xs font-semibold text-tide-400">
                Active: {theme.toUpperCase()}
              </span>
            }
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ease-out',
                    isSelected
                      ? 'border-tide-500/60 bg-tide-500/[0.08] shadow-[0_0_24px_-8px_rgba(34,211,238,0.3)] ring-1 ring-tide-500/40'
                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  )}
                >
                  {/* Visual mockup thumbnail */}
                  <div className={cn('mb-3 h-20 w-full overflow-hidden rounded-xl border p-2.5', opt.previewClasses.bg, opt.previewClasses.card)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('h-2 w-2 rounded-full', opt.previewClasses.accent)} />
                        <div className={cn('h-1.5 w-12 rounded', isSelected ? 'bg-tide-400' : 'bg-ink-500/40')} />
                      </div>
                      <div className={cn('h-1.5 w-4 rounded-full', opt.previewClasses.accent)} />
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      <div className={cn('h-6 rounded border border-white/5 bg-white/5 p-1', opt.previewClasses.card)}>
                        <div className={cn('h-1 w-6 rounded', opt.previewClasses.accent)} />
                      </div>
                      <div className={cn('h-6 rounded border border-white/5 bg-white/5 p-1', opt.previewClasses.card)}>
                        <div className="h-1 w-4 rounded bg-signal-low" />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', isSelected ? 'bg-tide-500 text-abyss-950 font-bold' : 'bg-white/10 text-ink-300')}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-ink-100">{opt.title}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2Icon className="h-4 w-4 text-tide-400" />
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-400">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Profile" subtitle="Visible to your organisation" icon={<UserIcon className="h-4 w-4" />} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Full name" name="name" defaultValue="Anjali Kulkarni" />
            <Input label="Work email" name="email" type="email" defaultValue="anjali.k@marinewatch.gov" />
            <Select
              label="Role"
              name="role"
              defaultValue="agency"
              options={[
              { value: 'researcher', label: 'Researcher' },
              { value: 'agency', label: 'Environmental Agency' },
              { value: 'admin', label: 'Administrator' }]
              } />
            
            <Select
              label="Default region"
              name="region"
              defaultValue="arabian"
              options={[
              { value: 'arabian', label: 'Arabian Sea' },
              { value: 'kutch', label: 'Gulf of Kutch' },
              { value: 'laccadive', label: 'Laccadive Sea' },
              { value: 'bengal', label: 'Bay of Bengal' }]
              } />
            
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Detection thresholds"
            subtitle="Applied to new inference runs"
            icon={<SlidersHorizontalIcon className="h-4 w-4" />} />
          
          <div className="mt-5">
            <label htmlFor="threshold" className="text-xs font-semibold text-ink-300">
              Minimum confidence to raise an alert
            </label>
            <input
              id="threshold"
              type="range"
              min={50}
              max={99}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-tide-500" />
            
            <Meter className="mt-4" value={threshold} label="Current threshold" color="#22d3ee" />
            <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
              At {threshold}% the model would have raised {threshold > 85 ? 8 : threshold > 70 ? 11 : 14} of
              the 14 detections in the last 30 days.
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Minimum slick area (km²)" name="area" type="number" defaultValue={1.5} />
            <Input label="AIS gap threshold (min)" name="gap" type="number" defaultValue={30} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Alert routing" subtitle="Where alerts are delivered" icon={<BellIcon className="h-4 w-4" />} />
          <div className="mt-3 divide-y divide-white/[0.05]">
            <Toggle
              label="High priority alerts"
              description="Immediate email and in-app push"
              checked={notif.high}
              onChange={(v) => setNotif((n) => ({ ...n, high: v }))} />
            
            <Toggle
              label="Medium priority alerts"
              description="In-app notification only"
              checked={notif.medium}
              onChange={(v) => setNotif((n) => ({ ...n, medium: v }))} />
            
            <Toggle
              label="Suspicious AIS gaps"
              description="Notify when a tracked vessel goes dark"
              checked={notif.aisGap}
              onChange={(v) => setNotif((n) => ({ ...n, aisGap: v }))} />
            
            <Toggle
              label="Daily digest"
              description="Summary of detections at 07:00 UTC"
              checked={notif.digest}
              onChange={(v) => setNotif((n) => ({ ...n, digest: v }))} />
            
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Data feeds"
            subtitle="Integration status"
            icon={<SatelliteIcon className="h-4 w-4" />} />
          
          <ul className="mt-5 space-y-3">
            {[
            { name: 'Copernicus Sentinel-1 hub', detail: 'OAuth · synced 4 min ago', ok: true },
            { name: 'AIS provider stream', detail: 'Websocket · 2,450 targets', ok: true },
            { name: 'PostGIS spill archive', detail: 'ogai-geo-01 · 128 GB', ok: true },
            { name: 'OpenDrift worker pool', detail: 'Degraded · 2 of 4 workers', ok: false }].
            map((f) =>
            <li
              key={f.name}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
              
                <span
                className={
                'h-2 w-2 shrink-0 rounded-full ' + (f.ok ? 'bg-signal-low' : 'bg-signal-med')
                } />
              
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-100">{f.name}</p>
                  <p className="truncate font-mono text-[11px] text-ink-500">{f.detail}</p>
                </div>
                <span
                className={
                'shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] ' + (
                f.ok ? 'text-signal-low' : 'text-signal-med')
                }>
                
                  {f.ok ? 'Healthy' : 'Degraded'}
                </span>
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>);

}