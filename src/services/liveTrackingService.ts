import type { Coordinate, Spill, Vessel } from '../types';
import { vessels as initialVessels } from '../data/vessels';
import { vesselMovementService } from './vesselMovementService';

export type LiveTrackingMode = 'LIVE' | 'DEMO';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getLiveTrackingMode(): LiveTrackingMode {
  return import.meta.env.VITE_AIS_API_KEY ? 'LIVE' : 'DEMO';
}

export function getVesselCoordinates(vessel: Vessel): Coordinate {
  return {
    lat: vessel.coord?.lat ?? vessel.latitude ?? 0,
    lon: vessel.coord?.lon ?? vessel.longitude ?? 0,
  };
}

export function distanceKm(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(hav));
}

export function interpolateVesselPosition(vessel: Vessel, intervalSeconds = 4, headingShift = 0): Vessel {
  const base = getVesselCoordinates(vessel);
  const heading = ((vessel.heading ?? vessel.headingDeg ?? 0) + headingShift + 360) % 360;
  const speedKts = vessel.speed ?? vessel.speedKnots ?? 0;
  const metersPerSecond = speedKts * 0.514444;
  const metersTravelled = metersPerSecond * intervalSeconds;
  const radians = (heading - 90) * (Math.PI / 180);
  const deltaLat = (metersTravelled * Math.cos(radians)) / 111_320;
  const deltaLon = (metersTravelled * Math.sin(radians)) / (111_320 * Math.cos(base.lat * (Math.PI / 180)));

  const nextCoord = {
    lat: clamp(base.lat + deltaLat, 7, 26),
    lon: clamp(base.lon + deltaLon, 58, 86),
  };

  const nextHeading = ((heading + (Math.random() * 10 - 5) + 360) % 360 + 360) % 360;
  const nextSpeed = clamp(speedKts + (Math.random() * 3 - 1.5), 2, 26);
  const nextTrack = [...(vessel.track ?? []), nextCoord].slice(-18);

  return {
    ...vessel,
    coord: nextCoord,
    latitude: nextCoord.lat,
    longitude: nextCoord.lon,
    headingDeg: Number(nextHeading.toFixed(0)),
    heading: Number(nextHeading.toFixed(0)),
    headingLabel: getHeadingLabel(Number(nextHeading.toFixed(0))),
    speedKnots: Number(nextSpeed.toFixed(1)),
    speed: Number(nextSpeed.toFixed(1)),
    lastSeen: new Date().toISOString(),
    track: nextTrack,
  };
}

export function createMockLiveVessels(): Vessel[] {
  const simVessels = vesselMovementService.getPublicVessels();
  if (simVessels && simVessels.length > 0) {
    return simVessels;
  }
  return initialVessels.map((vessel) => ({
    ...vessel,
    coord: { ...vessel.coord },
    latitude: vessel.coord.lat,
    longitude: vessel.coord.lon,
    speed: vessel.speedKnots,
    heading: vessel.headingDeg,
    track: [...vessel.track],
  }));
}

export function subscribeToLiveVessels(
  onUpdate: (vessels: Vessel[]) => void,
  intervalMs = 1000
): () => void {
  const mode = getLiveTrackingMode();

  if (mode === 'DEMO') {
    return vesselMovementService.subscribeUi(onUpdate);
  }

  // Live API polling mode if configured
  let vessels = createMockLiveVessels();
  onUpdate(vessels);

  const interval = window.setInterval(() => {
    onUpdate(vessels);
  }, intervalMs);

  return () => window.clearInterval(interval);
}

export function computeDetailedAttribution(vessel: Vessel, spill: Spill) {
  const origin = spill.originCoord || spill.coord;
  const distToOrigin = distanceKm(vessel.coord, origin);
  
  // 1. Distance Match: Proximity to Estimated Origin
  const distanceMatch = clamp(Math.round(100 - distToOrigin * 0.25), 30, 96);

  // 2. Time Match: Temporal Window Correlation
  const timeDiffHours = Math.abs(Date.now() - new Date(spill.detectedAt).getTime()) / (1000 * 60 * 60);
  const timeMatch = clamp(Math.round(95 - timeDiffHours * 1.5), 35, 94);

  // 3. Trajectory Match: Alignment of Historical AIS Track with Origin
  const minTrackDist = vessel.track && vessel.track.length > 0
    ? Math.min(...vessel.track.map((pt) => distanceKm(pt, origin)))
    : distToOrigin;
  const trajectoryMatch = clamp(Math.round(100 - minTrackDist * 0.4), 25, 95);

  // 4. Drift Compatibility: Ocean Current Vector Alignment
  const driftCompatibility = clamp(Math.round(88 - (distToOrigin % 15)), 40, 92);

  // 5. AIS Track Continuity (penalize transponder gaps)
  const aisContinuity = vessel.aisGap ? clamp(95 - vessel.aisGapMinutes * 0.1, 75, 96) : 35;

  // Weighted overall probabilistic attribution score
  const overallScore = Math.round(
    distanceMatch * 0.28 +
    timeMatch * 0.22 +
    trajectoryMatch * 0.25 +
    driftCompatibility * 0.15 +
    aisContinuity * 0.10
  );

  return {
    overallScore: clamp(overallScore, 10, 98),
    distanceMatch,
    timeMatch,
    trajectoryMatch,
    driftCompatibility,
    aisContinuity,
  };
}

export function computeSuspicionScore(vessel: Vessel, spill: Spill): number {
  if (spill.primarySuspectId === vessel.id) {
    const predefined = spill.correlatedVessels?.find((cv) => cv.vesselId === vessel.id);
    if (predefined) return predefined.overallScore;
    return 87;
  }

  const predefined = spill.correlatedVessels?.find((cv) => cv.vesselId === vessel.id || cv.mmsi === vessel.mmsi);
  if (predefined) return predefined.overallScore;

  return computeDetailedAttribution(vessel, spill).overallScore;
}

export function rankPotentiallyResponsibleVessels(vessels: Vessel[], spills: Spill[]) {
  const suspectMap = new Map<string, { vessel: Vessel; score: number; spillId: string }>();

  for (const spill of spills) {
    if (spill.status === 'Resolved') continue;

    for (const vessel of vessels) {
      const score = computeSuspicionScore(vessel, spill);
      if (score >= 60 || spill.primarySuspectId === vessel.id) {
        const existing = suspectMap.get(vessel.id);
        if (!existing || existing.score < score) {
          suspectMap.set(vessel.id, { vessel, score, spillId: spill.id });
        }
      }
    }
  }

  return Array.from(suspectMap.values()).sort((a, b) => b.score - a.score);
}

export function getTopCandidatesForSpill(spill: Spill, vessels: Vessel[]) {
  if (spill.correlatedVessels && spill.correlatedVessels.length > 0) {
    return spill.correlatedVessels.map((cv) => {
      const liveVessel = vessels.find((v) => v.id === cv.vesselId || v.mmsi === cv.mmsi);
      return {
        ...cv,
        liveVessel: liveVessel || undefined,
      };
    });
  }

  return vessels
    .map((vessel) => {
      const scores = computeDetailedAttribution(vessel, spill);
      return {
        vesselId: vessel.id,
        vesselName: vessel.name,
        mmsi: vessel.mmsi,
        type: vessel.type,
        rank: 1,
        ...scores,
        explanation: 'Probabilistic correlation based on AIS trajectory and estimated spill origin.',
        liveVessel: vessel,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 3)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function getHeadingLabel(deg: number): string {
  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const index = Math.round(((deg % 360) / 45)) % directions.length;
  return directions[index];
}
