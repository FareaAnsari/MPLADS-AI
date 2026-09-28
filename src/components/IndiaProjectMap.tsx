import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import lokSabhaMesh from '../data/indiaConstituenciesMesh.json';
import rajyaSabhaMesh from '../data/indiaRajyaSabhaMesh.json';
import geographicStatesData from '../data/indiaGeographicStates.json';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  MapPin, 
  ArrowRight, 
  Globe2, 
  ShieldCheck,
  Search,
  Navigation,
  Users,
  Award,
  X,
  TrendingUp
} from 'lucide-react';
import { VillageIntelligenceDrawer } from './rural/VillageIntelligenceDrawer';
import { getVillageIntelligence, UnifiedVillageIntelligence } from '../services/unifiedIntelligenceService';
import { calculatePopupPosition } from '../utils/mapPopupPositioner';

interface IndiaProjectMapProps {
  onStateSelect?: (stateName: string) => void;
}

type MapHouseMode = 'loksabha' | 'rajyasabha';
type UtilizationFilter = 'ALL' | 'HIGH' | 'MODERATE' | 'ACTIVE' | 'LOW';

interface ConstituencyItem {
  id: string;
  geoId: string;
  stateId: string;
  stateCode?: string;
  state: string;
  stateName: string;
  pcId: string;
  pcName: string;
  name: string;
  house: string;
  mpName: string;
  category?: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  x: number;
  y: number;
  path: string;
  allocatedAmountCr: string;
  recordedExpenditureCr: string;
  fundUtilizationPercent: number;
  worksCompleted: number;
  worksOngoing: number;
  worksRecommended: number;
  completionRate?: number;
  remainingBalanceCr?: string;
}

interface ConstituencyTileProps {
  c: ConstituencyItem;
  isHovered: boolean;
  isSelected: boolean;
  colors: { fill: string; stroke: string; text: string; bg: string };
  onEnter: (c: ConstituencyItem) => void;
  onLeave: () => void;
  onClick: (c: ConstituencyItem, e: React.MouseEvent) => void;
}

const ConstituencyTile = React.memo<ConstituencyTileProps>(({
  c,
  isHovered,
  isSelected,
  colors,
  onEnter,
  onLeave,
  onClick
}) => {
  return (
    <g 
      className="cursor-pointer"
      onMouseEnter={() => onEnter(c)}
      onMouseLeave={onLeave}
      onClick={(e) => onClick(c, e)}
    >
      {/* Glowing Halo on Selection or Hover (Stable Static SVG Ring - Zero Flicker) */}
      {(isHovered || isSelected) && (
        <circle
          cx={c.x}
          cy={c.y}
          r="10"
          fill="#2563eb"
          opacity="0.3"
          className="pointer-events-none"
        />
      )}

      {/* High-Definition Regular Hexagon Tile */}
      <path
        d={c.path}
        fill={isSelected ? '#1d4ed8' : isHovered ? '#2563eb' : colors.fill}
        stroke={isSelected || isHovered ? '#ffffff' : colors.stroke}
        strokeWidth={isSelected || isHovered ? '2.0' : '0.85'}
        strokeLinejoin="round"
        filter={isSelected || isHovered ? 'url(#glow-hover)' : undefined}
        className="hover:brightness-110"
      />
    </g>
  );
});

