import type { SatelliteImage } from '../types';
import { assets } from './assets';

export const satelliteImages: SatelliteImage[] = [
{
  id: 'S1A_IW_GRDH_20260904_0642',
  satellite: 'Sentinel-1A',
  captureDate: '2026-09-04T06:42:00Z',
  location: 'Arabian Sea — Mumbai offshore',
  resolutionM: 10,
  polarization: 'VV',
  status: 'Analyzed',
  sizeGb: 1.7,
  thumbnail: assets.sarSpill,
  spillDetected: true
},
{
  id: 'S1B_IW_GRDH_20260903_1815',
  satellite: 'Sentinel-1B',
  captureDate: '2026-09-03T18:15:00Z',
  location: 'Gulf of Kutch — Kandla approach',
  resolutionM: 10,
  polarization: 'VH',
  status: 'Analyzed',
  sizeGb: 1.4,
  thumbnail: assets.sarTile,
  spillDetected: true
},
{
  id: 'S1A_IW_GRDH_20260903_0521',
  satellite: 'Sentinel-1A',
  captureDate: '2026-09-03T05:21:00Z',
  location: 'Laccadive Sea — Kochi shelf',
  resolutionM: 10,
  polarization: 'VV',
  status: 'Processing',
  sizeGb: 1.9,
  thumbnail: assets.sarClean,
  spillDetected: false
},
{
  id: 'S1B_IW_GRDH_20260902_2210',
  satellite: 'Sentinel-1B',
  captureDate: '2026-09-02T22:10:00Z',
  location: 'Gulf of Oman — Strait approach',
  resolutionM: 20,
  polarization: 'VV',
  status: 'Available',
  sizeGb: 1.1,
  thumbnail: assets.sarTile,
  spillDetected: false
},
{
  id: 'S1A_IW_GRDH_20260902_0905',
  satellite: 'Sentinel-1A',
  captureDate: '2026-09-02T09:05:00Z',
  location: 'Laccadive Sea — 140 km SW of Kochi',
  resolutionM: 10,
  polarization: 'VV',
  status: 'Analyzed',
  sizeGb: 2.2,
  thumbnail: assets.sarSpill,
  spillDetected: true
},
{
  id: 'S1B_IW_GRDH_20260901_1432',
  satellite: 'Sentinel-1B',
  captureDate: '2026-09-01T14:32:00Z',
  location: 'Bay of Bengal — Chennai offshore',
  resolutionM: 10,
  polarization: 'VH',
  status: 'Available',
  sizeGb: 1.6,
  thumbnail: assets.sarClean,
  spillDetected: false
},
{
  id: 'S1A_IW_GRDH_20260831_0348',
  satellite: 'Sentinel-1A',
  captureDate: '2026-08-31T03:48:00Z',
  location: 'Arabian Sea — Ratnagiri shelf',
  resolutionM: 20,
  polarization: 'VV',
  status: 'Processing',
  sizeGb: 1.3,
  thumbnail: assets.sarTile,
  spillDetected: false
},
{
  id: 'S1B_IW_GRDH_20260830_1901',
  satellite: 'Sentinel-1B',
  captureDate: '2026-08-30T19:01:00Z',
  location: 'Arabian Sea — Khambhat mouth',
  resolutionM: 10,
  polarization: 'VV',
  status: 'Available',
  sizeGb: 1.8,
  thumbnail: assets.sarClean,
  spillDetected: false
}];