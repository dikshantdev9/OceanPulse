import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadIcon, HistoryIcon, SearchIcon } from 'lucide-react';
import { spills } from '../data/spills';
import type { RiskLevel, SpillStatus } from '../types';
import { Chip, RiskBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import { Meter } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { EmptyState } from '../components/ui/States';
import { confidenceColor, formatDate } from '../utils/format';

const risks: (RiskLevel | 'All')[] = ['All', 'HIGH', 'MEDIUM', 'LOW'];
const statuses: (SpillStatus | 'All')[] = ['All', 'Detected', 'Investigating', 'Confirmed', 'Resolved'];

export function DetectionHistory() {
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<(typeof risks)[number]>('All');
  const [status, setStatus] = useState<(typeof statuses)[number]>('All');
  const [region, setRegion] = useState('all');
  const [from, setFrom] = useState('2026-08-01');

  const regions = useMemo(() => Array.from(new Set(spills.map((s) => s.region))), []);

  const rows = useMemo(
    () =>
    spills.filter((s) => {
      const q = query.trim().toLowerCase();
      return (
        (risk === 'All' || s.risk === risk) && (
        status === 'All' || s.status === status) && (
        region === 'all' || s.region === region) &&
        s.detectedAt.slice(0, 10) >= from && (
        q === '' || s.id.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)));

    }),
    [query, risk, status, region, from]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Archive"
        title="Detection History"
        subtitle="Every slick the model has flagged, with its investigation state and evidence trail."
        actions={
        <Button variant="secondary">
            <DownloadIcon className="h-4 w-4" />
            Export CSV
          </Button>
        } />
      

      <Panel>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Input
            label="Search"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<SearchIcon className="h-4 w-4" />}
            placeholder="Spill ID or location" />
          
          <Input
            label="Detected since"
            name="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)} />
          
          <Select
            label="Location"
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={[
            { value: 'all', label: 'All monitored regions' },
            ...regions.map((r) => ({ value: r, label: r }))]
            } />
          
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-600">Risk</span>
            {risks.map((r) =>
            <Chip key={r} active={risk === r} onClick={() => setRisk(r)}>
                {r === 'All' ? 'Any' : r}
              </Chip>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-600">Status</span>
            {statuses.map((s) =>
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === 'All' ? 'Any' : s}
              </Chip>
            )}
          </div>
        </div>
      </Panel>

      <Panel flush>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <PanelHeader
            title="Detections"
            subtitle={`${rows.length} of ${spills.length} records`}
            icon={<HistoryIcon className="h-4 w-4" />} />
          
        </div>

        {rows.length === 0 ?
        <EmptyState
          title="No detections match these filters"
          description="Try widening the date range or clearing the risk and status filters."
          action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setQuery('');
              setRisk('All');
              setStatus('All');
              setRegion('all');
              setFrom('2026-08-01');
            }}>
            
                Clear filters
              </Button>
          } /> :


        <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.1em] text-ink-600">
                    <th scope="col" className="px-5 py-3 font-semibold">Spill ID</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Location</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Area</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Confidence</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Risk</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Suspects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {rows.map((s) =>
                <tr key={s.id} className="transition-colors duration-150 ease-out hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                      to="/app/correlation"
                      className="font-mono text-[13px] font-semibold text-ink-100 transition-colors duration-150 ease-out hover:text-tide-400">
                      
                          {s.id}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-ink-400">
                        {formatDate(s.detectedAt)}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-ink-300">{s.location}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-[13px] tabular text-ink-200">
                        {s.areaKm2} km²
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex w-32 items-center gap-3">
                          <Meter
                        value={s.confidence}
                        showValue={false}
                        size="sm"
                        color={confidenceColor(s.confidence)} />
                      
                          <span className="font-mono text-xs font-semibold tabular text-ink-100">
                            {s.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RiskBadge risk={s.risk} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-4 font-mono text-[13px] tabular text-ink-300">
                        {s.suspectCount}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 p-4 md:hidden">
              {rows.map((s) =>
            <li key={s.id}>
                  <Link
                to="/app/correlation"
                className="block rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[13px] font-semibold text-ink-100">{s.id}</span>
                      <RiskBadge risk={s.risk} />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-400">{s.location}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] tabular text-ink-300">
                        {formatDate(s.detectedAt)} · {s.areaKm2} km²
                      </span>
                      <StatusBadge status={s.status} />
                    </div>
                    <Meter
                  className="mt-3"
                  value={s.confidence}
                  size="sm"
                  color={confidenceColor(s.confidence)} />
                
                  </Link>
                </li>
            )}
            </ul>
          </>
        }
      </Panel>
    </div>);

}