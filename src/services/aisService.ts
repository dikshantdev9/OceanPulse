import type { Coordinate, Vessel } from '../types';
import { createMockLiveVessels, getLiveTrackingMode } from './liveTrackingService';

export interface AISProvider {
  getLiveVessels(): Promise<Vessel[]>;
  getNearbyVessels(spillCoord: Coordinate): Promise<Vessel[]>;
  getVesselHistory(vesselId: string): Promise<Coordinate[]>;
}

class DemoAISProvider implements AISProvider {
  async getLiveVessels(): Promise<Vessel[]> {
    return createMockLiveVessels();
  }

  async getNearbyVessels(spillCoord: Coordinate): Promise<Vessel[]> {
    return createMockLiveVessels().filter((vessel) => {
      const distance = Math.abs(vessel.coord.lat - spillCoord.lat) + Math.abs(vessel.coord.lon - spillCoord.lon);
      return distance < 1.4;
    });
  }

  async getVesselHistory(vesselId: string): Promise<Coordinate[]> {
    const vessel = createMockLiveVessels().find((entry) => entry.id === vesselId);
    return vessel?.track ?? [];
  }
}

class LiveAISProvider implements AISProvider {
  async getLiveVessels(): Promise<Vessel[]> {
    const apiUrl = import.meta.env.VITE_AIS_API_URL;
    if (!apiUrl) {
      return createMockLiveVessels();
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('AIS API request failed');
      }

      const payload = await response.json();
      return Array.isArray(payload) ? payload : createMockLiveVessels();
    } catch {
      return createMockLiveVessels();
    }
  }

  async getNearbyVessels(spillCoord: Coordinate): Promise<Vessel[]> {
    const vessels = await this.getLiveVessels();
    return vessels.filter((vessel) => {
      const distance = Math.hypot(vessel.coord.lat - spillCoord.lat, vessel.coord.lon - spillCoord.lon);
      return distance < 0.8;
    });
  }

  async getVesselHistory(vesselId: string): Promise<Coordinate[]> {
    const vessels = await this.getLiveVessels();
    const vessel = vessels.find((entry) => entry.id === vesselId);
    return vessel?.track ?? [];
  }
}

export const aisService: AISProvider = getLiveTrackingMode() === 'LIVE' ? new LiveAISProvider() : new DemoAISProvider();
