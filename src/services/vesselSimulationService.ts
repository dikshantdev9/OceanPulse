import type { Coordinate, Vessel, VesselType } from '../types';
import { DEMO_VESSEL_CONFIGS, MARITIME_ROUTES, type MaritimeRoute } from '../data/oceanRoutes';
import {
  calculateBearing,
  calculateDistance,
  getHeadingLabel,
  interpolatePosition,
  isValidOceanPosition,
  normalizeHeading,
} from '../utils/geoUtils';

export interface InternalSimulatedVessel {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  type: VesselType;
  flag: string;
  routeId: string;
  currentWaypointIndex: number;
  nextWaypointIndex: number;
  segmentProgress: number; // 0 to 1
  speedKnots: number;
  baseSpeed: number;
  headingDeg: number;
  coord: Coordinate;
  track: Coordinate[];
  destination: string;
  lengthM: number;
  grossTonnage: number;
  aisGap: boolean;
  aisGapMinutes: number;
  status: string;
  lastHistoryTimestamp: number;
}

type VesselUpdateListener = (vessels: Vessel[]) => void;

class VesselSimulationService {
  private vessels: InternalSimulatedVessel[] = [];
  private routesMap = new Map<string, MaritimeRoute>();
  private listeners = new Set<VesselUpdateListener>();
  private animationFrameId: number | null = null;
  private intervalId: number | null = null;
  private lastTickTime: number = performance.now();
  private lastBroadcastTime: number = 0;
  private isRunning: boolean = false;

  constructor() {
    this.initRoutes();
    this.initVessels();
  }

  private initRoutes() {
    for (const route of MARITIME_ROUTES) {
      this.routesMap.set(route.id, route);
    }
  }

  private initVessels() {
    this.vessels = DEMO_VESSEL_CONFIGS.map((config) => {
      const route = this.routesMap.get(config.routeId) ?? MARITIME_ROUTES[0];
      const waypoints = route.waypoints;
      const curIdx = config.startWaypointIndex % waypoints.length;
      const nextIdx = (curIdx + 1) % waypoints.length;

      const curWp = waypoints[curIdx];
      const nextWp = waypoints[nextIdx];

      const startCoord: Coordinate = { lat: curWp.lat, lon: curWp.lon };
      const initialBearing = Math.round(calculateBearing(startCoord, nextWp));

      // Pre-populate initial historical track along the route
      const initialTrack: Coordinate[] = [];
      const steps = 6;
      for (let s = steps; s >= 0; s--) {
        const prevIdx = (curIdx - s + waypoints.length * 2) % waypoints.length;
        initialTrack.push({
          lat: waypoints[prevIdx].lat,
          lon: waypoints[prevIdx].lon,
        });
      }

      return {
        id: config.id,
        name: config.name,
        mmsi: config.mmsi,
        imo: config.imo,
        type: config.type,
        flag: config.flag,
        routeId: config.routeId,
        currentWaypointIndex: curIdx,
        nextWaypointIndex: nextIdx,
        segmentProgress: 0.05,
        speedKnots: config.speedKnots,
        baseSpeed: config.speedKnots,
        headingDeg: initialBearing,
        coord: startCoord,
        track: initialTrack,
        destination: config.destination,
        lengthM: config.lengthM,
        grossTonnage: config.grossTonnage,
        aisGap: config.aisGap,
        aisGapMinutes: config.aisGapMinutes,
        status: '🟢 MOVING',
        lastHistoryTimestamp: Date.now(),
      };
    });
  }

  /**
   * Start the continuous simulation loop.
   */
  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaMs = Math.min(currentTime - this.lastTickTime, 250); // Cap frame delta to prevent jumps
      this.lastTickTime = currentTime;

      this.tick(deltaMs / 1000);

