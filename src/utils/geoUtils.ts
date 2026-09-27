import type { Coordinate } from '../types';

/**
 * Calculate the initial bearing (forward azimuth) from point A to point B in degrees [0, 360).
 * 0° = North, 90° = East, 180° = South, 270° = West.
 */
export function calculateBearing(start: Coordinate, end: Coordinate): number {
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const dLon = ((end.lon - start.lon) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Calculate great-circle distance between two points in kilometers (Haversine formula).
 */
export function calculateDistance(a: Coordinate, b: Coordinate): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(hav)));
}

/**
 * Interpolate smoothly between two coordinates using fraction t (0 <= t <= 1).
 */
export function interpolatePosition(from: Coordinate, to: Coordinate, t: number): Coordinate {
  const clampedT = Math.max(0, Math.min(1, t));
  return {
    lat: from.lat + (to.lat - from.lat) * clampedT,
    lon: from.lon + (to.lon - from.lon) * clampedT,
  };
}

/**
 * Normalize an angle to [0, 360) degrees.
 */
export function normalizeHeading(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Convert numerical heading degrees into 8-point compass label.
 */
export function getHeadingLabel(deg: number): string {
  const directions = [
    'North',
    'North-East',
    'East',
    'South-East',
    'South',
    'South-West',
    'West',
    'North-West',
  ];
  const normalized = normalizeHeading(deg);
  const index = Math.round(normalized / 45) % directions.length;
  return directions[index];
}

/**
 * Checks if a point is inside a simple 2D polygon (Ray casting algorithm).
 */
function isPointInPolygon(point: Coordinate, polygon: Coordinate[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon, yi = polygon[i].lat;
    const xj = polygon[j].lon, yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Approximate coastal land polygons for peninsular India and nearby landmasses
 * to prevent vessels from inadvertently crossing onto land.
 */
const INDIAN_PENINSULA_LAND: Coordinate[] = [
  { lat: 8.08, lon: 77.55 }, // Kanyakumari
  { lat: 9.92, lon: 76.26 }, // Kochi
  { lat: 11.25, lon: 75.77 }, // Kozhikode
  { lat: 12.87, lon: 74.84 }, // Mangalore
  { lat: 15.38, lon: 73.81 }, // Goa
  { lat: 16.99, lon: 73.28 }, // Ratnagiri
  { lat: 18.92, lon: 72.83 }, // Mumbai
  { lat: 20.00, lon: 72.75 }, // Daman
  { lat: 21.16, lon: 72.82 }, // Surat
  { lat: 21.65, lon: 72.20 }, // Bhavnagar (Gulf of Khambhat)
  { lat: 20.75, lon: 70.98 }, // Diu
  { lat: 20.88, lon: 70.40 }, // Veraval
  { lat: 21.62, lon: 69.60 }, // Porbandar
  { lat: 22.24, lon: 68.96 }, // Dwarka
  { lat: 22.80, lon: 69.70 }, // Kandla (Gulf of Kutch)
  { lat: 23.50, lon: 68.50 }, // Kutch border
  { lat: 27.00, lon: 70.00 }, // Rajasthan
  { lat: 28.00, lon: 77.00 }, // North India
  { lat: 24.00, lon: 87.00 }, // East India
  { lat: 21.80, lon: 87.80 }, // West Bengal coast
  { lat: 20.25, lon: 86.67 }, // Paradip
  { lat: 17.68, lon: 83.21 }, // Visakhapatnam
  { lat: 16.98, lon: 82.24 }, // Kakinada
  { lat: 15.82, lon: 80.35 }, // Machilipatnam
  { lat: 13.08, lon: 80.28 }, // Chennai
  { lat: 11.93, lon: 79.83 }, // Puducherry
  { lat: 10.76, lon: 79.84 }, // Nagapattinam
  { lat: 9.28, lon: 79.31 },  // Rameswaram
  { lat: 8.76, lon: 78.13 },  // Tuticorin
];

const SRI_LANKA_LAND: Coordinate[] = [
  { lat: 9.80, lon: 80.20 },
  { lat: 8.58, lon: 81.23 },
  { lat: 6.90, lon: 81.85 },
  { lat: 5.92, lon: 80.55 },
  { lat: 6.93, lon: 79.84 },
  { lat: 8.00, lon: 79.70 },
];

/**
 * Validates whether a coordinate is strictly over water in our oceanic theater of operations.
 * Must be within regional ocean boundaries and outside land polygons.
 */
export function isValidOceanPosition(lat: number, lon: number): boolean {
  // Broad maritime theater bounds (Arabian Sea, Bay of Bengal, Northern Indian Ocean)
  if (lat < 5.0 || lat > 26.0 || lon < 55.0 || lon > 92.0) {
    return false;
  }

  const coord: Coordinate = { lat, lon };

  // Check if inside mainland India polygon
  if (isPointInPolygon(coord, INDIAN_PENINSULA_LAND)) {
    return false;
  }

  // Check if inside Sri Lanka polygon
  if (isPointInPolygon(coord, SRI_LANKA_LAND)) {
    return false;
  }

  return true;
}