export const IndiaProjectMap: React.FC<IndiaProjectMapProps> = ({ onStateSelect }) => {
  const navigate = useNavigate();
  const [houseMode, setHouseMode] = useState<MapHouseMode>('loksabha');
  const [selectedStateName, setSelectedStateName] = useState<string>('All States');
  const [hoveredConstituency, setHoveredConstituency] = useState<ConstituencyItem | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<ConstituencyItem | null>(null);
  
  // High-Definition Two-Finger Zoom and 4-Way Pan (In/Out, Left/Right, Up/Down)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Touch references for 2-finger multi-touch gestures
  const initialTouchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const initialTouchCenterRef = useRef<{ x: number; y: number } | null>(null);
  const initialPanOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Drag and Container tracking
  const [containerBounds, setContainerBounds] = useState<{ width: number; height: number }>({ width: 600, height: 550 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [utilizationFilter, setUtilizationFilter] = useState<UtilizationFilter>('ALL');
  const [villageDrawerData, setVillageDrawerData] = useState<UnifiedVillageIntelligence | null>(null);

  // Active dataset according to house mode (Lok Sabha: 543 seats, Rajya Sabha: 245 seats)
  const activeHouseData: ConstituencyItem[] = useMemo(() => {
    return (houseMode === 'loksabha' ? lokSabhaMesh : rajyaSabhaMesh) as ConstituencyItem[];
  }, [houseMode]);

  // Geographic States data with official Survey of India boundary paths
  const statesList = useMemo(() => {
    return geographicStatesData.states;
  }, []);

  // Filtered Constituencies by State, Search, and Fund Utilization Scale (No Caste)
  const filteredConstituencies = useMemo(() => {
    return activeHouseData.filter(c => {
      const matchState = selectedStateName === 'All States' || c.state.toLowerCase() === selectedStateName.toLowerCase();
      
      let matchUtil = true;
      if (utilizationFilter === 'HIGH') matchUtil = c.fundUtilizationPercent >= 50;
      else if (utilizationFilter === 'MODERATE') matchUtil = c.fundUtilizationPercent >= 40 && c.fundUtilizationPercent < 50;
      else if (utilizationFilter === 'ACTIVE') matchUtil = c.fundUtilizationPercent >= 30 && c.fundUtilizationPercent < 40;
      else if (utilizationFilter === 'LOW') matchUtil = c.fundUtilizationPercent < 30;

      const matchSearch = !searchQuery || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase());

      return matchState && matchUtil && matchSearch;
    });
  }, [activeHouseData, selectedStateName, utilizationFilter, searchQuery]);

  // Utilization scale counts
  const utilizationCounts = useMemo(() => {
    let high = 0, moderate = 0, active = 0, low = 0;
    activeHouseData.forEach(c => {
      if (c.fundUtilizationPercent >= 50) high++;
      else if (c.fundUtilizationPercent >= 40) moderate++;
      else if (c.fundUtilizationPercent >= 30) active++;
      else low++;
    });
    return { all: activeHouseData.length, high, moderate, active, low };
  }, [activeHouseData]);

  // Unique States list for dropdown
  const stateOptions = useMemo(() => {
    const s = new Set<string>();
    activeHouseData.forEach(c => s.add(c.state));
    return Array.from(s).sort();
  }, [activeHouseData]);

  // Color helper based strictly on Official Fund Utilization Scale
  const getUtilizationColor = useCallback((percent: number) => {
    if (percent >= 50) return { fill: '#10b981', stroke: '#047857', text: 'text-emerald-700', bg: 'bg-emerald-500' }; // High (>50%)
    if (percent >= 40) return { fill: '#38bdf8', stroke: '#0284c7', text: 'text-sky-700', bg: 'bg-sky-500' };       // Moderate (40-50%)
    if (percent >= 30) return { fill: '#fbbf24', stroke: '#d97706', text: 'text-amber-700', bg: 'bg-amber-500' };    // Active (30-40%)
    return { fill: '#f87171', stroke: '#dc2626', text: 'text-rose-700', bg: 'bg-rose-500' };                          // Low (<30%)
  }, []);

  // Stabilized Hover Handling with debounce to prevent micro-flicker on hex boundaries
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHexEnter = useCallback((c: ConstituencyItem) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (selectedConstituency || isDragging) return;
    setHoveredConstituency(prev => (prev?.id === c.id ? prev : c));
  }, [selectedConstituency, isDragging]);

  const handleHexLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredConstituency(null);
    }, 50);
  }, []);

  // Live GPS Telemetry calculation with direct DOM updates in RAF to eliminate re-renders
  const gpsTextRef = useRef<HTMLSpanElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafIdRef.current) return;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!gpsTextRef.current) return;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const latCalc = (37.2 - (y / rect.height) * 29.5).toFixed(4);
      const lngCalc = (68.0 + (x / rect.width) * 30.0).toFixed(4);
      gpsTextRef.current.textContent = `Map GPS: ${latCalc}° N, ${lngCalc}° E`;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const updateBounds = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerBounds({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(container);
    window.addEventListener('resize', updateBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  // Compute collision-aware, viewport-constrained screen coordinates for hover tooltip
  const tooltipPosition = useMemo(() => {
    if (!hoveredConstituency || !mapContainerRef.current) return null;
    const { width: mWidth, height: mHeight } = containerBounds;
    
    const svgWidth = Math.min(mWidth - 24, 590);
    const svgHeight = (svgWidth / 612) * 696;
    
    const rawX = (mWidth / 2) + panOffset.x + ((hoveredConstituency.x - 306) / 612) * svgWidth * zoomLevel;
    const rawY = (mHeight / 2) + panOffset.y + ((hoveredConstituency.y - 348) / 696) * svgHeight * zoomLevel;
    
    // Popup card dimensions: ~270px width, ~130px height
    const popupSize = { width: 270, height: 130 };
    return calculatePopupPosition({ x: rawX, y: rawY }, popupSize, containerBounds, 14);
  }, [hoveredConstituency, panOffset, zoomLevel, containerBounds]);

  // Trackpad Two-Finger Wheel: Pan (X, Y) and Zoom (pinch/ctrl)
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        // Pinch-to-zoom gesture on trackpad
        const zoomDelta = -e.deltaY * 0.015;
        setZoomLevel(prev => {
          const next = Math.min(Math.max(0.7, prev + zoomDelta), 4.0);
          return parseFloat(next.toFixed(2));
        });
      } else {
        // Two-finger scroll: Pan up/down and left/right simultaneously
        setPanOffset(prev => ({
          x: Math.min(Math.max(prev.x - e.deltaX * 0.8, -450), 450),
          y: Math.min(Math.max(prev.y - e.deltaY * 0.8, -450), 450)
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 1-FINGER TOUCH / MOUSE DRAG-TO-PAN (PRESS + HOLD + MOVE IN ANY OF 4 DIRECTIONS)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to main left click or single touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
      moved: false
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(deltaX, deltaY);

    if (dist > 5) {
      dragStartRef.current.moved = true;
      if (!isDragging) setIsDragging(true);

      setPanOffset({
        x: Math.min(Math.max(dragStartRef.current.panX + deltaX, -450), 450),
        y: Math.min(Math.max(dragStartRef.current.panY + deltaY, -450), 450)
      });
    }
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    setIsDragging(false);
  };

  // Two-Finger Touch Gestures on Mobile/Tablets: Simultaneous Pinch Zoom and 4-Way Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      initialTouchDistRef.current = dist;
      initialZoomRef.current = zoomLevel;
      initialTouchCenterRef.current = { x: centerX, y: centerY };
      initialPanOffsetRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistRef.current !== null && initialTouchCenterRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const currentCenterX = (t1.clientX + t2.clientX) / 2;
      const currentCenterY = (t1.clientY + t2.clientY) / 2;

      // 1. Two-Finger Pinch Zoom
      const zoomRatio = currentDist / initialTouchDistRef.current;
      const nextZoom = Math.min(Math.max(0.7, initialZoomRef.current * zoomRatio), 4.0);
      setZoomLevel(parseFloat(nextZoom.toFixed(2)));

      // 2. Two-Finger 4-Way Pan (Left, Right, Up, Down)
      const deltaX = currentCenterX - initialTouchCenterRef.current.x;
      const deltaY = currentCenterY - initialTouchCenterRef.current.y;
      setPanOffset({
        x: Math.min(Math.max(initialPanOffsetRef.current.x + deltaX, -450), 450),
        y: Math.min(Math.max(initialPanOffsetRef.current.y + deltaY, -450), 450)
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialTouchDistRef.current = null;
      initialTouchCenterRef.current = null;
    }
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedConstituency(null);
  };

  const handleTileClick = useCallback((c: ConstituencyItem, e: React.MouseEvent) => {
    if (dragStartRef.current?.moved) return;
    e.stopPropagation();
    setSelectedConstituency(c);
    setHoveredConstituency(null);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col relative transition-all duration-300">
      
      {/* 1. TOP PARLIAMENTARY CONTROLS BAR */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 space-y-3 z-20">
        
        {/* Header Title Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex items-center justify-center shadow-sm shrink-0">
              <Globe2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  National Parliamentary Map
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold font-mono shrink-0">
                  {houseMode === 'loksabha' ? '543 Constituencies' : '245 Rajya Sabha Seats'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Authoritative WGS84 Geolocation • Drag to Pan (Left/Right/Up/Down) • 2-finger zoom
              </p>
            </div>
          </div>
        </div>

        {/* HOUSE SELECTION SEGMENTED TABS */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
          <button
            onClick={() => {
              setHouseMode('loksabha');
              setSelectedConstituency(null);
            }}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all duration-200 ${
              houseMode === 'loksabha'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Lok Sabha (543 Constituencies)</span>
          </button>
          <button
            onClick={() => {
              setHouseMode('rajyasabha');
              setSelectedConstituency(null);
            }}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all duration-200 ${
              houseMode === 'rajyasabha'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Rajya Sabha (245 Seats)</span>
          </button>
        </div>

        {/* Search & State Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-7 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={houseMode === 'loksabha' ? "Search 543 Constituencies, MPs or States..." : "Search 245 RS Members or States..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 shadow-2xs font-medium"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              value={selectedStateName}
              onChange={(e) => {
                setSelectedStateName(e.target.value);
                if (onStateSelect && e.target.value !== 'All States') onStateSelect(e.target.value);
              }}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none shadow-2xs cursor-pointer truncate"
            >
              <option value="All States">All States / UTs ({stateOptions.length})</option>
              {stateOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 2. SUB-BAR: OFFICIAL FUND UTILIZATION FILTER PILLS + CANONICAL GEOGRAPHIC TELEMETRY */}
      <div className="px-3 sm:px-4 py-2 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Performance & Expenditure Scale Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium text-[11px] mr-0.5">Fund Utilization:</span>
          
          <button
            onClick={() => setUtilizationFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
              utilizationFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All ({utilizationCounts.all})
          </button>

          <button
            onClick={() => setUtilizationFilter('HIGH')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 transition ${
              utilizationFilter === 'HIGH'
                ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
            <span>&gt; 50% High ({utilizationCounts.high})</span>
          </button>

          <button
            onClick={() => setUtilizationFilter('MODERATE')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 transition ${
              utilizationFilter === 'MODERATE'
                ? 'bg-sky-600 text-white shadow-2xs ring-2 ring-sky-300'
                : 'bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-400"></span>
            <span>40–50% Moderate ({utilizationCounts.moderate})</span>
          </button>

          <button
            onClick={() => setUtilizationFilter('ACTIVE')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 transition ${
              utilizationFilter === 'ACTIVE'
                ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400"></span>
            <span>30–40% Active ({utilizationCounts.active})</span>
          </button>

          <button
            onClick={() => setUtilizationFilter('LOW')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 transition ${
              utilizationFilter === 'LOW'
                ? 'bg-rose-600 text-white shadow-2xs ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-400"></span>
            <span>&lt; 30% Low ({utilizationCounts.low})</span>
          </button>
        </div>

        {/* CANONICAL GEOGRAPHIC TELEMETRY (FIXED HEIGHT CONTAINER FOR ZERO-REFLOW STABILITY) */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono h-6 min-h-[24px]">
          {selectedConstituency ? (
            <div className="flex items-center space-x-1.5 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
              <span className="font-bold">{selectedConstituency.name}:</span>
              <span>{(selectedConstituency.lat || selectedConstituency.latitude).toFixed(4)}° N, {(selectedConstituency.lng || selectedConstituency.longitude).toFixed(4)}° E</span>
            </div>
          ) : hoveredConstituency ? (
            <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              <Navigation className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="font-semibold">{hoveredConstituency.name}:</span>
              <span>{(hoveredConstituency.lat || hoveredConstituency.latitude).toFixed(4)}° N, {(hoveredConstituency.lng || hoveredConstituency.longitude).toFixed(4)}° E</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-slate-500">
              <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
              <span ref={gpsTextRef}>Map GPS: 23.4733° N, 77.9479° E</span>
            </div>
          )}
        </div>

      </div>

      {/* 3. MAIN CONSTITUENCY MAP CANVAS (PRESS + HOLD + MOVE 4-WAY DRAG-TO-PAN) */}
      <div 
        ref={mapContainerRef}
        className={`relative flex-1 min-h-[520px] sm:min-h-[580px] bg-gradient-to-b from-white via-slate-50/40 to-blue-50/20 flex items-center justify-center overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget && !dragStartRef.current?.moved) {
            setSelectedConstituency(null);
          }
        }}
      >
        
        {/* Subtle Coordinate Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(#0b2e59 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px'
          }}
        ></div>

        {/* Floating Zoom & Pan Controls (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 flex flex-col space-y-1 z-20 shadow-md rounded-xl overflow-hidden border border-slate-200/80 bg-white">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 4.0))}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200"></div>
          <div className="text-[9px] font-bold text-slate-400 text-center py-0.5 bg-slate-50">
            {Math.round(zoomLevel * 100)}%
          </div>
          <div className="h-px bg-slate-200"></div>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.7))}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-700 transition"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200"></div>
          <button 
            onClick={resetView}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Official Fund Utilization Scale Legend (Matching Reference Scheme) */}
        <div className="absolute bottom-4 left-16 bg-white/95 px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-lg text-[11px] font-sans space-y-1.5 z-20 backdrop-blur-md pointer-events-none">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Fund Utilization Scale
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#10b981] border border-emerald-600 shadow-2xs"></span>
              <span className="font-semibold text-slate-800">&gt; 50% High</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#38bdf8] border border-sky-500 shadow-2xs"></span>
              <span className="font-semibold text-slate-800">40–50% Moderate</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#fbbf24] border border-amber-500 shadow-2xs"></span>
              <span className="font-semibold text-slate-800">30–40% Active</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f87171] border border-rose-500 shadow-2xs"></span>
              <span className="font-semibold text-slate-800">&lt; 30% Low</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE HD SVG MAP OF INDIA */}
        <div 
          className="w-full h-full flex items-center justify-center select-none z-10 p-3 pointer-events-auto"
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out'
          }}
        >
          <svg 
            viewBox="0 0 612 696" 
            className="w-full h-[460px] sm:h-[540px] max-w-[590px] drop-shadow-md overflow-visible"
            onMouseMove={handleMouseMove}
          >
            <defs>
              <clipPath id="india-boundary-clip">
                {statesList.map((st) => (
                  <path key={`clip-${st.name}`} d={st.path} />
                ))}
              </clipPath>
              <filter id="glow-hover" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#2563eb" floodOpacity="0.75" />
              </filter>
            </defs>

            {/* 1. HD OFFICIAL GEOGRAPHIC STATE OUTLINES (BACKGROUND) */}
            <g className="state-boundaries-bg">
              {statesList.map((st) => (
                <path
                  key={`bg-${st.name}`}
                  d={st.path}
                  fill="#f8fafc"
                  stroke="#e2e8f0"
                  strokeWidth="1.0"
                />
              ))}
            </g>

            {/* 2. HD CONSTITUENCY TILES (Deterministic Canonical Geolocation) */}
            <g className="constituency-tiles">
              {filteredConstituencies.map((c) => (
                <ConstituencyTile
                  key={c.id || c.geoId}
                  c={c}
                  isHovered={hoveredConstituency?.id === c.id}
                  isSelected={selectedConstituency?.id === c.id}
                  colors={getUtilizationColor(c.fundUtilizationPercent)}
                  onEnter={handleHexEnter}
                  onLeave={handleHexLeave}
                  onClick={handleTileClick}
                />
              ))}
            </g>

            {/* 3. HD OFFICIAL GEOGRAPHIC STATE OUTLINES (BOLD RED FOREGROUND CONTOURS) */}
            <g className="state-boundaries-fg pointer-events-none">
              {statesList.map((st) => (
                <path
                  key={`fg-${st.name}`}
                  d={st.path}
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
            </g>

          </svg>
        </div>

        {/* 4. ANIMATED HOVER TOOLTIP (Instant, Crisp, Zero-Glitch Positioning) */}
        {!selectedConstituency && hoveredConstituency && (
          <div 
            className="absolute z-30 bg-slate-900/95 text-white text-xs p-3 rounded-xl shadow-2xl border border-blue-400/40 pointer-events-none backdrop-blur-md min-w-[240px] max-w-[280px]"
            style={tooltipPosition ? { 
              left: `${tooltipPosition.left}px`, 
              top: `${tooltipPosition.top}px` 
            } : { 
              left: `${(hoveredConstituency.x / 612) * 100}%`, 
              top: `${(hoveredConstituency.y / 696) * 100}%` 
            }}
          >
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-200">
                {hoveredConstituency.stateName} ({hoveredConstituency.stateId})
              </span>
              <span className={`font-bold ${getUtilizationColor(hoveredConstituency.fundUtilizationPercent).text}`}>
                {hoveredConstituency.fundUtilizationPercent.toFixed(1)}% Utilized
              </span>
            </div>

            <div className="font-bold text-white text-sm truncate">{hoveredConstituency.pcName}</div>
            <div className="text-[11px] text-slate-300 mt-0.5 truncate">
              Hon'ble MP: <strong className="text-cyan-300">{hoveredConstituency.mpName}</strong>
            </div>

            <div className="text-[10px] mt-1.5 text-slate-400 font-mono flex justify-between border-t border-slate-800 pt-1">
              <span>Alloc: ₹{hoveredConstituency.allocatedAmountCr} Cr</span>
              <span>Spent: ₹{hoveredConstituency.recordedExpenditureCr} Cr</span>
            </div>
            
            {/* Development Validation Debug Badge */}
            <div className="text-[8.5px] text-blue-300/90 font-mono mt-1 pt-0.5 border-t border-slate-800/60 flex justify-between truncate">
              <span>GEO: {hoveredConstituency.geoId}</span>
              <span>{hoveredConstituency.house}</span>
            </div>
          </div>
        )}

        {/* 5. FLOATING ACTIVE CONSTITUENCY INSPECTOR CARD (Adaptive Left/Right Docking to Never Block Selected State) */}
        {selectedConstituency && (
          <div 
            className={`absolute bottom-3 ${
              selectedConstituency.x > 306 ? 'left-3 sm:left-14' : 'right-3 sm:right-4'
            } bg-white/98 text-slate-900 p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-200/90 max-w-[310px] sm:min-w-[290px] z-30 backdrop-blur-md animate-in fade-in ${
              selectedConstituency.x > 306 ? 'slide-in-from-left-4' : 'slide-in-from-right-4'
            } duration-150 space-y-3`}
          >
            
            {/* Top Bar with State and Close Button */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>{selectedConstituency.house?.toUpperCase() || 'PARLIAMENTARY'} CONSTITUENCY</span>
              </span>

              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-600 truncate max-w-[120px]">
                  {selectedConstituency.stateName}
                </span>
                <button
                  onClick={() => setSelectedConstituency(null)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Close Card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Constituency Name & MP Name */}
            <div>
              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight uppercase tracking-tight">
                {selectedConstituency.pcName}
              </h4>
              <div className="text-xs text-slate-600 mt-1">
                Current MP: <strong className="text-slate-900 font-bold uppercase">{selectedConstituency.mpName}</strong>
              </div>
            </div>

            {/* Canonical Geolocation Coordinates Box */}
            <div className="text-[10px] font-mono bg-blue-50/90 p-2 rounded-xl border border-blue-200/80 text-blue-900 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold">Coordinates:</span>
              </div>
              <span className="font-bold font-mono">
                {(selectedConstituency.lat || selectedConstituency.latitude).toFixed(4)}° N, {(selectedConstituency.lng || selectedConstituency.longitude).toFixed(4)}° E
              </span>
            </div>

            {/* Development Validation Mode Badge */}
            <div className="text-[9px] font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-200/70 text-slate-500 space-y-0.5">
              <div className="flex justify-between">
                <span><strong>GEO ID:</strong> {selectedConstituency.geoId}</span>
                <span><strong>STATE:</strong> {selectedConstituency.stateId}</span>
              </div>
              <div className="truncate">
                <span><strong>PC:</strong> {selectedConstituency.pcId} ({selectedConstituency.pcName})</span>
              </div>
            </div>

            {/* Fund Metrics Box */}
            <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Official Allocation:</span>
                <span className="font-mono font-bold text-slate-900">₹ {selectedConstituency.allocatedAmountCr} Cr</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Recorded Expenditure:</span>
                <span className="font-mono font-bold text-emerald-700">₹ {selectedConstituency.recordedExpenditureCr} Cr</span>
              </div>
              
              {/* Score Bar */}
              <div className="space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 font-medium">Fund Utilization:</span>
                  <span className={`font-mono font-bold ${getUtilizationColor(selectedConstituency.fundUtilizationPercent).text}`}>
                    {selectedConstituency.fundUtilizationPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getUtilizationColor(selectedConstituency.fundUtilizationPercent).bg}`} 
                    style={{ width: `${Math.min(100, selectedConstituency.fundUtilizationPercent)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Direct Navigation Button to MP Dashboard */}
            <div className="space-y-1.5 pt-0.5">
              <button
                onClick={() => navigate(`/mps/${selectedConstituency.id}`)}
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Open {selectedConstituency.mpName}'s Dashboard</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>

              <button
                onClick={() => setVillageDrawerData(getVillageIntelligence('556214'))}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                <span className="truncate">Inspect Village Assets in {selectedConstituency.name}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 4. FOOTER NOTE */}
      <div className="px-3.5 py-2 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Official Survey of India boundaries mapped to MoSPI registers</span>
        </div>
        <span className="hidden sm:inline text-slate-400 shrink-0">Tap any constituency to inspect</span>
      </div>

      {/* Slide-Over Village Intelligence Drawer */}
      <VillageIntelligenceDrawer
        villageData={villageDrawerData}
        isOpen={!!villageDrawerData}
        onClose={() => setVillageDrawerData(null)}
      />

    </div>
  );
};