      // Broadcast at ~15-20 FPS (every 50-60ms) to ensure butter-smooth marker movement without flooding React
      if (currentTime - this.lastBroadcastTime >= 50) {
        this.lastBroadcastTime = currentTime;
        this.broadcast();
      }

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        this.animationFrameId = window.requestAnimationFrame(loop);
      }
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this.animationFrameId = window.requestAnimationFrame(loop);
    } else {
      // Fallback for non-browser environments
      this.intervalId = window.setInterval(() => {
        this.tick(0.05);
        this.broadcast();
      }, 50);
    }
  }

  /**
   * Stop the simulation loop.
   */
  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Advance simulation state by deltaSeconds.
   */
  private tick(deltaSeconds: number) {
    const now = Date.now();

    for (const vessel of this.vessels) {
      const route = this.routesMap.get(vessel.routeId) ?? MARITIME_ROUTES[0];
      const waypoints = route.waypoints;
      const fromWp = waypoints[vessel.currentWaypointIndex];
      const toWp = waypoints[vessel.nextWaypointIndex];

      const segmentDistKm = calculateDistance(fromWp, toWp);
      if (segmentDistKm < 0.1) {
        // Waypoints coincident, advance to next
        this.advanceWaypoint(vessel, waypoints);
        continue;
      }

      // Realistic nautical speed: 1 knot = 1.852 km/h
      // For demo visibility and visual appreciation of continuous movement,
      // we apply a smooth simulation scaling factor
      const simSpeedScale = 4.0; // Scaled so movement is visually discernible on map
      const kmPerHour = vessel.speedKnots * 1.852 * simSpeedScale;
      const kmTravelled = (kmPerHour / 3600) * deltaSeconds;

      vessel.segmentProgress += kmTravelled / segmentDistKm;

      if (vessel.segmentProgress >= 1.0) {
        // Waypoint reached! Smoothly transition to next waypoint
        this.advanceWaypoint(vessel, waypoints);
      } else {
        const candidateCoord = interpolatePosition(fromWp, toWp, vessel.segmentProgress);

        // Verify that candidate coordinate is safely on ocean water
        if (isValidOceanPosition(candidateCoord.lat, candidateCoord.lon)) {
          vessel.coord = candidateCoord;
        } else {
          // If candidate is off, skip to next validated waypoint
          this.advanceWaypoint(vessel, waypoints);
        }
      }

      // Update heading towards target waypoint
      const currentTarget = waypoints[vessel.nextWaypointIndex];
      const targetBearing = calculateBearing(vessel.coord, currentTarget);
      vessel.headingDeg = Math.round(normalizeHeading(targetBearing));

      // Realistic micro-fluctuation of speed around base speed (±0.3 kn)
      const speedOffset = Math.sin(now / 5000 + vessel.mmsi.charCodeAt(0)) * 0.4;
      vessel.speedKnots = Number((vessel.baseSpeed + speedOffset).toFixed(1));
      vessel.status = '🟢 MOVING';

      // Record position history throttled (every ~1.5 seconds) up to 150 points
      if (now - vessel.lastHistoryTimestamp > 1500) {
        vessel.lastHistoryTimestamp = now;
        vessel.track.push({ ...vessel.coord });
        if (vessel.track.length > 150) {
          vessel.track.shift();
        }
      }
    }
  }

  private advanceWaypoint(vessel: InternalSimulatedVessel, waypoints: Coordinate[]) {
    vessel.currentWaypointIndex = vessel.nextWaypointIndex;
    vessel.nextWaypointIndex = (vessel.nextWaypointIndex + 1) % waypoints.length;
    vessel.segmentProgress = 0;
    vessel.coord = { ...waypoints[vessel.currentWaypointIndex] };
  }

  private broadcast() {
    const publicVessels = this.getPublicVessels();
    for (const listener of this.listeners) {
      try {
        listener(publicVessels);
      } catch (err) {
        console.error('[VesselSimulationService] Listener error:', err);
      }
    }
  }

  public getPublicVessels(): Vessel[] {
    return this.vessels.map((v) => ({
      id: v.id,
      name: v.name,
      mmsi: v.mmsi,
      imo: v.imo,
      type: v.type,
      flag: v.flag,
      speedKnots: v.speedKnots,
      speed: v.speedKnots,
      headingDeg: v.headingDeg,
      heading: v.headingDeg,
      headingLabel: getHeadingLabel(v.headingDeg),
      coord: { ...v.coord },
      latitude: v.coord.lat,
      longitude: v.coord.lon,
      lastSeen: new Date().toISOString(),
      track: v.track.map((p) => ({ ...p })),
      aisGap: v.aisGap,
      aisGapMinutes: v.aisGapMinutes,
      destination: v.destination,
      lengthM: v.lengthM,
      grossTonnage: v.grossTonnage,
    }));
  }

  public subscribe(listener: VesselUpdateListener): () => void {
    this.listeners.add(listener);

    // Provide immediate snapshot
    listener(this.getPublicVessels());

    // Auto-start if not running
    if (!this.isRunning) {
      this.start();
    }

    return () => {
      this.listeners.delete(listener);
      // Keep running even if listeners temporarily drop during React route changes
    };
  }

  public getVesselById(id: string): Vessel | undefined {
    return this.getPublicVessels().find((v) => v.id === id);
  }
}

// Export singleton instance
export const vesselSimulationService = new VesselSimulationService();

// Ensure simulation starts automatically on load
if (typeof window !== 'undefined') {
  vesselSimulationService.start();
}
