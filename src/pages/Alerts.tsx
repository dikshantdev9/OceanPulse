import React, { useMemo, useState } from 'react';
import { BellIcon, CheckCheckIcon } from 'lucide-react';
import { alerts as allAlerts } from '../data/alerts';
import type { AlertPriority } from '../types';
import { AlertCard } from '../components/alerts/AlertCard';
import { Chip } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { EmptyState } from '../components/ui/States';

const filters: (AlertPriority | 'All' | 'Unread')[] = ['All', 'Unread', 'HIGH', 'MEDIUM', 'LOW'];

export function Alerts() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const list = useMemo(
    () =>
    allAlerts.
    map((a) => ({ ...a, unread: a.unread && !acknowledged.includes(a.id) })).
    filter((a) => {
      if (filter === 'All') return true;
      if (filter === 'Unread') return a.unread;
      return a.priority === filter;
    }),
    [filter, acknowledged]
  );

  const unread = allAlerts.filter((a) => a.unread && !acknowledged.includes(a.id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alert center"
        title="Alerts"
        subtitle="Detection, drift and AIS anomalies routed to your organisation's watch queue."
        actions={
        <Button
          variant="secondary"
          onClick={() => setAcknowledged(allAlerts.map((a) => a.id))}
          disabled={unread === 0}>
          
            <CheckCheckIcon className="h-4 w-4" />
            Acknowledge all
          </Button>
        } />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) =>
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === 'All' ? 'All alerts' : f === 'Unread' ? `Unread (${unread})` : f}
              </Chip>
            )}
          </div>

          {list.length === 0 ?
          <Panel>
              <EmptyState
              title="Queue is clear"
              description="No alerts match this filter. New detections and AIS anomalies will appear here automatically."
              icon={<BellIcon className="h-5 w-5" />} />
            
            </Panel> :

          <ul className="space-y-3">
              {list.map((a) =>
            <li key={a.id}>
                  <AlertCard alert={a} />
                </li>
            )}
            </ul>
          }
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader title="Queue summary" subtitle="Rolling 24 hours" />
            <dl className="mt-5 space-y-3.5">
              {[
              { label: 'High priority', value: allAlerts.filter((a) => a.priority === 'HIGH').length, tone: 'text-signal-high' },
              { label: 'Medium priority', value: allAlerts.filter((a) => a.priority === 'MEDIUM').length, tone: 'text-signal-med' },
              { label: 'Low priority', value: allAlerts.filter((a) => a.priority === 'LOW').length, tone: 'text-signal-info' },
              { label: 'Unacknowledged', value: unread, tone: 'text-tide-400' }].
              map((r) =>
              <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                  <dt className="text-[13px] text-ink-400">{r.label}</dt>
                  <dd className={'font-mono text-lg font-semibold tabular ' + r.tone}>{r.value}</dd>
                </div>
              )}
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Escalation rules" subtitle="Applied to your role" />
            <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-ink-300">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-high" />
                Confidence ≥ 90% with area ≥ 10 km² pages the duty officer immediately.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-med" />
                AIS gaps over 30 minutes inside a monitored polygon raise a medium alert.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-info" />
                Ingestion and model-health events stay in the low-priority stream.
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>);

}