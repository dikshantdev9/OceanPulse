export interface NavEntry {
  label: string;
  to: string;
  icon:
  'dashboard' |
  'live' |
  'detection' |
  'imagery' |
  'ais' |
  'analysis' |
  'drift' |
  'history' |
  'analytics' |
  'alerts' |
  'reports' |
  'settings';
  group: 'Monitoring' | 'Investigation' | 'Workspace';
  badge?: number;
}

export const navEntries: NavEntry[] = [
{ label: 'Dashboard', to: '/app', icon: 'dashboard', group: 'Monitoring' },
{ label: 'Live Monitoring', to: '/app/live', icon: 'live', group: 'Monitoring' },
{ label: 'Oil Spill Detection', to: '/app/detection', icon: 'detection', group: 'Monitoring' },
{ label: 'Satellite Imagery', to: '/app/imagery', icon: 'imagery', group: 'Monitoring' },
{ label: 'AIS Tracking', to: '/app/ais', icon: 'ais', group: 'Investigation' },
{ label: 'Vessel Analysis', to: '/app/correlation', icon: 'analysis', group: 'Investigation' },
{ label: 'Drift Backtracking', to: '/app/drift', icon: 'drift', group: 'Investigation' },
{ label: 'Detection History', to: '/app/history', icon: 'history', group: 'Investigation' },
{ label: 'Analytics', to: '/app/analytics', icon: 'analytics', group: 'Workspace' },
{ label: 'Alerts', to: '/app/alerts', icon: 'alerts', group: 'Workspace', badge: 2 },
{ label: 'Reports', to: '/app/reports', icon: 'reports', group: 'Workspace' },
{ label: 'Settings', to: '/app/settings', icon: 'settings', group: 'Workspace' }];


export const mobileNavEntries = navEntries.filter((n) =>
['/app', '/app/live', '/app/detection', '/app/correlation', '/app/alerts'].includes(n.to)
);