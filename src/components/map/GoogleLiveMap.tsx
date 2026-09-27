import React, { useEffect, useRef, useState } from 'react';
import type { Coordinate, Spill, Vessel } from '../../types';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { vesselMovementService } from '../../services/vesselMovementService';

interface GoogleLiveMapProps {
  vessels: Vessel[];
  spills: Spill[];
  selectedVesselId?: string | null;
  selectedSpillId?: string | null;
  followVesselId?: string | null;
  backtrackSpillId?: string | null;
  onSelectVessel?: (vessel: Vessel) => void;
  onSelectSpill?: (spill: Spill) => void;
  onSelectOrigin?: (origin: Coordinate, spill: Spill) => void;
  showVessels?: boolean;
  showSpills?: boolean;
  showOrigins?: boolean;
  showCorrelation?: boolean;
  showTrails?: boolean;
  mapView?: 'terrain' | 'satellite';
  suspectIds?: string[];
  className?: string;
}

type LoaderState =
  | 'checking'
  | 'missing-key'
  | 'invalid-key'
  | 'maps-disabled'
  | 'referrer-restriction'
  | 'billing'
  | 'loader-error'
  | 'loaded';

interface VesselMarkerState {
  marker: google.maps.Marker;
  route: google.maps.Polyline;
  infoWindow: google.maps.InfoWindow;
}

interface SpillMarkerState {
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

interface OriginMarkerState {
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

interface CorrelationLineState {
  line: google.maps.Polyline;
}

const createDiagnosticMessage = (state: LoaderState) => {
  switch (state) {
    case 'missing-key':
      return 'Missing API key: add VITE_GOOGLE_MAPS_API_KEY to the Vite project root .env file.';
    case 'invalid-key':
      return 'Invalid API key: the Google Maps API key is rejected. Check the key value, project, and API restrictions.';
    case 'maps-disabled':
      return 'Maps JavaScript API is not enabled for this Google Cloud project.';
    case 'referrer-restriction':
      return 'API key referrer restriction: the app origin is not allowed by the API key restrictions.';
    case 'billing':
      return 'Billing or configuration issue: enable billing for the Google Cloud project and confirm the Maps JavaScript API is enabled.';
    case 'loader-error':
      return 'Google Maps loader implementation error: the script failed to load or window.google.maps never initialized.';
    default:
      return '';
  }
};

export function GoogleLiveMap({
  vessels,
  spills,
  selectedVesselId,
  selectedSpillId,
  followVesselId,
  backtrackSpillId,
  onSelectVessel,
  onSelectSpill,
  onSelectOrigin,
  showVessels = true,
  showSpills = true,
  showOrigins = true,
  showCorrelation = true,
  showTrails = true,
  mapView = 'terrain',
  suspectIds = [],
  className,
}: GoogleLiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Persistent overlay registries
  const vesselMarkersRef = useRef<Map<string, VesselMarkerState>>(new Map());
  const spillMarkersRef = useRef<Map<string, SpillMarkerState>>(new Map());
  const spillPolygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());
  const originMarkersRef = useRef<Map<string, OriginMarkerState>>(new Map());
  const driftLinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const correlationLinesRef = useRef<Map<string, CorrelationLineState>>(new Map());

  const prevSelectedVesselRef = useRef<string | null | undefined>(undefined);
  const prevSelectedSpillRef = useRef<string | null | undefined>(undefined);

  // Synchronized state refs for 30fps animation loop
  const followVesselIdRef = useRef(followVesselId);
  useEffect(() => { followVesselIdRef.current = followVesselId; }, [followVesselId]);
  const selectedVesselIdRef = useRef(selectedVesselId);
  useEffect(() => { selectedVesselIdRef.current = selectedVesselId; }, [selectedVesselId]);
  const selectedSpillIdRef = useRef(selectedSpillId);
  useEffect(() => { selectedSpillIdRef.current = selectedSpillId; }, [selectedSpillId]);
  const suspectIdsRef = useRef(suspectIds);
  useEffect(() => { suspectIdsRef.current = suspectIds; }, [suspectIds]);
  const showTrailsRef = useRef(showTrails);
  useEffect(() => { showTrailsRef.current = showTrails; }, [showTrails]);
  const showVesselsRef = useRef(showVessels);
  useEffect(() => { showVesselsRef.current = showVessels; }, [showVessels]);
  const spillsRef = useRef(spills);
  useEffect(() => { spillsRef.current = spills; }, [spills]);
  const showCorrelationRef = useRef(showCorrelation);
  useEffect(() => { showCorrelationRef.current = showCorrelation; }, [showCorrelation]);

