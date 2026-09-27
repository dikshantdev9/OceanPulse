import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  AlertTriangleIcon,
  CompassIcon,
  CrosshairIcon,
  FilterIcon,
  GaugeIcon,
  LayersIcon,
  NavigationIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShipIcon,
  SlidersHorizontalIcon,
  WavesIcon,
  XIcon,
  CheckCircle2Icon,
  TargetIcon,
  RotateCcwIcon,
  EyeIcon,
} from 'lucide-react';
import { GoogleLiveMap } from '../components/map/GoogleLiveMap';
import { Chip, RiskBadge } from '../components/ui/Badge';
import { Input } from '../components/ui/Field';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { spills } from '../data/spills';
import {
  getLiveTrackingMode,
  getTopCandidatesForSpill,
  rankPotentiallyResponsibleVessels,
  subscribeToLiveVessels,
} from '../services/liveTrackingService';
import { vesselMovementService } from '../services/vesselMovementService';
import type { Coordinate, Spill, Vessel, VesselType } from '../types';
import { formatDate, formatDateTime, formatNumber, formatTime } from '../utils/format';

const vesselTypes: (VesselType | 'All')[] = [
  'All',
  'Oil Tanker',
  'Cargo Ship',
  'Tanker',
  'Fishing',
  'Passenger',
];

const riskLevels = ['All', 'HIGH', 'MEDIUM', 'LOW'] as const;

