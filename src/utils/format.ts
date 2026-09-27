import type { RiskLevel } from '../types';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC'
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

export const formatTime = (iso: string) => `${timeFmt.format(new Date(iso))} UTC`;

export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`;

export const formatCoord = ({ lat, lon }: {lat: number;lon: number;}) =>
`${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}° ${
lon >= 0 ? 'E' : 'W'}`;


export const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

export const riskTone: Record<RiskLevel, {text: string;bg: string;ring: string;dot: string;}> = {
  HIGH: {
    text: 'text-signal-high',
    bg: 'bg-signal-high/10',
    ring: 'ring-signal-high/30',
    dot: 'bg-signal-high'
  },
  MEDIUM: {
    text: 'text-signal-med',
    bg: 'bg-signal-med/10',
    ring: 'ring-signal-med/30',
    dot: 'bg-signal-med'
  },
  LOW: {
    text: 'text-signal-low',
    bg: 'bg-signal-low/10',
    ring: 'ring-signal-low/30',
    dot: 'bg-signal-low'
  }
};

export const statusTone: Record<string, string> = {
  Detected: 'text-signal-info bg-signal-info/10 ring-signal-info/25',
  Investigating: 'text-signal-med bg-signal-med/10 ring-signal-med/25',
  Confirmed: 'text-signal-high bg-signal-high/10 ring-signal-high/25',
  Resolved: 'text-signal-low bg-signal-low/10 ring-signal-low/25',
  Available: 'text-signal-info bg-signal-info/10 ring-signal-info/25',
  Processing: 'text-signal-med bg-signal-med/10 ring-signal-med/25',
  Analyzed: 'text-signal-low bg-signal-low/10 ring-signal-low/25'
};

export const confidenceColor = (v: number) =>
v >= 85 ? '#fb4d6a' : v >= 70 ? '#f59e0b' : '#22d3ee';