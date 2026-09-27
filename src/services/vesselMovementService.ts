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

export interface InternalVesselState {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  type: VesselType;
  flag: string;
  routeId: string;
  currentWaypointIndex: number;
  nextWaypointIndex: number;
  segmentProgress: number; // 0.0 to 1.0
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
  suspectRank?: number;
  status: string;
  lastTrailDropTime: number;
  lastSeen: string;
}

export type VesselMotionListener = (vessels: Vessel[]) => void;

class VesselMovementService {
  private vessels: InternalVesselState[] = [];
  private routesMap = new Map<string, MaritimeRoute>();
  private uiListeners = new Set<VesselMotionListener>();
  private motionListeners = new Set<VesselMotionListener>();

  private isRunning: boolean = false;
  private isPausedState: boolean = false;
  private speedMultiplier: number = 1.0;

  // Base simulation acceleration factor:
  // At 1.0x speed, a 15-knot vessel covers ~150km in ~90 seconds.
  // This yields a smooth, observable glide of ~1-2 pixels/sec at zoom 6.
  private readonly BASE_SPEED_SCALE = 160.0;

  private animationFrameId: number | null = null;
  private intervalId: number | null = null;
  private lastFrameTime: number = performance.now();
  private lastUiBroadcastTime: number = 0;
  private lastMotionBroadcastTime: number = 0;

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
    const now = Date.now();
    this.vessels = DEMO_VESSEL_CONFIGS.map((config, index) => {
      const route = this.routesMap.get(config.routeId) ?? MARITIME_ROUTES[0];
      const waypoints = route.waypoints;
      const numWp = waypoints.length;

      const curIdx = config.startWaypointIndex % numWp;
      const nextIdx = (curIdx + 1) % numWp;

      const curWp = waypoints[curIdx];
      const nextWp = waypoints[nextIdx];

      // Stagger start progress slightly so vessels on the same route aren't bunched
      const initialProgress = ((index * 0.17) % 0.8) + 0.05;
      const startCoord = interpolatePosition(curWp, nextWp, initialProgress);
      const bearing = Math.round(calculateBearing(startCoord, nextWp));

      // Build initial breadcrumb trail
      const initialTrack: Coordinate[] = [];
      const trailPoints = 8;
      for (let t = trailPoints; t >= 1; t--) {
        const pIdx = (curIdx - t + numWp * 4) % numWp;
        initialTrack.push({ lat: waypoints[pIdx].lat, lon: waypoints[pIdx].lon });
      }
      initialTrack.push(startCoord);

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
        segmentProgress: initialProgress,
        speedKnots: config.speedKnots,
        baseSpeed: config.speedKnots,
        headingDeg: bearing,
        coord: startCoord,
        track: initialTrack,
        destination: config.destination,
        lengthM: config.lengthM,
        grossTonnage: config.grossTonnage,
        aisGap: config.aisGap,
        aisGapMinutes: config.aisGapMinutes,
        suspectRank: config.suspectRank,
        status: '🟢 MOVING',
        lastTrailDropTime: now - Math.random() * 2000,
        lastSeen: new Date().toISOString(),
      };
    });
  }

  /**
   * Start the continuous movement loop.
   */
  public startMovement() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaMs = Math.min(currentTime - this.lastFrameTime, 200); // Guard against huge background jumps
      this.lastFrameTime = currentTime;

      if (!this.isPausedState && deltaMs > 0) {
        this.tick(deltaMs / 1000);
      }

      // 1. High-frequency motion broadcast (for Google Maps marker translation ~30 FPS / every 33ms)
      if (currentTime - this.lastMotionBroadcastTime >= 33) {
        this.lastMotionBroadcastTime = currentTime;
        this.broadcastMotion();
      }

      // 2. Throttled UI broadcast (for React telemetry panel & timestamp ~1 Hz / every 1000ms)
      if (currentTime - this.lastUiBroadcastTime >= 1000) {
        this.lastUiBroadcastTime = currentTime;
        this.broadcastUi();
      }

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        this.animationFrameId = window.requestAnimationFrame(loop);
      }
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this.animationFrameId = window.requestAnimationFrame(loop);
    } else {
      this.intervalId = window.setInterval(() => {
        if (!this.isPausedState) {
          this.tick(0.05);
        }
        this.broadcastMotion();
        if (Date.now() - this.lastUiBroadcastTime >= 1000) {
          this.lastUiBroadcastTime = Date.now();
          this.broadcastUi();
        }
      }, 50);
    }
  }

  /**
   * Stop the movement loop entirely.
   */
  public stopMovement() {
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
   * Play / Pause simulation.
   */
  public setPaused(paused: boolean) {
    this.isPausedState = paused;
    for (const vessel of this.vessels) {
      vessel.status = paused ? '⏸ PAUSED' : '🟢 MOVING';
    }
    this.broadcastMotion();
    this.broadcastUi();
  }

  public togglePlayPause(): boolean {
    this.setPaused(!this.isPausedState);
    return !this.isPausedState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  /**
   * Speed multiplier: 0.5x, 1.0x, 2.0x, 5.0x
   */
  public setSpeedMultiplier(multiplier: number) {
    this.speedMultiplier = Math.max(0.1, Math.min(10.0, multiplier));
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  /**
   * Physics & Geographic tick
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
        this.advanceWaypoint(vessel, waypoints);
        continue;
      }

      // Compute speed with multiplier and base scale
      // 1 knot = 1.852 km/h
      const effectiveScale = this.BASE_SPEED_SCALE * this.speedMultiplier;
      const kmPerHour = vessel.speedKnots * 1.852 * effectiveScale;
      const kmTravelled = (kmPerHour / 3600) * deltaSeconds;

      vessel.segmentProgress += kmTravelled / segmentDistKm;

      if (vessel.segmentProgress >= 1.0) {
        // Leg completed, advance to next waypoint
        this.advanceWaypoint(vessel, waypoints);
      } else {
        const candidateCoord = interpolatePosition(fromWp, toWp, vessel.segmentProgress);

        // Keep strictly in water
        if (isValidOceanPosition(candidateCoord.lat, candidateCoord.lon)) {
          vessel.coord = candidateCoord;
        } else {
          this.advanceWaypoint(vessel, waypoints);
        }
      }

      // Recalculate dynamic heading towards target
      const targetWp = waypoints[vessel.nextWaypointIndex];
      const targetBearing = calculateBearing(vessel.coord, targetWp);
      vessel.headingDeg = Math.round(normalizeHeading(targetBearing));

      // Gentle realistic sea fluctuation (±0.4 kn)
      const speedFluctuation = Math.sin(now / 4000 + vessel.mmsi.charCodeAt(0)) * 0.3;
      vessel.speedKnots = Number((vessel.baseSpeed + speedFluctuation).toFixed(1));
      vessel.lastSeen = new Date().toISOString();

      // Drop trail breadcrumbs periodically (every 1.5 seconds)
      if (now - vessel.lastTrailDropTime >= 1500) {
        vessel.lastTrailDropTime = now;
        vessel.track.push({ ...vessel.coord });
        if (vessel.track.length > 50) {
          vessel.track.shift();
        }
      }
    }
  }

  private advanceWaypoint(vessel: InternalVesselState, waypoints: Coordinate[]) {
    vessel.currentWaypointIndex = vessel.nextWaypointIndex;
    vessel.nextWaypointIndex = (vessel.nextWaypointIndex + 1) % waypoints.length;
    vessel.segmentProgress = 0.0;
    vessel.coord = { ...waypoints[vessel.currentWaypointIndex] };
  }

  private broadcastMotion() {
    const list = this.getPublicVessels();
    for (const listener of this.motionListeners) {
      try {
        listener(list);
      } catch (err) {
        console.error('[VesselMovementService] Motion listener error:', err);
      }
    }
  }

  private broadcastUi() {
    const list = this.getPublicVessels();
    for (const listener of this.uiListeners) {
      try {
        listener(list);
      } catch (err) {
        console.error('[VesselMovementService] UI listener error:', err);
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
      lastSeen: v.lastSeen,
      track: v.track.map((p) => ({ ...p })),
      aisGap: v.aisGap,
      aisGapMinutes: v.aisGapMinutes,
      destination: v.destination,
      lengthM: v.lengthM,
      grossTonnage: v.grossTonnage,
    }));
  }

  /**
   * Subscribe for Google Maps continuous visual motion (high-rate updates).
   */
  public subscribeMotion(listener: VesselMotionListener): () => void {
    this.motionListeners.add(listener);
    listener(this.getPublicVessels());
    if (!this.isRunning) {
      this.startMovement();
    }
    return () => {
      this.motionListeners.delete(listener);
    };
  }

  /**
   * Subscribe for React UI state updates (throttled ~1 Hz).
   */
  public subscribeUi(listener: VesselMotionListener): () => void {
    this.uiListeners.add(listener);
    listener(this.getPublicVessels());
    if (!this.isRunning) {
      this.startMovement();
    }
    return () => {
      this.uiListeners.delete(listener);
    };
  }

  public getVesselById(id: string): Vessel | undefined {
    return this.getPublicVessels().find((v) => v.id === id);
  }

  /**
   * Format current live simulated time: HH:mm:ss
   */
  public getCurrentFormattedTime(): string {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  }
}

export const vesselMovementService = new VesselMovementService();

// Start movement immediately
if (typeof window !== 'undefined') {
  vesselMovementService.startMovement();
}
