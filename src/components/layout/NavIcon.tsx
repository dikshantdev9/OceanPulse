import React from 'react';
import {
  ActivityIcon,
  BellIcon,
  ChartColumnIcon,
  CompassIcon,
  FileTextIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  RadarIcon,
  SatelliteIcon,
  SettingsIcon,
  ShipIcon,
  WavesIcon } from
'lucide-react';
import type { NavEntry } from '../../data/navigation';

const map: Record<NavEntry['icon'], React.ComponentType<{className?: string;}>> = {
  dashboard: LayoutDashboardIcon,
  live: RadarIcon,
  detection: WavesIcon,
  imagery: SatelliteIcon,
  ais: ShipIcon,
  analysis: ActivityIcon,
  drift: CompassIcon,
  history: HistoryIcon,
  analytics: ChartColumnIcon,
  alerts: BellIcon,
  reports: FileTextIcon,
  settings: SettingsIcon
};

export function NavIcon({ name, className }: {name: NavEntry['icon'];className?: string;}) {
  const Cmp = map[name];
  return <Cmp className={className} />;
}