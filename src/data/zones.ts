import type { ScanZone } from '../components/map/OceanMap';

export const scanZones: ScanZone[] = [
{
  id: 'zone-mumbai',
  center: { lat: 18.9, lon: 72.6 },
  widthPct: 34,
  heightPct: 30,
  label: 'Sentinel-1A · Pass 062'
},
{
  id: 'zone-kutch',
  center: { lat: 21.9, lon: 69.6 },
  widthPct: 26,
  heightPct: 22,
  label: 'Sentinel-1B · Pass 018'
},
{
  id: 'zone-ratnagiri',
  center: { lat: 16.6, lon: 71.6 },
  widthPct: 22,
  heightPct: 20,
  label: 'Sentinel-1A · Pass 135'
}];


export const driftCoords = [
{ lat: 18.7204, lon: 71.8567 },
{ lat: 18.7012, lon: 71.7412 },
{ lat: 18.6812, lon: 71.6212 },
{ lat: 18.6612, lon: 71.5012 },
{ lat: 18.6412, lon: 71.3985 }];


export const driftFrames = [
{
  id: 'now',
  label: 'Current detection',
  offsetHours: 0,
  coord: { lat: 18.7204, lon: 71.8567 },
  time: '2026-09-04T06:42:00Z',
  note: 'Slick centroid as captured by Sentinel-1A.'
},
{
  id: 'h1',
  label: 'Backtrack 1 hour',
  offsetHours: -1,
  coord: { lat: 18.7012, lon: 71.7412 },
  time: '2026-09-04T05:42:00Z',
  note: 'Advection dominated by the north-east setting current.'
},
{
  id: 'h3',
  label: 'Backtrack 3 hours',
  offsetHours: -3,
  coord: { lat: 18.6812, lon: 71.6212 },
  time: '2026-09-04T03:42:00Z',
  note: 'Slick footprint 38% smaller, consistent with spreading.'
},
{
  id: 'h6',
  label: 'Backtrack 6 hours',
  offsetHours: -6,
  coord: { lat: 18.6612, lon: 71.5012 },
  time: '2026-09-04T00:42:00Z',
  note: 'Wind drift factor 3.1% applied to the 10 m wind field.'
},
{
  id: 'origin',
  label: 'Estimated release',
  offsetHours: -8,
  coord: { lat: 18.6412, lon: 71.3985 },
  time: '2026-09-03T22:35:00Z',
  note: 'OpenDrift ensemble converges within a 1.9 km radius.'
}];


export const driftConditions = {
  windSpeedKt: 11.4,
  windDirection: 'SW 228°',
  currentSpeedKt: 1.2,
  currentDirection: 'NE 041°',
  driftDirection: 'NE 048°',
  releaseWindow: '03 Sept 2026 · 22:20 – 22:50 UTC',
  driftFactorPct: 3.1,
  ensembleMembers: 240
};