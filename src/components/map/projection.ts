import type { Coordinate } from '../../types';

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export const defaultBounds: Bounds = { minLat: 15.5, maxLat: 22.5, minLon: 68, maxLon: 76 };

export const wideBounds: Bounds = { minLat: 6, maxLat: 26, minLon: 55, maxLon: 84 };

/** Projects a geographic coordinate into 0-100 percentage space of the map frame. */
export function project(coord: Coordinate, bounds: Bounds = defaultBounds) {
  const x = (coord.lon - bounds.minLon) / (bounds.maxLon - bounds.minLon) * 100;
  const y = (bounds.maxLat - coord.lat) / (bounds.maxLat - bounds.minLat) * 100;
  return { x: Math.max(-10, Math.min(110, x)), y: Math.max(-10, Math.min(110, y)) };
}

export function polyline(coords: Coordinate[], bounds: Bounds = defaultBounds) {
  return coords.
  map((c) => {
    const p = project(c, bounds);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).
  join(' ');
}

export function distanceKm(a: Coordinate, b: Coordinate) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h =
  Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}