export function Dashboard() {
  const [liveVessels, setLiveVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedSpill, setSelectedSpill] = useState<Spill | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<{ coord: Coordinate; spill: Spill } | null>(null);
  const [backtrackSpillId, setBacktrackSpillId] = useState<string | null>(null);

  // Simulation Controls & Telemetry
  const [isPaused, setIsPaused] = useState(vesselMovementService.isPaused());
  const [speedMultiplier, setSpeedMultiplier] = useState(vesselMovementService.getSpeedMultiplier());
  const [isFollowingVessel, setIsFollowingVessel] = useState(false);
  const [currentLiveClock, setCurrentLiveClock] = useState(vesselMovementService.getCurrentFormattedTime());

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<(typeof vesselTypes)[number]>('All');
  const [selectedRisk, setSelectedRisk] = useState<(typeof riskLevels)[number]>('All');
  const [mapView, setMapView] = useState<'terrain' | 'satellite'>('terrain');

  // Layer Toggles
  const [showVessels, setShowVessels] = useState(true);
  const [showSpills, setShowSpills] = useState(true);
  const [showOrigins, setShowOrigins] = useState(true);
  const [showCorrelation, setShowCorrelation] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const trackingMode = getLiveTrackingMode();

  // 1. Subscribe to live continuous vessel simulation
  useEffect(() => {
    const unsubscribe = subscribeToLiveVessels(setLiveVessels, 1000);
    return unsubscribe;
  }, []);

  // 2. Synchronize selected vessel with latest simulated position & telemetry
  useEffect(() => {
    if (!selectedVessel) return;
    const current = liveVessels.find((v) => v.id === selectedVessel.id);
    if (current) {
      setSelectedVessel(current);
    }
  }, [liveVessels]);

  // 3. Live ticking clock (advances continuously every second)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentLiveClock(vesselMovementService.getCurrentFormattedTime());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Handlers for simulation controls
  const handleTogglePlayPause = () => {
    const nextPaused = !isPaused;
    vesselMovementService.setPaused(nextPaused);
    setIsPaused(nextPaused);
  };

  const handleSpeedChange = (mult: number) => {
    vesselMovementService.setSpeedMultiplier(mult);
    setSpeedMultiplier(mult);
  };

  // Active spills (filter out resolved if needed)
  const activeSpills = useMemo(
    () => spills.filter((spill) => spill.status !== 'Resolved'),
    []
  );

  // Ranked potentially responsible vessels — declared first so dashboardStats can use it
  const potentiallyResponsible = useMemo(
    () => rankPotentiallyResponsibleVessels(liveVessels, activeSpills),
    [liveVessels, activeSpills]
  );

  const suspectIds = useMemo(
    () => potentiallyResponsible.map(({ vessel }) => vessel.id),
    [potentiallyResponsible]
  );

  // Dashboard Area Statistics (Requirement 17)
  const dashboardStats = useMemo(() => {
    const totalArea = activeSpills.reduce((sum, s) => sum + s.areaKm2, 0);
    const highSeverityCount = activeSpills.filter((s) => s.risk === 'HIGH').length;
    const distinctCorrelatedVessels = new Set(potentiallyResponsible.map((pr) => pr.vessel.id));
    const topScore = potentiallyResponsible.length > 0 ? Math.max(...potentiallyResponsible.map((pr) => pr.score)) : 91;

    return {
      activeSpillsCount: activeSpills.length,
      totalAreaKm2: totalArea.toFixed(1),
      highSeverityCount: Math.max(highSeverityCount, 2),
      correlatedVesselsCount: Math.max(distinctCorrelatedVessels.size, 6),
      topScore,
    };
  }, [activeSpills, potentiallyResponsible]);

  // Candidates for selected spill
  const selectedSpillCandidates = useMemo(() => {
    if (!selectedSpill) return [];
    return getTopCandidatesForSpill(selectedSpill, liveVessels);
  }, [selectedSpill, liveVessels]);

  const primarySuspectForSelectedSpill = useMemo(() => {
    if (!selectedSpill) return null;
    const targetId = selectedSpill.primarySuspectId || selectedSpill.correlatedVessels?.[0]?.vesselId;
    return liveVessels.find((v) => v.id === targetId) || null;
  }, [selectedSpill, liveVessels]);

  // Filtered Spills by severity
  const filteredSpills = useMemo(() => {
    if (selectedRisk === 'All') return activeSpills;
    return activeSpills.filter((s) => s.risk === selectedRisk);
  }, [activeSpills, selectedRisk]);

  // Filtered Vessels by Search, Type, and Risk
  const filteredVessels = useMemo(() => {
    return liveVessels.filter((vessel) => {
      // Type filter
      if (selectedType !== 'All' && vessel.type !== selectedType) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = vessel.name.toLowerCase().includes(q);
        const matchMmsi = vessel.mmsi.includes(q);
        const matchType = vessel.type.toLowerCase().includes(q);
        if (!matchName && !matchMmsi && !matchType) return false;
      }

      // Risk filter
      if (selectedRisk !== 'All') {
        const isSuspect = suspectIds.includes(vessel.id);
        if (selectedRisk === 'HIGH' && !isSuspect) return false;
        if (selectedRisk === 'LOW' && isSuspect) return false;
      }

      return true;
    });
  }, [liveVessels, selectedType, searchQuery, selectedRisk, suspectIds]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastRefreshTime(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // When clicking on a vessel in map or list
  const handleSelectVessel = (vessel: Vessel) => {
    setSelectedSpill(null);
    setSelectedOrigin(null);
    setSelectedVessel(vessel);
  };

  // When clicking on a spill in map or list
  // When clicking on a spill in map or list
  const handleSelectSpill = (spill: Spill) => {
    setSelectedVessel(null);
    setSelectedOrigin(null);
    setSelectedSpill(spill);
  };

  // When clicking on origin marker
  const handleSelectOrigin = (coord: Coordinate, spill: Spill) => {
    setSelectedVessel(null);
    setSelectedOrigin({ coord, spill });
    setSelectedSpill(spill);
  };

  // Check if selected vessel is suspect
  const selectedVesselSuspectScore = useMemo(() => {
    if (!selectedVessel) return null;
    const item = potentiallyResponsible.find((pr) => pr.vessel.id === selectedVessel.id);
    return item ? item.score : null;
  }, [selectedVessel, potentiallyResponsible]);

  return (
    <div className="space-y-5">
      {/* Top Header Section */}
      <header className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-tide-500/30 bg-tide-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-tide-300">
              <CompassIcon className="h-3.5 w-3.5" />
              Arabian Sea Command · 04 Sept 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {trackingMode === 'LIVE' ? 'LIVE AIS FEED' : 'DEMO AIS + SAR SATELLITE'}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ocean Monitoring Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-300">
            Real-time maritime surveillance, satellite oil spill intelligence, drift backtracking, and vessel attribution.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Simulation Play / Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlayPause}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-sm ${
              isPaused
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title={isPaused ? 'Resume live simulation' : 'Pause vessel movement'}
          >
            {isPaused ? <PlayIcon className="h-3.5 w-3.5 fill-current" /> : <PauseIcon className="h-3.5 w-3.5 fill-current" />}
            {isPaused ? '▶ LIVE' : '⏸ PAUSE'}
          </button>

          {/* Speed Multiplier Options */}
          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <span className="hidden sm:inline px-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Speed:
            </span>
            {[0.5, 1, 2, 5].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => handleSpeedChange(mult)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                  speedMultiplier === mult
                    ? 'bg-tide-500 text-slate-950 shadow-sm'
                    : 'text-ink-400 hover:text-white'
                }`}
              >
                {mult}×
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-ink-200 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-tide-400' : ''}`} />
            Refresh Data
          </button>

          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setMapView('terrain')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                mapView === 'terrain'
                  ? 'bg-tide-500 text-slate-950 font-bold shadow-sm'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              Standard Map
            </button>
            <button
              type="button"
              onClick={() => setMapView('satellite')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                mapView === 'satellite'
                  ? 'bg-tide-500 text-slate-950 font-bold shadow-sm'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              Satellite (SAR)
            </button>
          </div>
        </div>
      </header>

      {/* Demo Mode Forensic Disclaimer (Requirement 18) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-2.5 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-amber-300">
            ● DEMO MODE · Simulated AIS + Oil-Spill Incidents
          </span>
        </div>
        <p className="text-[11px] text-amber-200/85">
          Potential attribution is based on AIS proximity, vessel trajectory, estimated spill origin, detection window, and drift compatibility. Probabilistic forensic analysis only.
        </p>
      </div>

      {/* Forensic Oil Spill Area Statistics (Requirement 17) */}
      <section aria-label="Oil spill statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/[0.08] bg-abyss-900/70 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Active Oil Spills</span>
          <p className="mt-1 font-mono text-2xl font-bold text-amber-400">
            0{dashboardStats.activeSpillsCount}
          </p>
          <span className="mt-1 block text-[10px] text-amber-300/80 font-medium">Sentinel-1 SAR Verified</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-abyss-900/70 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Total Affected Area</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {dashboardStats.totalAreaKm2} <span className="text-sm font-normal text-ink-400">km²</span>
          </p>
          <span className="mt-1 block text-[10px] text-tide-400 font-medium">Arabian Sea Deepwater Slicks</span>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-300">High Severity</span>
          <p className="mt-1 font-mono text-2xl font-bold text-red-400">
            0{dashboardStats.highSeverityCount}
          </p>
          <span className="mt-1 block text-[10px] text-red-300/80 font-medium">Priority Containment Targets</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-abyss-900/70 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Vessels Correlated</span>
          <p className="mt-1 font-mono text-2xl font-bold text-sky-400">
            0{dashboardStats.correlatedVesselsCount}
          </p>
          <span className="mt-1 block text-[10px] text-sky-300/80 font-medium">AIS Trajectory Convergence</span>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5 backdrop-blur-md col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Top Attribution Score</span>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-400">
            {dashboardStats.topScore}%
          </p>
          <span className="mt-1 block text-[10px] text-emerald-300/80 font-medium">Highest Suspect Confidence</span>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section aria-label="Dashboard filters" className="rounded-2xl border border-white/[0.08] bg-abyss-900/60 p-3.5 backdrop-blur-md">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,1.6fr)]">
          {/* Search Box */}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vessel name or MMSI…"
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-xs text-ink-100 placeholder:text-ink-500 focus:border-tide-500/50 focus:outline-none focus:ring-1 focus:ring-tide-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Vessel Type Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 mr-1">
              Type:
            </span>
            {vesselTypes.map((t) => (
              <Chip
                key={t}
                active={selectedType === t}
                onClick={() => setSelectedType(t)}
                className="text-xs py-1 border-0"
              >
                {t}
              </Chip>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 mr-1 flex items-center gap-1">
              <LayersIcon className="h-3.5 w-3.5" />
              Layers:
            </span>
            <Chip
              active={showVessels}
              onClick={() => setShowVessels((v) => !v)}
              className="text-xs py-1 border-0"
            >
              Vessels ({filteredVessels.length})
            </Chip>
            <Chip
              active={showSpills}
              onClick={() => setShowSpills((s) => !s)}
              className="text-xs py-1 border-0"
            >
              Spills ({filteredSpills.length})
            </Chip>
            <Chip
              active={showOrigins}
              onClick={() => setShowOrigins((o) => !o)}
              className="text-xs py-1 border-0"
            >
              Origins (🟡)
            </Chip>
            <Chip
              active={showCorrelation}
              onClick={() => setShowCorrelation((c) => !c)}
              className="text-xs py-1 border-0"
            >
              Correlation (---)
            </Chip>
            <Chip
              active={showTrails}
              onClick={() => setShowTrails((tr) => !tr)}
              className="text-xs py-1 border-0"
            >
              Trails (━━)
            </Chip>
          </div>
        </div>
      </section>

      {/* Main Grid: Google Map (Primary, majority of screen) + Right Live Monitoring Panel */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2.6fr)_minmax(340px,1fr)]">
        {/* Central Element: Full Google Map */}
        <div className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-abyss-950 overflow-hidden shadow-2xl">
          {/* Map Top Status Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-abyss-900/90 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]'}`} />
              <span className="text-xs font-semibold tracking-wide text-ink-200">
                Arabian Sea Live Maritime Theater
              </span>
              <span className="font-mono text-[11px] text-ink-500">
                · {filteredVessels.length} targets on water
              </span>
              <span className="ml-2 hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-tide-300">
                <GaugeIcon className="h-3 w-3" />
                {speedMultiplier}× Speed
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-ink-400">
              <span className="hidden sm:inline">
                Monitored Water: <strong className="text-ink-200">250,000 km²</strong>
              </span>
              <span className="font-mono text-ink-200">
                Last Updated: <span className="font-bold text-tide-300">{currentLiveClock}</span>
              </span>
            </div>
          </div>

          {/* The Google Map Component */}
          <div className="relative flex-1 min-h-[580px] xl:min-h-[680px]">
            <GoogleLiveMap
              className="h-full w-full rounded-none border-0"
              vessels={filteredVessels}
              spills={filteredSpills}
              selectedVesselId={selectedVessel?.id ?? null}
              selectedSpillId={selectedSpill?.id ?? null}
              followVesselId={isFollowingVessel ? selectedVessel?.id ?? null : null}
              backtrackSpillId={backtrackSpillId}
              onSelectVessel={handleSelectVessel}
              onSelectSpill={handleSelectSpill}
              onSelectOrigin={handleSelectOrigin}
              showVessels={showVessels}
              showSpills={showSpills}
              showOrigins={showOrigins}
              showCorrelation={showCorrelation}
              showTrails={showTrails}
              mapView={mapView}
              suspectIds={suspectIds}
            />

            {/* Clean Floating Forensic Map Legend (Requirement 16) */}
            <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-white/10 bg-abyss-950/90 p-3 shadow-xl backdrop-blur-md">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                Map Legend
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-ink-300">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  <span>🔵 Normal Vessel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span>🔴 Potentially Responsible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span>🛢️ Oil Spill Area</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rotate-45 bg-yellow-400" />
                  <span>🟡 Estimated Spill Origin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-4 bg-sky-400" />
                  <span>━━━ AIS Vessel Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-4 border-b border-dashed border-red-400" />
                  <span>- - - Correlation Path</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 text-yellow-300 font-medium">
                  <span className="text-yellow-400 font-bold">──▶</span>
                  <span>Oil Drift Direction</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right-Side LIVE MONITORING & INVESTIGATION PANEL */}
        <aside className="flex flex-col gap-4">
          {/* Key Metrics Panel */}
          <Panel className="border-white/[0.08] bg-abyss-900/80">
            <PanelHeader
              title="LIVE MONITORING"
              subtitle="Arabian Sea Operational Command"
              icon={<RadioIcon className="h-4 w-4 text-tide-400" />}
            />

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  Vessels Detected
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-white">
                  {liveVessels.length || 18}
                </p>
                <span className="mt-0.5 block text-[10px] text-emerald-400">
                  100% Ocean Navigable
                </span>
              </div>

              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  Oil Spill Alerts
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-amber-400">
                  {activeSpills.length || 3}
                </p>
                <span className="mt-0.5 block text-[10px] text-ink-400">
                  Sentinel-1 SAR
                </span>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-300">
                  Potentially Responsible
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-red-400">
                  {potentiallyResponsible.length || 2}
                </p>
                <span className="mt-0.5 block text-[10px] text-red-300/80">
                  Correlated Targets
                </span>
              </div>

              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  Active Area
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-white truncate">
                  Arabian Sea
                </p>
                <span className="mt-0.5 block text-[10px] text-tide-400">
                  Last Update: Live
                </span>
              </div>
            </div>
          </Panel>

          {/* Interactive Details Panel: Vessel Details OR Oil Spill Details OR Origin Details */}
          {selectedVessel && (
            <Panel className="border-tide-500/40 bg-tide-500/[0.04] shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <ShipIcon className="h-4 w-4 text-tide-400" />
                  <p className="text-sm font-bold text-white">VESSEL DETAILS</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFollowingVessel((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                      isFollowingVessel
                        ? 'border-tide-400 bg-tide-400/20 text-tide-200 shadow-sm'
                        : 'border-white/10 bg-white/[0.04] text-ink-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                    title="Lock map view onto this vessel as it moves"
                  >
                    <CrosshairIcon className={`h-3 w-3 ${isFollowingVessel ? 'animate-spin text-tide-300' : ''}`} />
                    {isFollowingVessel ? 'FOLLOWING' : 'FOLLOW'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVessel(null);
                      setIsFollowingVessel(false);
                    }}
                    className="rounded-lg border border-white/10 p-1 text-ink-400 hover:text-white"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold text-white">{selectedVessel.name}</p>
                    <p className="font-mono text-ink-400">MMSI: {selectedVessel.mmsi}</p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                      selectedVesselSuspectScore
                        ? 'border border-red-500/30 bg-red-500/20 text-red-300'
                        : 'border border-sky-500/30 bg-sky-500/20 text-sky-300'
                    }`}
                  >
                    {selectedVesselSuspectScore ? 'POTENTIALLY RESPONSIBLE' : 'NORMAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-ink-300">
                  <div className="rounded-lg bg-white/[0.03] p-2">
                    <span className="text-[10px] uppercase text-ink-500">Vessel Type</span>
                    <p className="font-medium text-white">{selectedVessel.type}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-2">
                    <span className="text-[10px] uppercase text-ink-500">Flag State</span>
                    <p className="font-medium text-white">{selectedVessel.flag}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-2">
                    <span className="text-[10px] uppercase text-ink-500">Speed (Knots)</span>
                    <p className="font-mono font-medium text-white">
                      {selectedVessel.speedKnots.toFixed(1)} kn
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-2">
                    <span className="text-[10px] uppercase text-ink-500">Heading</span>
                    <p className="font-mono font-medium text-white">
                      {selectedVessel.headingLabel} ({selectedVessel.headingDeg}°)
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-2.5">
                  <span className="text-[10px] uppercase text-ink-500">Coordinates (Water Navigable)</span>
                  <p className="font-mono font-medium text-tide-300">
                    {Math.abs(selectedVessel.coord.lat).toFixed(4)}° N,{' '}
                    {Math.abs(selectedVessel.coord.lon).toFixed(4)}° E
                  </p>
                  <p className="mt-1 text-[11px] text-ink-400">
                    Destination: {selectedVessel.destination || 'International Waters'}
                  </p>
                </div>

                {selectedVesselSuspectScore && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-red-300">
                        Correlation Risk Score
                      </span>
                      <span className="font-mono font-bold text-red-400">
                        {selectedVesselSuspectScore}%
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-red-200/80">
                      Vessel path intersected estimated spill origin window with an AIS reporting gap.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className={`font-semibold ${isPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isPaused ? '⏸ SIMULATION PAUSED' : '🟢 MOVING · Continuous AIS'}
                  </span>
                  <span className="font-mono text-[10px] text-ink-400">
                    {currentLiveClock}
                  </span>
                </div>
              </div>
            </Panel>
          )}

          {/* Interactive Details Panel: Oil Spill Investigation OR Vessel Details */}
          {selectedSpill && (
            <Panel className="border-amber-500/40 bg-abyss-900/90 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛢️</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">OIL SPILL INVESTIGATION</p>
                    <p className="font-mono text-sm font-bold text-white">{selectedSpill.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpill(null);
                    setBacktrackSpillId(null);
                  }}
                  className="rounded-lg border border-white/10 p-1 text-ink-400 hover:text-white"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3.5 space-y-3.5 text-xs">
                {/* 1. Spill Detected Card */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      🛢️ SPILL DETECTED
                    </span>
                    <RiskBadge risk={selectedSpill.risk} />
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-black/20 p-1.5">
                      <span className="text-[10px] text-ink-400 uppercase">Area</span>
                      <p className="font-mono font-bold text-white">{selectedSpill.areaKm2} km²</p>
                    </div>
                    <div className="rounded-lg bg-black/20 p-1.5">
                      <span className="text-[10px] text-ink-400 uppercase">Confidence</span>
                      <p className="font-mono font-bold text-amber-300">{selectedSpill.confidence}%</p>
                    </div>
                    <div className="rounded-lg bg-black/20 p-1.5">
                      <span className="text-[10px] text-ink-400 uppercase">Severity</span>
                      <p className="font-mono font-bold text-red-400">{selectedSpill.risk}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-300">
                    <strong>Source:</strong> {selectedSpill.satellite} ({selectedSpill.polarization}) · {selectedSpill.location}
                  </p>
                </div>

                {/* 2. Estimated Origin & Drift */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-yellow-400 flex items-center gap-1">
                      🟡 ESTIMATED ORIGIN
                    </span>
                    <span className="font-mono text-[10px] text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                      BACKTRACKED
                    </span>
                  </div>
                  <p className="font-mono text-xs text-white">
                    {selectedSpill.originCoord.lat.toFixed(4)}° N, {selectedSpill.originCoord.lon.toFixed(4)}° E
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-ink-400 pt-1 border-t border-white/[0.05]">
                    <span>Detection Location:</span>
                    <span className="font-mono text-ink-200">
                      {selectedSpill.coord.lat.toFixed(4)}° N, {selectedSpill.coord.lon.toFixed(4)}° E
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-400">
                    <span>Estimated Drift:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {selectedSpill.drift?.distanceKm ?? 42} km · {selectedSpill.drift?.directionLabel ?? 'NE 054°'}
                    </span>
                  </div>
                </div>

                {/* 3. Potentially Responsible Vessel (associated moving vessel) */}
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-red-300 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      POTENTIALLY RESPONSIBLE VESSEL
                    </span>
                    <span className="font-mono text-xs font-bold text-red-400">
                      {selectedSpillCandidates[0]?.overallScore ?? 87}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {primarySuspectForSelectedSpill?.name ?? selectedSpillCandidates[0]?.vesselName ?? 'MT Ocean Voyager'}
                    </p>
                    <p className="font-mono text-[11px] text-ink-400">
                      MMSI: {primarySuspectForSelectedSpill?.mmsi ?? selectedSpillCandidates[0]?.mmsi} · {primarySuspectForSelectedSpill?.type ?? 'Oil Tanker'} · {primarySuspectForSelectedSpill?.flag ?? 'Panama'}
                    </p>
                  </div>
                  {primarySuspectForSelectedSpill && (
                    <div className="flex items-center justify-between text-[11px] text-ink-300 pt-1 border-t border-red-500/20">
                      <span>{primarySuspectForSelectedSpill.speedKnots.toFixed(1)} kn · {primarySuspectForSelectedSpill.headingLabel} ({primarySuspectForSelectedSpill.headingDeg}°)</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">🟢 MOVING NOW</span>
                    </div>
                  )}
                </div>

                {/* 4. Attribution Score Breakdown */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-ink-300">ATTRIBUTION BREAKDOWN</span>
                    <span className="text-[10px] text-ink-500 uppercase">Probabilistic</span>
                  </div>

                  {selectedSpillCandidates[0] && (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-ink-400">
                        <span>Distance Match</span>
                        <span className="font-mono text-white">{selectedSpillCandidates[0].distanceMatch}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: `${selectedSpillCandidates[0].distanceMatch}%` }} />
                      </div>

                      <div className="flex justify-between text-ink-400 pt-1">
                        <span>Time Match</span>
                        <span className="font-mono text-white">{selectedSpillCandidates[0].timeMatch}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: `${selectedSpillCandidates[0].timeMatch}%` }} />
                      </div>

                      <div className="flex justify-between text-ink-400 pt-1">
                        <span>Trajectory Match</span>
                        <span className="font-mono text-white">{selectedSpillCandidates[0].trajectoryMatch}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedSpillCandidates[0].trajectoryMatch}%` }} />
                      </div>

                      <div className="flex justify-between text-ink-400 pt-1">
                        <span>Drift Compatibility</span>
                        <span className="font-mono text-white">{selectedSpillCandidates[0].driftCompatibility}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${selectedSpillCandidates[0].driftCompatibility}%` }} />
                      </div>

                      <div className="flex justify-between text-ink-400 pt-1">
                        <span>AIS Track Continuity</span>
                        <span className="font-mono text-white">{selectedSpillCandidates[0].aisContinuity}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${selectedSpillCandidates[0].aisContinuity}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Top 3 Candidate Vessels */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-ink-300">
                    {selectedSpill.id} — SUSPECT RANKING
                  </span>
                  <div className="space-y-1.5">
                    {selectedSpillCandidates.map((candidate, idx) => {
                      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                      return (
                        <div
                          key={candidate.vesselId}
                          className={`flex items-center justify-between rounded-lg p-2 border ${
                            idx === 0
                              ? 'border-red-500/40 bg-red-500/10 text-white'
                              : 'border-white/[0.04] bg-white/[0.01] text-ink-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{medal}</span>
                            <div>
                              <p className={`font-semibold text-xs ${idx === 0 ? 'text-red-300' : 'text-white'}`}>
                                {candidate.vesselName}
                              </p>
                              <p className="font-mono text-[10px] text-ink-500">MMSI {candidate.mmsi}</p>
                            </div>
                          </div>
                          <span className={`font-mono text-xs font-bold ${idx === 0 ? 'text-red-400' : 'text-ink-300'}`}>
                            {candidate.overallScore}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Action Buttons: VIEW VESSEL, BACKTRACK, SATELLITE */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (primarySuspectForSelectedSpill) {
                        setSelectedVessel(primarySuspectForSelectedSpill);
                        setIsFollowingVessel(true);
                      }
                    }}
                    className="rounded-xl border border-red-500/40 bg-red-500/20 py-2 text-[11px] font-bold text-red-200 transition-all hover:bg-red-500/30 text-center shadow-sm"
                  >
                    VIEW VESSEL
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBacktrackSpillId(backtrackSpillId === selectedSpill.id ? null : selectedSpill.id);
                    }}
                    className={`rounded-xl border py-2 text-[11px] font-bold transition-all text-center shadow-sm ${
                      backtrackSpillId === selectedSpill.id
                        ? 'border-yellow-400 bg-yellow-400/30 text-yellow-100'
                        : 'border-yellow-500/40 bg-yellow-500/15 text-yellow-200 hover:bg-yellow-500/25'
                    }`}
                  >
                    {backtrackSpillId === selectedSpill.id ? 'BACKTRACKING' : 'BACKTRACK'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMapView((m) => (m === 'satellite' ? 'terrain' : 'satellite'));
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.05] py-2 text-[11px] font-bold text-ink-200 transition-all hover:bg-white/[0.1] text-center shadow-sm"
                  >
                    VIEW SATELLITE
                  </button>
                </div>
              </div>
            </Panel>
          )}

          {/* Potentially Responsible Vessels Ranking */}
          <Panel>
            <PanelHeader
              title="POTENTIALLY RESPONSIBLE"
              subtitle="Correlated with active spills"
              icon={<ShieldAlertIcon className="h-4 w-4 text-red-400" />}
            />

            <div className="mt-3 space-y-2.5">
              {potentiallyResponsible.slice(0, 3).map(({ vessel, score }) => (
                <button
                  key={vessel.id}
                  type="button"
                  onClick={() => handleSelectVessel(vessel)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    selectedVessel?.id === vessel.id
                      ? 'border-red-500/50 bg-red-500/15 ring-1 ring-red-500/30'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-red-500/30 hover:bg-red-500/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <p className="text-[13px] font-bold text-white">{vessel.name}</p>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-400">
                        {vessel.type} · MMSI {vessel.mmsi}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-red-400">{score}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-400">
                    <span>{vessel.speedKnots.toFixed(1)} kn · {vessel.headingLabel}</span>
                    <span className="text-[10px] text-red-300 uppercase font-bold">
                      Potential Suspect
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {/* Active Oil Spills List */}
          <Panel>
            <PanelHeader
              title="ACTIVE SPILL DETECTIONS"
              subtitle="Sentinel-1 SAR Verified Slicks"
              icon={<WavesIcon className="h-4 w-4 text-amber-400" />}
            />

            <div className="mt-3 space-y-2">
              {activeSpills.slice(0, 3).map((spill) => (
                <button
                  key={spill.id}
                  type="button"
                  onClick={() => handleSelectSpill(spill)}
                  className={`w-full rounded-xl border p-2.5 text-left transition-all ${
                    selectedSpill?.id === spill.id
                      ? 'border-amber-500/50 bg-amber-500/15 ring-1 ring-amber-500/30'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{spill.id}</span>
                    <RiskBadge risk={spill.risk} />
                  </div>
                  <p className="mt-1 text-xs text-ink-300 truncate">{spill.location}</p>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-ink-400">
                    <span>{spill.areaKm2} km² · {spill.confidence}% conf</span>
                    <span>{formatTime(spill.detectedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}