  const [loaderState, setLoaderState] = useState<LoaderState>('checking');
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initialize Google Maps script and instance once
  useEffect(() => {
    const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim();

    const setDiagnostic = (state: LoaderState, data?: string) => {
      setLoaderState(state);
      setIsLoaded(false);

      const message = data ?? createDiagnosticMessage(state);
      console.error(`[OceanPulse Google Maps] ${message}`);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps) {
        setDiagnostic('loader-error');
        return;
      }

      if (mapInstanceRef.current) {
        setIsLoaded(true);
        return;
      }

      // Initial viewport: Centered approximately around the Arabian Sea
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 18.5, lng: 68.5 },
        zoom: 6,
        mapTypeId: mapView === 'satellite' ? 'satellite' : 'terrain',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'greedy',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0b1728' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#c7d8ee' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1728' }] },
          { featureType: 'water', stylers: [{ color: '#0d3b5d' }] },
          { featureType: 'landscape', stylers: [{ color: '#0b1728' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', stylers: [{ visibility: 'off' }] },
        ],
      });

      mapInstanceRef.current = map;
      setLoaderState('loaded');
      setIsLoaded(true);
    };

    if (!key) {
      setDiagnostic('missing-key');
      return;
    }

    const handleAuthFailure = () => {
      setDiagnostic(
        'invalid-key',
        'Google Maps authentication failed. Check the API key, restrictions, and Google Cloud project settings.'
      );
    };

    const previousFailureHandler = (window as typeof window & { gm_authFailure?: () => void }).gm_authFailure;
    (window as typeof window & { gm_authFailure?: () => void }).gm_authFailure = handleAuthFailure;

    if (window.google?.maps) {
      initializeMap();
      return () => {
        (window as typeof window & { gm_authFailure?: () => void }).gm_authFailure = previousFailureHandler;
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps="oceanpulse"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeMap, { once: true });
      existingScript.addEventListener('error', () => setDiagnostic('loader-error'), { once: true });
      return () => {
        (window as typeof window & { gm_authFailure?: () => void }).gm_authFailure = previousFailureHandler;
      };
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps', 'oceanpulse');
    script.addEventListener('load', initializeMap, { once: true });
    script.addEventListener('error', () => setDiagnostic('loader-error'), { once: true });
    document.head.appendChild(script);

    return () => {
      (window as typeof window & { gm_authFailure?: () => void }).gm_authFailure = previousFailureHandler;
      script.removeEventListener('load', initializeMap);
      script.removeEventListener('error', () => setDiagnostic('loader-error'));
    };
  }, []);

  const { resolvedTheme } = useTheme();

  // 2. Map view mode (terrain / satellite) and dynamic theme styling
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;
    map.setMapTypeId(mapView === 'satellite' ? 'satellite' : 'terrain');

