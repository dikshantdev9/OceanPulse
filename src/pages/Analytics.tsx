import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { DownloadIcon } from 'lucide-react';
import {
  confidenceDistribution,
  detectionLatency,
  highRiskAreas,
  monitoredRegions,
  spillsPerMonth,
  vesselTypeDistribution } from
'../data/analytics';
import { Chip } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Meter } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';

const axis = {
  stroke: 'rgba(99,121,155,0.35)',
  tick: { fill: '#63799b', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-abyss-950/95 px-3 py-2 shadow-panel backdrop-blur-md">
      <p className="text-[11px] font-semibold text-ink-200">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((p: any) =>
        <li key={p.name} className="flex items-center gap-2 font-mono text-[11px] text-ink-300">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color ?? p.fill }} />
            {p.name}: <span className="font-semibold text-white">{p.value}</span>
          </li>
        )}
      </ul>
    </div>);

}

export function Analytics() {
  const [range, setRange] = useState<'90d' | '6m' | '12m'>('12m');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Detection Analytics"
        subtitle="Where spills happen, how fast they are found, and which vessel classes dominate the suspect lists."
        actions={
        <>
            <div className="flex gap-2">
              {(
            [
            ['90d', 'Last 90 days'],
            ['6m', '6 months'],
            ['12m', '12 months']] as
            const).
            map(([id, label]) =>
            <Chip key={id} active={range === id} onClick={() => setRange(id)}>
                  {label}
                </Chip>
            )}
            </div>
            <Button variant="secondary">
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
          </>
        } />
      

      {/* Primary chart gets the most space */}
      <Panel>
        <PanelHeader
          title="Oil spills detected per month"
          subtitle="Confirmed slicks versus possible detections awaiting analyst review"
          action={
          <div className="flex items-center gap-4 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-signal-high">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-high" />
                Confirmed
              </span>
              <span className="flex items-center gap-1.5 text-tide-500">
                <span className="h-1.5 w-1.5 rounded-full bg-tide-500" />
                Possible
              </span>
            </div>
          } />
        
        <div className="mt-6 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spillsPerMonth} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="fillConfirmed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb4d6a" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#fb4d6a" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="fillPossible" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(99,121,155,0.12)" vertical={false} />
              <XAxis dataKey="month" stroke={axis.stroke} tick={axis.tick} tickLine={false} />
              <YAxis stroke={axis.stroke} tick={axis.tick} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="possible"
                name="Possible"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#fillPossible)" />
              
              <Area
                type="monotone"
                dataKey="confirmed"
                name="Confirmed"
                stroke="#fb4d6a"
                strokeWidth={2}
                fill="url(#fillConfirmed)" />
              
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="High-risk areas" subtitle="Spill count by region" />
          <div className="mt-6 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={highRiskAreas}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 0, left: 12 }}>
                
                <CartesianGrid stroke="rgba(99,121,155,0.12)" horizontal={false} />
                <XAxis type="number" stroke={axis.stroke} tick={axis.tick} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="area"
                  stroke={axis.stroke}
                  tick={{ ...axis.tick, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={90} />
                
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="spills" name="Spills" radius={[0, 4, 4, 0]} fill="#fb4d6a" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Vessel type distribution" subtitle="Share of ranked suspects" />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vesselTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="none">
                    
                    {vesselTypeDistribution.map((d) =>
                    <Cell key={d.name} fill={d.color} />
                    )}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-2.5">
              {vesselTypeDistribution.map((d) =>
              <li key={d.name} className="flex items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-300">{d.name}</span>
                  <span className="font-mono text-xs font-semibold tabular text-ink-100">{d.value}%</span>
                </li>
              )}
            </ul>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Detection confidence" subtitle="Distribution across all detections" />
          <div className="mt-6 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDistribution} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="rgba(99,121,155,0.12)" vertical={false} />
                <XAxis dataKey="band" stroke={axis.stroke} tick={axis.tick} tickLine={false} />
                <YAxis stroke={axis.stroke} tick={axis.tick} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" name="Detections" radius={[4, 4, 0, 0]} barSize={26}>
                  {confidenceDistribution.map((d, i) =>
                  <Cell key={d.band} fill={i >= 3 ? '#22d3ee' : 'rgba(34,211,238,0.4)'} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel>
          <PanelHeader title="Median alert latency" subtitle="Minutes from satellite pass to analyst alert" />
          <div className="mt-6 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detectionLatency} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="rgba(99,121,155,0.12)" vertical={false} />
                <XAxis dataKey="week" stroke={axis.stroke} tick={axis.tick} tickLine={false} />
                <YAxis stroke={axis.stroke} tick={axis.tick} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="Minutes"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }}
                  activeDot={{ r: 5 }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Most frequently monitored regions"
            subtitle="Satellite passes and coverage completeness" />
          
          <ul className="mt-5 space-y-4">
            {monitoredRegions.map((r) =>
            <li key={r.region}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold text-ink-100">{r.region}</p>
                  <p className="font-mono text-xs tabular text-ink-400">{r.passes} passes</p>
                </div>
                <Meter className="mt-2" value={r.coverage} label="Coverage" color="#a78bfa" />
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>);

}