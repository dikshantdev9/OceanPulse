import type { Alert } from '../types';

export const alerts: Alert[] = [
{
  id: 'AL-2091',
  priority: 'HIGH',
  title: 'Possible oil spill detected',
  detail:
  'Sentinel-1A VV backscatter anomaly classified as a surface slick by the detection model. Awaiting analyst confirmation.',
  meta: [
  { label: 'Location', value: 'Arabian Sea' },
  { label: 'Confidence', value: '94%' },
  { label: 'Area', value: '12.5 km²' }],

  time: '4 min ago',
  actionLabel: 'Analyze now',
  actionTo: '/app/detection',
  unread: true
},
{
  id: 'AL-2090',
  priority: 'MEDIUM',
  title: 'Suspicious AIS gap detected',
  detail:
  'Transponder silence inside an active monitoring polygon, overlapping the estimated release window for OG-2026-001.',
  meta: [
  { label: 'Vessel', value: 'Ocean Explorer' },
  { label: 'Duration', value: '45 minutes' },
  { label: 'Zone', value: 'Mumbai offshore' }],

  time: '22 min ago',
  actionLabel: 'View vessel',
  actionTo: '/app/vessels/v-voyager',
  unread: true
},
{
  id: 'AL-2089',
  priority: 'HIGH',
  title: 'Slick expanding beyond forecast',
  detail:
  'OG-2026-003 has grown 18% since the previous pass. Drift model now places the leading edge inside a protected reef zone.',
  meta: [
  { label: 'Spill', value: 'OG-2026-003' },
  { label: 'Growth', value: '+18% / 12h' },
  { label: 'Risk', value: 'HIGH' }],

  time: '1 hr ago',
  actionLabel: 'Open drift model',
  actionTo: '/app/drift',
  unread: false
},
{
  id: 'AL-2088',
  priority: 'MEDIUM',
  title: 'New suspect ranked above threshold',
  detail: 'Correlation engine ranked Gulf Pioneer at 38% for OG-2026-002 after an AIS backfill.',
  meta: [
  { label: 'Vessel', value: 'Gulf Pioneer' },
  { label: 'Spill', value: 'OG-2026-002' },
  { label: 'Score', value: '38%' }],

  time: '3 hr ago',
  actionLabel: 'Review ranking',
  actionTo: '/app/correlation',
  unread: false
},
{
  id: 'AL-2087',
  priority: 'LOW',
  title: 'Scheduled Sentinel-1B pass ingested',
  detail: 'Scene S1B_IW_GRDH_20260901_1432 ingested and queued for inference.',
  meta: [
  { label: 'Scene', value: 'S1B…1432' },
  { label: 'Size', value: '1.6 GB' }],

  time: '6 hr ago',
  actionLabel: 'Open imagery',
  actionTo: '/app/imagery',
  unread: false
}];


export const unreadAlertCount = alerts.filter((a) => a.unread).length;