    if (mapView !== 'satellite') {
      const isLight = resolvedTheme === 'light';
      map.setOptions({
        styles: isLight
          ? [
              { elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
              { featureType: 'water', stylers: [{ color: '#bae6fd' }] },
              { featureType: 'landscape', stylers: [{ color: '#e2e8f0' }] },
              { featureType: 'poi', stylers: [{ visibility: 'off' }] },
              { featureType: 'road', stylers: [{ visibility: 'off' }] },
            ]
          : [
              { elementType: 'geometry', stylers: [{ color: '#0b1728' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#c7d8ee' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1728' }] },
              { featureType: 'water', stylers: [{ color: '#0d3b5d' }] },
              { featureType: 'landscape', stylers: [{ color: '#0b1728' }] },
              { featureType: 'poi', stylers: [{ visibility: 'off' }] },
              { featureType: 'road', stylers: [{ visibility: 'off' }] },
            ],
      });
    }
  }, [isLoaded, mapView, resolvedTheme]);

  // 3. Realistic Oil Spill Areas (google.maps.Polygon) & Centroid Markers (🛢️)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (!showSpills) {
      for (const polygon of spillPolygonsRef.current.values()) {
        polygon.setMap(null);
      }
      for (const entry of spillMarkersRef.current.values()) {
        entry.marker.setMap(null);
        entry.infoWindow.close();
      }
      return;
    }

    const activeSpillIds = new Set(spills.map((s) => s.id));

    // Remove obsolete polygons
    for (const [id, poly] of spillPolygonsRef.current.entries()) {
      if (!activeSpillIds.has(id)) {
        poly.setMap(null);
        spillPolygonsRef.current.delete(id);
      }
    }

    // Remove obsolete markers
    for (const [id, entry] of spillMarkersRef.current.entries()) {
      if (!activeSpillIds.has(id)) {
        entry.marker.setMap(null);
        entry.infoWindow.close();
        spillMarkersRef.current.delete(id);
      }
    }

    // SVG path for a distinctive oil droplet / slick marker icon
    const oilDropSvg = 'M 0,-12 C -6,-5 -9,0 -9,6 A 9,9 0 0,0 9,6 C 9,0 6,-5 0,-12 Z';

    for (const spill of spills) {
      const isSelected = selectedSpillId === spill.id;

      // 3A. Render or update irregular oil slick polygon
      if (spill.polygon && spill.polygon.length >= 3) {
        let polygon = spillPolygonsRef.current.get(spill.id);
        const polyCoords = spill.polygon.map((p) => ({ lat: p.lat, lng: p.lon }));

        if (!polygon) {
          polygon = new google.maps.Polygon({
            paths: polyCoords,
            map,
            strokeColor: isSelected ? '#38bdf8' : (spill.risk === 'HIGH' ? '#fb4d6a' : '#f59e0b'),
            strokeOpacity: 0.95,
            strokeWeight: isSelected ? 3 : 2,
            fillColor: isSelected ? '#fb7185' : (spill.risk === 'HIGH' ? '#f43f5e' : '#f59e0b'),
            fillOpacity: isSelected ? 0.48 : 0.32,
            clickable: true,
            zIndex: isSelected ? 10 : 5,
          });

          polygon.addListener('click', () => {
            onSelectSpill?.(spill);
            const entry = spillMarkersRef.current.get(spill.id);
            if (entry) {
              entry.infoWindow.setContent(generateSpillInfoWindowContent(spill));
              entry.infoWindow.open({ map, anchor: entry.marker });
            }
          });

          spillPolygonsRef.current.set(spill.id, polygon);
        } else {
          polygon.setMap(map);
          polygon.setPaths(polyCoords);
          polygon.setOptions({
            strokeColor: isSelected ? '#38bdf8' : (spill.risk === 'HIGH' ? '#fb4d6a' : '#f59e0b'),
            strokeWeight: isSelected ? 3 : 2,
            fillColor: isSelected ? '#fb7185' : (spill.risk === 'HIGH' ? '#f43f5e' : '#f59e0b'),
            fillOpacity: isSelected ? 0.50 : 0.32,
            zIndex: isSelected ? 10 : 5,
          });
        }
      }

      // 3B. Render or update centroid marker 🛢️
      let markerEntry = spillMarkersRef.current.get(spill.id);
      if (!markerEntry) {
        const marker = new google.maps.Marker({
          position: { lat: spill.coord.lat, lng: spill.coord.lon },
          map,
          title: `🛢️ Oil Spill Area: ${spill.id} (${spill.areaKm2} km²)`,
          clickable: true,
          zIndex: isSelected ? 15 : 8,
          icon: {
            path: oilDropSvg,
            scale: isSelected ? 1.6 : 1.3,
            fillColor: isSelected ? '#fb7185' : (spill.risk === 'HIGH' ? '#e11d48' : '#d97706'),
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: generateSpillInfoWindowContent(spill),
        });

        marker.addListener('click', () => {
          infoWindow.setContent(generateSpillInfoWindowContent(spill));
          infoWindow.open({ map, anchor: marker });
          onSelectSpill?.(spill);
        });

        markerEntry = { marker, infoWindow };
        spillMarkersRef.current.set(spill.id, markerEntry);
      } else {
        markerEntry.marker.setMap(map);
        markerEntry.marker.setPosition({ lat: spill.coord.lat, lng: spill.coord.lon });
        markerEntry.marker.setZIndex(isSelected ? 15 : 8);
        markerEntry.marker.setIcon({
          path: oilDropSvg,
          scale: isSelected ? 1.6 : 1.3,
          fillColor: isSelected ? '#fb7185' : (spill.risk === 'HIGH' ? '#e11d48' : '#d97706'),
          fillOpacity: 1,
          strokeColor: isSelected ? '#38bdf8' : '#ffffff',
          strokeWeight: isSelected ? 2.5 : 2,
        });
      }
    }
  }, [isLoaded, showSpills, spills, selectedSpillId, onSelectSpill]);

