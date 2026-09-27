export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type SpillStatus = 'Detected' | 'Investigating' | 'Confirmed' | 'Resolved';

export type SpillClass = 'confirmed' | 'possible';

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface SpillDrift {
  directionDeg: number;
  directionLabel: string;
  distanceKm: number;
  currentSpeedKnots: number;
}

export interface SpillCorrelatedVessel {
  vesselId: string;
  vesselName: string;
  mmsi: string;
  type: VesselType;
  rank: number;
  overallScore: number;
  distanceMatch: number;
  timeMatch: number;
  trajectoryMatch: number;
  driftCompatibility: number;
  aisContinuity: number;
  explanation: string;
}

export interface Spill {
  id: string;
  location: string;
  region: string;
  coord: Coordinate;
  detectedAt: string;
  areaKm2: number;
  confidence: number;
  risk: RiskLevel;
  status: SpillStatus;
  classification: SpillClass;
  satellite: string;
  polarization: 'VV' | 'VH';
  originCoord: Coordinate;
  suspectCount: number;
  polygon?: Coordinate[];
  drift?: SpillDrift;
  correlatedVessels?: SpillCorrelatedVessel[];
  primarySuspectId?: string;
}

export type VesselType = 'Oil Tanker' | 'Cargo Ship' | 'Fishing' | 'Passenger' | 'Tanker';

export interface Vessel {
  id: string;
  name: string;
  mmsi: string;
  imo: string;
  type: VesselType;
  flag: string;
  speedKnots: number;
  headingDeg: number;
  headingLabel: string;
  coord: Coordinate;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  lastSeen: string;
  track: Coordinate[];
  aisGap: boolean;
  aisGapMinutes: number;
  destination: string;
  lengthM: number;
  grossTonnage: number;
}

export interface SuspectVessel {
  rank: number;
  vesselId: string;
  name: string;
  mmsi: string;
  type: VesselType;
  distanceKm: number;
  timeDiffMinutes: number;
  aisGap: boolean;
  confidence: number;
  scores: {
    distance: number;
    timeCorrelation: number;
    aisGapSuspicion: number;
    vesselTypeRisk: number;
  };
}

export interface SatelliteImage {
  id: string;
  satellite: string;
  captureDate: string;
  location: string;
  resolutionM: number;
  polarization: 'VV' | 'VH';
  status: 'Available' | 'Processing' | 'Analyzed';
  sizeGb: number;
  thumbnail: string;
  spillDetected: boolean;
}

export type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Alert {
  id: string;
  priority: AlertPriority;
  title: string;
  detail: string;
  meta: {label: string;value: string;}[];
  time: string;
  actionLabel: string;
  actionTo: string;
  unread: boolean;
}

export interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  tone: 'neutral' | 'warn' | 'danger' | 'ok';
}

export interface NavItem {
  label: string;
  to: string;
  icon: string;
  badge?: number;
}