  // 4. Estimated Spill Origin (🟡 Yellow diamond) & Drift Vectors (──▶)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (!showOrigins) {
      for (const entry of originMarkersRef.current.values()) {
        entry.marker.setMap(null);
        entry.infoWindow.close();
      }
      for (const line of driftLinesRef.current.values()) {
        line.setMap(null);
      }
      return;
    }

    const activeOrigins = new Set(spills.filter((s) => s.originCoord).map((s) => `origin-${s.id}`));

    for (const [id, entry] of originMarkersRef.current.entries()) {
      if (!activeOrigins.has(id)) {
        entry.marker.setMap(null);
        entry.infoWindow.close();
        originMarkersRef.current.delete(id);
      }
    }

    for (const [id, line] of driftLinesRef.current.entries()) {
      if (!activeOrigins.has(id)) {
        line.setMap(null);
        driftLinesRef.current.delete(id);
      }
    }

    for (const spill of spills) {
      if (!spill.originCoord) continue;
      const key = `origin-${spill.id}`;
      const isSelected = selectedSpillId === spill.id;

      // 4A. Drift Vector Line with forward arrow (Origin ──▶ Current Spill Area)
      let driftLine = driftLinesRef.current.get(key);
      const driftPath = [
        { lat: spill.originCoord.lat, lng: spill.originCoord.lon },
        { lat: spill.coord.lat, lng: spill.coord.lon },
      ];

      if (!driftLine) {
        driftLine = new google.maps.Polyline({
          path: driftPath,
          geodesic: true,
          strokeColor: isSelected ? '#f59e0b' : '#eab308',
          strokeOpacity: 0.85,
          strokeWeight: isSelected ? 3.5 : 2.5,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                fillColor: '#eab308',
                fillOpacity: 1,
                strokeColor: '#0f172a',
                strokeWeight: 1,
              },
              offset: '55%',
            },
          ],
          map,
          zIndex: 6,
        });

        driftLine.addListener('click', () => {
          onSelectSpill?.(spill);
        });

        driftLinesRef.current.set(key, driftLine);
      } else {
        driftLine.setMap(map);
        driftLine.setPath(driftPath);
        driftLine.setOptions({
          strokeColor: isSelected ? '#f59e0b' : '#eab308',
          strokeWeight: isSelected ? 3.5 : 2.5,
        });
      }

      // 4B. Yellow Diamond Origin Marker
      let entry = originMarkersRef.current.get(key);
      if (!entry) {
        const marker = new google.maps.Marker({
          position: { lat: spill.originCoord.lat, lng: spill.originCoord.lon },
          map,
          title: `🟡 Estimated Spill Origin · ${spill.id}`,
          clickable: true,
          zIndex: isSelected ? 14 : 7,
          icon: {
            path: 'M 0,-7 L 7,0 L 0,7 L -7,0 Z',
            fillColor: '#eab308',
            fillOpacity: 1,
            scale: isSelected ? 2.2 : 1.8,
            strokeColor: '#0f172a',
            strokeWeight: 1.5,
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: generateOriginInfoWindowContent(spill),
        });

        marker.addListener('click', () => {
          infoWindow.setContent(generateOriginInfoWindowContent(spill));
          infoWindow.open({ map, anchor: marker });
          onSelectOrigin?.(spill.originCoord, spill);
        });

        entry = { marker, infoWindow };
        originMarkersRef.current.set(key, entry);
      } else {
        entry.marker.setMap(map);
        entry.marker.setPosition({ lat: spill.originCoord.lat, lng: spill.originCoord.lon });
        entry.marker.setZIndex(isSelected ? 14 : 7);
        entry.marker.setIcon({
          path: 'M 0,-7 L 7,0 L 0,7 L -7,0 Z',
          fillColor: '#eab308',
          fillOpacity: 1,
          scale: isSelected ? 2.2 : 1.8,
          strokeColor: '#0f172a',
          strokeWeight: isSelected ? 2.5 : 1.5,
        });
      }
    }
  }, [isLoaded, showOrigins, spills, selectedSpillId, onSelectOrigin, onSelectSpill]);

  // 5. Smooth continuous vessel updates (Marker Recycling without destroying map objects)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (!showVessels) {
      for (const entry of vesselMarkersRef.current.values()) {
        entry.marker.setMap(null);
        entry.route.setMap(null);
        entry.infoWindow.close();
      }
      return;
    }

    const activeVesselIds = new Set(vessels.map((v) => v.id));

    // Clean up markers of removed vessels
    for (const [id, entry] of vesselMarkersRef.current.entries()) {
      if (!activeVesselIds.has(id)) {
        entry.marker.setMap(null);
        entry.route.setMap(null);
        entry.infoWindow.close();
        vesselMarkersRef.current.delete(id);
      }
    }

    // Update or create vessel markers smoothly
    for (const vessel of vessels) {
      const isSuspect = suspectIds.includes(vessel.id);
      const isSelected = selectedVesselId === vessel.id;
      // Normal = Blue (#38bdf8), Suspected = Red (#ef4444), Selected = Orange (#f97316)
      const markerColor = isSelected ? '#f97316' : isSuspect ? '#ef4444' : '#38bdf8';
      const heading = vessel.headingDeg ?? vessel.heading ?? 0;

      let entry = vesselMarkersRef.current.get(vessel.id);

      if (!entry) {
        // Create new marker and route polyline
        const marker = new google.maps.Marker({
          position: { lat: vessel.coord.lat, lng: vessel.coord.lon },
          map,
          title: `${vessel.name} · ${vessel.type}`,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: heading,
            scale: isSelected ? 12 : isSuspect ? 10 : 8,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: '#f8fafc',
            strokeWeight: 1.5,
          },
        });

        const route = new google.maps.Polyline({
          path: showTrails ? vessel.track.map((p) => ({ lat: p.lat, lng: p.lon })) : [],
          geodesic: true,
          strokeColor: isSelected ? '#22d3ee' : isSuspect ? '#f87171' : '#60a5fa',
          strokeOpacity: isSelected ? 0.95 : 0.65,
          strokeWeight: isSelected ? 3 : 2,
          map: showTrails ? map : null,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: generateInfoWindowContent(vessel, isSuspect),
        });

        marker.addListener('click', () => {
          infoWindow.setContent(generateInfoWindowContent(vessel, isSuspect));
          infoWindow.open({ map, anchor: marker });
          onSelectVessel?.(vessel);
        });

        entry = { marker, route, infoWindow };
        vesselMarkersRef.current.set(vessel.id, entry);
      } else {
        // Ensure visible
        if (entry.marker.getMap() !== map) {
          entry.marker.setMap(map);
        }

        // Smoothly update position & rotation
        entry.marker.setPosition({ lat: vessel.coord.lat, lng: vessel.coord.lon });
        entry.marker.setIcon({
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          rotation: heading,
          scale: isSelected ? 12 : isSuspect ? 10 : 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#f8fafc',
          strokeWeight: isSelected ? 2.5 : 1.5,
        });

        // Update route polyline path & visibility
        if (showTrails) {
          if (entry.route.getMap() !== map) {
            entry.route.setMap(map);
          }
          entry.route.setPath(vessel.track.map((p) => ({ lat: p.lat, lng: p.lon })));
          entry.route.setOptions({
            strokeColor: isSelected ? '#22d3ee' : isSuspect ? '#f87171' : '#60a5fa',
            strokeOpacity: isSelected ? 0.95 : 0.65,
            strokeWeight: isSelected ? 3 : 2,
          });
        } else {
          entry.route.setMap(null);
        }
      }
    }
  }, [isLoaded, showVessels, showTrails, vessels, selectedVesselId, suspectIds, onSelectVessel]);

  // 5b. Continuous High-Frequency Marker & Trail Motion (30 FPS direct updates)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    const unsubscribe = vesselMovementService.subscribeMotion((latestVessels) => {
      if (!showVesselsRef.current) return;

      for (const vessel of latestVessels) {
        const entry = vesselMarkersRef.current.get(vessel.id);
        if (!entry) continue;

        const isSelected = selectedVesselIdRef.current === vessel.id;
        const isSuspect = suspectIdsRef.current.includes(vessel.id);
        const markerColor = isSelected ? '#f97316' : isSuspect ? '#ef4444' : '#38bdf8';
        const heading = vessel.headingDeg ?? vessel.heading ?? 0;

        // Smoothly translate position & rotate icon
        entry.marker.setPosition({ lat: vessel.coord.lat, lng: vessel.coord.lon });
        entry.marker.setIcon({
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          rotation: heading,
          scale: isSelected ? 12 : isSuspect ? 10 : 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#f8fafc',
          strokeWeight: isSelected ? 2.5 : 1.5,
        });

        // Update trail polyline
        if (showTrailsRef.current) {
          if (entry.route.getMap() !== map) {
            entry.route.setMap(map);
          }
          entry.route.setPath(vessel.track.map((p) => ({ lat: p.lat, lng: p.lon })));
        }

        // Auto-follow if this vessel is tracked
        if (followVesselIdRef.current && followVesselIdRef.current === vessel.id) {
          map.panTo({ lat: vessel.coord.lat, lng: vessel.coord.lon });
        }

        // Dynamic update of correlation dashed lines for moving suspected vessels
        if (showCorrelationRef.current) {
          for (const spill of spillsRef.current) {
            const suspectId = spill.primarySuspectId || spill.correlatedVessels?.[0]?.vesselId;
            if (suspectId && suspectId === vessel.id) {
              const key = `corr-${spill.id}-${suspectId}`;
              const corrEntry = correlationLinesRef.current.get(key);
              if (corrEntry) {
                const targetPoint = spill.originCoord || spill.coord;
                corrEntry.line.setPath([
                  { lat: vessel.coord.lat, lng: vessel.coord.lon },
                  { lat: targetPoint.lat, lng: targetPoint.lon },
                ]);
              }
            }
          }
        }
      }
    });

    return unsubscribe;
  }, [isLoaded]);

  // 6. Correlation Path Lines (Dashed Red Lines connecting Moving Suspects to Estimated Origins)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    if (!showCorrelation || spills.length === 0) {
      for (const entry of correlationLinesRef.current.values()) {
        entry.line.setMap(null);
      }
      correlationLinesRef.current.clear();
      return;
    }

    const activeKeys = new Set<string>();

    for (const spill of spills) {
      if (spill.status === 'Resolved') continue;

      const suspectId = spill.primarySuspectId || spill.correlatedVessels?.[0]?.vesselId;
      if (!suspectId) continue;

      const vessel = vessels.find((v) => v.id === suspectId);
      if (!vessel) continue;

      const targetPoint = spill.originCoord || spill.coord;
      const key = `corr-${spill.id}-${suspectId}`;
      activeKeys.add(key);

      const isSpillSelected = selectedSpillId === spill.id;
      const isVesselSelected = selectedVesselId === vessel.id;
      const isHighlighted = isSpillSelected || isVesselSelected;

      let entry = correlationLinesRef.current.get(key);
      const path = [
        { lat: vessel.coord.lat, lng: vessel.coord.lon },
        { lat: targetPoint.lat, lng: targetPoint.lon },
      ];

      if (!entry) {
        const lineSymbol = {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: isHighlighted ? 4 : 3,
        };

        const line = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#ef4444',
          strokeOpacity: 0,
          icons: [
            {
              icon: lineSymbol,
              offset: '0',
              repeat: isHighlighted ? '12px' : '15px',
            },
          ],
          map,
          zIndex: isHighlighted ? 12 : 6,
        });

        entry = { line };
        correlationLinesRef.current.set(key, entry);
      } else {
        if (entry.line.getMap() !== map) {
          entry.line.setMap(map);
        }
        entry.line.setPath(path);
        entry.line.setOptions({
          zIndex: isHighlighted ? 12 : 6,
        });
      }
    }

    // Clean obsolete correlation lines
    for (const [key, entry] of correlationLinesRef.current.entries()) {
      if (!activeKeys.has(key)) {
        entry.line.setMap(null);
        correlationLinesRef.current.delete(key);
      }
    }
  }, [isLoaded, showCorrelation, vessels, spills, selectedSpillId, selectedVesselId]);

  // 7. Handle smooth camera panning on selection & backtracking view
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    // Backtracking zoom to encompass spill, origin, and suspected ship
    if (backtrackSpillId) {
      const bSpill = spills.find((s) => s.id === backtrackSpillId);
      if (bSpill) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: bSpill.coord.lat, lng: bSpill.coord.lon });
        if (bSpill.originCoord) {
          bounds.extend({ lat: bSpill.originCoord.lat, lng: bSpill.originCoord.lon });
        }
        if (bSpill.polygon) {
          for (const pt of bSpill.polygon) {
            bounds.extend({ lat: pt.lat, lng: pt.lon });
          }
        }
        const sId = bSpill.primarySuspectId || bSpill.correlatedVessels?.[0]?.vesselId;
        if (sId) {
          const sVessel = vessels.find((v) => v.id === sId);
          if (sVessel) {
            bounds.extend({ lat: sVessel.coord.lat, lng: sVessel.coord.lon });
          }
        }
        map.fitBounds(bounds, 70);
        return;
      }
    }

    if (selectedVesselId && selectedVesselId !== prevSelectedVesselRef.current) {
      prevSelectedVesselRef.current = selectedVesselId;
      const selected = vessels.find((v) => v.id === selectedVesselId);
      if (selected) {
        map.panTo({ lat: selected.coord.lat, lng: selected.coord.lon });
        if (map.getZoom()! < 8) {
          map.setZoom(8);
        }
      }
    } else if (!selectedVesselId) {
      prevSelectedVesselRef.current = null;
    }

    if (selectedSpillId && selectedSpillId !== prevSelectedSpillRef.current) {
      prevSelectedSpillRef.current = selectedSpillId;
      const selected = spills.find((s) => s.id === selectedSpillId);
      if (selected) {
        map.panTo({ lat: selected.coord.lat, lng: selected.coord.lon });
        if (map.getZoom()! < 7) {
          map.setZoom(7);
        }
      }
    } else if (!selectedSpillId) {
      prevSelectedSpillRef.current = null;
    }
  }, [isLoaded, selectedVesselId, selectedSpillId, backtrackSpillId, vessels, spills]);

  const isErrorState = loaderState !== 'checking' && loaderState !== 'loaded';

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/[0.08] bg-abyss-950', className)}>
      {isErrorState ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-abyss-950/92 p-6 text-center">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-lg">
            <p className="font-semibold uppercase tracking-[0.12em] text-red-200">Google Maps Configuration</p>
            <p className="mt-2 leading-relaxed">{createDiagnosticMessage(loaderState)}</p>
          </div>
        </div>
      ) : null}

      {loaderState === 'checking' ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-abyss-950/80 text-sm font-medium text-tide-400 backdrop-blur-sm">
          Loading Arabian Sea Google Maps…
        </div>
      ) : null}

      <div ref={mapRef} className="h-full min-h-[420px] w-full" aria-label="Interactive live ocean monitoring map" />
    </div>
  );
}

function generateInfoWindowContent(vessel: Vessel, isSuspect: boolean): string {
  const speed = vessel.speedKnots ?? vessel.speed ?? 0;
  const headingDeg = vessel.headingDeg ?? vessel.heading ?? 0;
  const headingLabel = vessel.headingLabel ?? 'North';
  const latStr = `${Math.abs(vessel.coord.lat).toFixed(4)}° ${vessel.coord.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(vessel.coord.lon).toFixed(4)}° ${vessel.coord.lon >= 0 ? 'E' : 'W'}`;

  return `
    <div style="color:#0f172a; font-family: Inter, system-ui, sans-serif; min-width: 260px; padding: 4px; line-height: 1.5;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        <span style="font-weight:700; font-size:14px; color:#0f172a;">${vessel.name}</span>
        <span style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; ${
          isSuspect ? 'background:#fee2e2; color:#b91c1c;' : 'background:#e0f2fe; color:#0369a1;'
        }">
          ${isSuspect ? 'POTENTIALLY RESPONSIBLE' : 'NORMAL'}
        </span>
      </div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>MMSI:</strong> ${vessel.mmsi}</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Type:</strong> ${vessel.type} · ${vessel.flag}</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Speed:</strong> ${speed.toFixed(1)} knots</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Heading:</strong> ${headingLabel} (${headingDeg}°)</div>
      <div style="font-size:12px; color:#475569; margin-bottom:4px;"><strong>Position:</strong> ${latStr}, ${lonStr}</div>
      <div style="font-size:11px; font-weight:600; color:#16a34a; display:flex; align-items:center; gap:4px; margin-top:6px; padding-top:4px; border-top:1px solid #f1f5f9;">
        <span>🟢</span> MOVING · Continuous Ocean Tracking
      </div>
    </div>
  `;
}

function generateSpillInfoWindowContent(spill: Spill): string {
  const origin = spill.originCoord || spill.coord;
  const originLatStr = `${Math.abs(origin.lat).toFixed(4)}° ${origin.lat >= 0 ? 'N' : 'S'}`;
  const originLonStr = `${Math.abs(origin.lon).toFixed(4)}° ${origin.lon >= 0 ? 'E' : 'W'}`;

  const topCandidate = spill.correlatedVessels?.[0];
  const candidateName = topCandidate?.vesselName || 'MT Ocean Voyager';
  const candidateScore = topCandidate?.overallScore || 87;

  return `
    <div style="color:#0f172a; font-family: Inter, system-ui, sans-serif; min-width: 275px; padding: 4px; line-height: 1.5;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        <span style="font-weight:700; font-size:14px; color:#b91c1c;">🛢️ OIL SPILL DETECTED</span>
        <span style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; background:#fee2e2; color:#b91c1c;">
          ${spill.risk} SEVERITY
        </span>
      </div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Spill ID:</strong> ${spill.id}</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Detection Source:</strong> ${spill.satellite || 'Sentinel-1 SAR'}</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Detection Time:</strong> 04 Sept 2026 · 08:30 UTC</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Estimated Area:</strong> ${spill.areaKm2} km²</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Confidence:</strong> ${spill.confidence}%</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Estimated Origin:</strong> ${originLatStr}, ${originLonStr}</div>
      <div style="font-size:12px; color:#b91c1c; margin-top:5px; padding-top:4px; border-top:1px dashed #cbd5e1;">
        <strong>Potentially Responsible Vessel:</strong><br/>
        <span style="font-weight:700; color:#dc2626;">🔴 ${candidateName}</span>
      </div>
      <div style="font-size:12px; color:#475569; margin-bottom:4px;">
        <strong>Attribution Confidence:</strong> <span style="font-weight:700; color:#dc2626;">${candidateScore}%</span>
      </div>
      <div style="font-size:11px; color:#0284c7; font-weight:600; margin-top:4px; border-top:1px solid #f1f5f9; padding-top:4px;">
        🔍 Click to open forensic investigation
      </div>
    </div>
  `;
}

function generateOriginInfoWindowContent(spill: Spill): string {
  const origin = spill.originCoord || spill.coord;
  const latStr = `${Math.abs(origin.lat).toFixed(4)}° ${origin.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(origin.lon).toFixed(4)}° ${origin.lon >= 0 ? 'E' : 'W'}`;
  const driftDist = spill.drift?.distanceKm ?? 42;
  const driftDir = spill.drift?.directionLabel ?? 'NE 054°';

  return `
    <div style="color:#0f172a; font-family: Inter, system-ui, sans-serif; min-width: 260px; padding: 4px; line-height: 1.5;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        <span style="font-weight:700; font-size:14px; color:#a16207;">🟡 Estimated Spill Origin</span>
        <span style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; background:#fef08a; color:#854d0e;">
          BACKTRACK
        </span>
      </div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Incident ID:</strong> ${spill.id}</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Origin Coords:</strong> ${latStr}, ${lonStr}</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Estimated Release:</strong> 03 Sept 2026 · 22:35 UTC</div>
      <div style="font-size:12px; color:#475569; margin-bottom:2px;"><strong>Drift Vector:</strong> ${driftDir} · ${driftDist} km distance</div>
      <div style="font-size:12px; color:#475569; margin-bottom:4px;"><strong>Confidence:</strong> 91% (Ensemble drift convergence)</div>
      <div style="font-size:11px; color:#b45309; font-weight:600; margin-top:4px; border-top:1px solid #f1f5f9; padding-top:4px;">
        🌊 Deepwater high-seas release point
      </div>
    </div>
  `;
}
