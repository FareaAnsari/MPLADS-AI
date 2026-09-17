import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_STATES_DATA, MOCK_PROJECTS, SHOWCASE_PROJECT_ID } from '../data/mockData';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  MapPin, 
  ArrowRight, 
  Layers, 
  Globe2, 
  Satellite, 
  Flame, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Maximize2, 
  Compass, 
  ShieldCheck,
  Activity,
  SearchCode
} from 'lucide-react';
import { VillageIntelligenceDrawer } from './rural/VillageIntelligenceDrawer';
import { getVillageIntelligence, UnifiedVillageIntelligence } from '../services/unifiedIntelligenceService';

interface IndiaProjectMapProps {
  onStateSelect?: (stateName: string) => void;
}

type MapViewMode = 'vector' | 'satellite' | 'heatmap';

interface ProjectMarker {
  id: string;
  projectId?: string;
  name: string;
  state: string;
  district: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  status: 'completed' | 'inProgress' | 'delayed' | 'notStarted' | 'highRisk';
  count: number;
  financialProgress: number;
  physicalProgress: number;
  satelliteVerified: boolean;
  satelliteDelta: string;
  mpName: string;
  costCr: string;
}

export const IndiaProjectMap: React.FC<IndiaProjectMapProps> = ({ onStateSelect }) => {
  const navigate = useNavigate();
  const [selectedStateName, setSelectedStateName] = useState<string>('Maharashtra');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredMarker, setHoveredMarker] = useState<ProjectMarker | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<ProjectMarker | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>('satellite');
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showRadarScan, setShowRadarScan] = useState<boolean>(true);
  const [filterRiskOnly, setFilterRiskOnly] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: string; lng: string }>({ lat: '18.5793° N', lng: '73.9827° E' });
  const [villageDrawerData, setVillageDrawerData] = useState<UnifiedVillageIntelligence | null>(null);

  const selectedState = MOCK_STATES_DATA[selectedStateName] || MOCK_STATES_DATA['Maharashtra'];

  const handleStateClick = (state: string) => {
    setSelectedStateName(state);
    if (onStateSelect) {
      onStateSelect(state);
    }
  };

  // Comprehensive Project Markers with Geo-coordinates and Satellite Earth Observation Metrics
  const markers: ProjectMarker[] = [
    // Maharashtra
    { 
      id: 'm1', 
      projectId: SHOWCASE_PROJECT_ID,
      name: 'Pune Community Hall (Wagholi)', 
      state: 'Maharashtra', 
      district: 'Pune',
      x: 215, 
      y: 320, 
      lat: 18.5793,
      lng: 73.9827,
      status: 'highRisk', 
      count: 42,
      financialProgress: 74,
      physicalProgress: 43,
      satelliteVerified: false,
      satelliteDelta: '⚠️ Discrepancy: Satellite SAR detects 43% ground structure vs 74% claimed payment',
      mpName: 'Shri A. Khan (Pune)',
      costCr: '₹0.20 Cr'
    },
    { 
      id: 'm2', 
      name: 'Mumbai Suburban High School Lab', 
      state: 'Maharashtra', 
      district: 'Mumbai Suburban',
      x: 190, 
      y: 305, 
      lat: 19.0760,
      lng: 72.8777,
      status: 'completed', 
      count: 88,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ Verified: Rooftop solar & civil expansion 100% visible on Sentinel-2 optical feed',
      mpName: 'Smt. P. Kulkarni (Mumbai North)',
      costCr: '₹0.45 Cr'
    },
    { 
      id: 'm3', 
      name: 'Nashik Rural Piped Water Grid', 
      state: 'Maharashtra', 
      district: 'Nashik',
      x: 210, 
      y: 295, 
      lat: 19.9975,
      lng: 73.7898,
      status: 'inProgress', 
      count: 35,
      financialProgress: 60,
      physicalProgress: 58,
      satelliteVerified: true,
      satelliteDelta: '✓ Verified: Pipeline trenching and overhead tank matched to ground GIS telemetry',
      mpName: 'Shri H. Godse (Nashik)',
      costCr: '₹0.38 Cr'
    },
    { 
      id: 'm4', 
      name: 'Nagpur Multi-Skill Training Center', 
      state: 'Maharashtra', 
      district: 'Nagpur',
      x: 270, 
      y: 285, 
      lat: 21.1458,
      lng: 79.0882,
      status: 'delayed', 
      count: 29,
      financialProgress: 52,
      physicalProgress: 31,
      satelliteVerified: false,
      satelliteDelta: '⚠️ Delay Alert: Structural roof framing stalled for past 45 days',
      mpName: 'Shri N. Gadkari (Nagpur)',
      costCr: '₹0.85 Cr'
    },
    { 
      id: 'm5', 
      name: 'Satara Primary Health Center Expansion', 
      state: 'Maharashtra', 
      district: 'Satara',
      x: 212, 
      y: 345, 
      lat: 17.6805,
      lng: 74.0183,
      status: 'delayed', 
      count: 18,
      financialProgress: 45,
      physicalProgress: 28,
      satelliteVerified: false,
      satelliteDelta: '⚠️ Excavation footprint lagged by 3 weeks against CPM schedule',
      mpName: 'Shri S. Shinde (Satara)',
      costCr: '₹0.25 Cr'
    },
    // Gujarat
    { 
      id: 'g1', 
      name: 'Ahmedabad Peri-Urban Paver Road', 
      state: 'Gujarat', 
      district: 'Ahmedabad',
      x: 155, 
      y: 250, 
      lat: 23.0225,
      lng: 72.5714,
      status: 'completed', 
      count: 64,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ High-Res Cartosat-3 confirms 2.4 km tarred road stretch with street lighting',
      mpName: 'Shri K. Patel (Ahmedabad West)',
      costCr: '₹0.60 Cr'
    },
    { 
      id: 'g2', 
      name: 'Surat Coastal Solar Street Grid', 
      state: 'Gujarat', 
      district: 'Surat',
      x: 165, 
      y: 280, 
      lat: 21.1702,
      lng: 72.8311,
      status: 'inProgress', 
      count: 31,
      financialProgress: 50,
      physicalProgress: 52,
      satelliteVerified: true,
      satelliteDelta: '✓ Luminance night-band validation shows active grid lighting',
      mpName: 'Shri M. Darshana (Surat)',
      costCr: '₹0.32 Cr'
    },
    // Rajasthan
    { 
      id: 'r1', 
      name: 'Jaipur Eco-Sanitation Bio-Toilets', 
      state: 'Rajasthan', 
      district: 'Jaipur',
      x: 195, 
      y: 195, 
      lat: 26.9124,
      lng: 75.7873,
      status: 'completed', 
      count: 52,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ Verified: 14 sanitation clusters geo-tagged with QR code validation',
      mpName: 'Shri R. Sharma (Jaipur)',
      costCr: '₹0.28 Cr'
    },
    { 
      id: 'r2', 
      name: 'Jodhpur Rainwater Harvesting Check Dam', 
      state: 'Rajasthan', 
      district: 'Jodhpur',
      x: 160, 
      y: 205, 
      lat: 26.2389,
      lng: 73.0243,
      status: 'highRisk', 
      count: 24,
      financialProgress: 88,
      physicalProgress: 35,
      satelliteVerified: false,
      satelliteDelta: '🚨 Ghost Work Alert: Water body optical index shows no catchment bund wall constructed',
      mpName: 'Shri G. Shekhawat (Jodhpur)',
      costCr: '₹0.50 Cr'
    },
    // Uttar Pradesh
    { 
      id: 'u1', 
      name: 'Varanasi Youth Sports Arena & Track', 
      state: 'Uttar Pradesh', 
      district: 'Varanasi',
      x: 320, 
      y: 215, 
      lat: 25.3176,
      lng: 82.9739,
      status: 'highRisk', 
      count: 71,
      financialProgress: 81,
      physicalProgress: 49,
      satelliteVerified: false,
      satelliteDelta: '⚠️ Material Price Spike: Rebar billed at +28% premium above UP PWD schedule',
      mpName: 'Shri N. Modi (Varanasi)',
      costCr: '₹1.20 Cr'
    },
    { 
      id: 'u2', 
      name: 'Lucknow Maternal Health Wing', 
      state: 'Uttar Pradesh', 
      district: 'Lucknow',
      x: 285, 
      y: 195, 
      lat: 26.8467,
      lng: 80.9462,
      status: 'inProgress', 
      count: 58,
      financialProgress: 65,
      physicalProgress: 62,
      satelliteVerified: true,
      satelliteDelta: '✓ Multi-story slab casting verified via Bhuvan 2.5m stereo pair',
      mpName: 'Shri R. Singh (Lucknow)',
      costCr: '₹0.95 Cr'
    },
    // Madhya Pradesh
    { 
      id: 'mp1', 
      name: 'Bhopal Women Skill Training Center', 
      state: 'Madhya Pradesh', 
      district: 'Bhopal',
      x: 235, 
      y: 250, 
      lat: 23.2599,
      lng: 77.4126,
      status: 'inProgress', 
      count: 44,
      financialProgress: 55,
      physicalProgress: 50,
      satelliteVerified: true,
      satelliteDelta: '✓ Foundation perimeter clear and aligned with cadastral survey',
      mpName: 'Shri A. Sharma (Bhopal)',
      costCr: '₹0.40 Cr'
    },
    { 
      id: 'mp2', 
      name: 'Indore Smart Anganwadi Upgrades', 
      state: 'Madhya Pradesh', 
      district: 'Indore',
      x: 215, 
      y: 260, 
      lat: 22.7196,
      lng: 75.8577,
      status: 'completed', 
      count: 39,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ All 12 modular centers completed with child-friendly outdoor facilities',
      mpName: 'Shri S. Lalwani (Indore)',
      costCr: '₹0.35 Cr'
    },
    // Karnataka
    { 
      id: 'k1', 
      name: 'Bengaluru South Telemedicine PHC', 
      state: 'Karnataka', 
      district: 'Bengaluru Urban',
      x: 225, 
      y: 405, 
      lat: 12.9716,
      lng: 77.5946,
      status: 'completed', 
      count: 62,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ Fully operational facility with solar backup and optical fiber connectivity',
      mpName: 'Shri T. Surya (Bengaluru South)',
      costCr: '₹0.55 Cr'
    },
    { 
      id: 'k2', 
      name: 'Hubballi Stormwater Underground Drain', 
      state: 'Karnataka', 
      district: 'Dharwad',
      x: 205, 
      y: 375, 
      lat: 15.3647,
      lng: 75.1240,
      status: 'inProgress', 
      count: 27,
      financialProgress: 42,
      physicalProgress: 38,
      satelliteVerified: true,
      satelliteDelta: '✓ Culvert concrete placement verified by ground drone photogrammetry',
      mpName: 'Shri P. Joshi (Dharwad)',
      costCr: '₹0.48 Cr'
    },
    // Tamil Nadu
    { 
      id: 't1', 
      name: 'Chennai STEM Laboratory & Library', 
      state: 'Tamil Nadu', 
      district: 'Chennai',
      x: 255, 
      y: 435, 
      lat: 13.0827,
      lng: 80.2707,
      status: 'completed', 
      count: 55,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ Modern 2-story science wing operational and equipped',
      mpName: 'Dr. K. Kalanidhi (Chennai North)',
      costCr: '₹0.70 Cr'
    },
    { 
      id: 't2', 
      name: 'Madurai Rural Concrete Roadways', 
      state: 'Tamil Nadu', 
      district: 'Madurai',
      x: 235, 
      y: 470, 
      lat: 9.9252,
      lng: 78.1198,
      status: 'inProgress', 
      count: 33,
      financialProgress: 70,
      physicalProgress: 68,
      satelliteVerified: true,
      satelliteDelta: '✓ Cement concrete pavement laying 68% complete across 4 panchayats',
      mpName: 'Shri S. Venkatesan (Madurai)',
      costCr: '₹0.42 Cr'
    },
    // West Bengal & Bihar
    { 
      id: 'b1', 
      name: 'Patna Flood Relief Shelter & Raised Platform', 
      state: 'Bihar', 
      district: 'Patna',
      x: 350, 
      y: 210, 
      lat: 25.5941,
      lng: 85.1376,
      status: 'delayed', 
      count: 46,
      financialProgress: 60,
      physicalProgress: 34,
      satelliteVerified: false,
      satelliteDelta: '⚠️ Monsoon waterlogging stalled pier foundation works',
      mpName: 'Shri R. Prasad (Patna Sahib)',
      costCr: '₹0.65 Cr'
    },
    { 
      id: 'wb1', 
      name: 'Kolkata Urban Health & Wellness Clinic', 
      state: 'West Bengal', 
      district: 'Kolkata',
      x: 375, 
      y: 260, 
      lat: 22.5726,
      lng: 88.3639,
      status: 'delayed', 
      count: 51,
      financialProgress: 75,
      physicalProgress: 45,
      satelliteVerified: false,
      satelliteDelta: '⚠️ Vendor Nexus: Brick and steel supplier linked to blacklisted entity',
      mpName: 'Smt. M. Banerjee (Kolkata South)',
      costCr: '₹0.52 Cr'
    },
    // Northern / Southern hubs
    { 
      id: 'd1', 
      name: 'New Delhi Community Digital Learning Center', 
      state: 'Uttar Pradesh', 
      district: 'New Delhi',
      x: 225, 
      y: 165, 
      lat: 28.6139,
      lng: 77.2090,
      status: 'completed', 
      count: 95,
      financialProgress: 100,
      physicalProgress: 100,
      satelliteVerified: true,
      satelliteDelta: '✓ 100% Commissioned with 40 computer terminals and solar rooftop',
      mpName: 'Smt. B. Swaraj (New Delhi)',
      costCr: '₹0.75 Cr'
    },
    { 
      id: 'ap1', 
      name: 'Vijayawada Drinking Water Pipeline', 
      state: 'Andhra Pradesh', 
      district: 'Krishna',
      x: 265, 
      y: 360, 
      lat: 16.5062,
      lng: 80.6480,
      status: 'inProgress', 
      count: 38,
      financialProgress: 58,
      physicalProgress: 56,
      satelliteVerified: true,
      satelliteDelta: '✓ Pipeline laying and chlorination unit inspection passed',
      mpName: 'Shri K. Srinivas (Vijayawada)',
      costCr: '₹0.44 Cr'
    },
  ];

  const filteredMarkers = filterRiskOnly 
    ? markers.filter(m => m.status === 'highRisk' || m.status === 'delayed')
    : markers;

  const getStatusColor = (status: ProjectMarker['status']) => {
    switch (status) {
      case 'completed': return '#10b981'; // Green
      case 'inProgress': return '#f59e0b'; // Amber
      case 'delayed': return '#ef4444'; // Red
      case 'highRisk': return '#a855f7'; // Purple/Violet
      default: return '#94a3b8'; // Slate
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Approximate coordinate calculation across India bounds
    const approxLat = (37.0 - (y / rect.height) * (37.0 - 8.0)).toFixed(4);
    const approxLng = (68.0 + (x / rect.width) * (97.0 - 68.0)).toFixed(4);
    setCursorCoords({ lat: `${approxLat}° N`, lng: `${approxLng}° E` });
  };

  return (
    <div className={`rounded-gov border transition-all duration-300 shadow-gov flex flex-col justify-between h-full relative overflow-hidden ${
      viewMode === 'satellite' 
        ? 'bg-[#0b1324] border-slate-700 text-slate-100' 
        : viewMode === 'heatmap'
          ? 'bg-[#111827] border-indigo-900 text-slate-100'
          : 'bg-white border-gov-border text-slate-800'
    }`}>
      
      {/* 1. Header Toolbar */}
      <div className={`flex flex-wrap items-center justify-between px-3.5 py-2.5 border-b gap-2 z-20 ${
        viewMode === 'satellite' || viewMode === 'heatmap'
          ? 'border-slate-800/80 bg-[#0f172a]/95' 
          : 'border-slate-100 bg-white'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${
            viewMode === 'satellite' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gov-navy/10 text-gov-navy'
          }`}>
            {viewMode === 'satellite' ? <Satellite className="w-4 h-4 animate-spin-slow" /> : <Globe2 className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                National GIS & Satellite Project Radar
              </h3>
              {viewMode === 'satellite' && (
                <span className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[9.5px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>ISRO Bhuvan / Sentinel-2 Feed</span>
                </span>
              )}
            </div>
            <p className={`text-[10px] ${viewMode === 'satellite' ? 'text-slate-400' : 'text-slate-500'}`}>
              End-to-End Asset Location, Physical Ground Verification & Anomaly Detection
            </p>
          </div>
        </div>

        {/* Mode Selector & State Picker */}
        <div className="flex items-center space-x-1.5">
          {/* View Mode Buttons */}
          <div className="flex bg-slate-800/60 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('satellite')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1 transition ${
                viewMode === 'satellite'
                  ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Earth Observation & Satellite Telemetry"
            >
              <Satellite className="w-3 h-3" />
              <span>Satellite</span>
            </button>

            <button
              onClick={() => setViewMode('vector')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1 transition ${
                viewMode === 'vector'
                  ? 'bg-gov-navy text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Administrative Vector Map"
            >
              <Layers className="w-3 h-3" />
              <span>Vector</span>
            </button>

            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center space-x-1 transition ${
                viewMode === 'heatmap'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Risk & Fund Anomaly Heatmap"
            >
              <Flame className="w-3 h-3" />
              <span>Risk Heatmap</span>
            </button>
          </div>

          {/* State Dropdown */}
          <select
            value={selectedStateName}
            onChange={(e) => handleStateClick(e.target.value)}
            className={`text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium ${
              viewMode === 'satellite' || viewMode === 'heatmap'
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <option value="All States">All States ({markers.length} works)</option>
            {Object.keys(MOCK_STATES_DATA).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hierarchy Drill-Down Bar: India -> State -> District -> Block -> Village */}
      <div className="bg-[#0b1329] border-b border-slate-800 px-3.5 py-1.5 flex flex-wrap items-center justify-between text-[10.5px] text-slate-300 gap-2 z-10">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-slate-400 font-medium">Hierarchy Drill-Down:</span>
          <span className="font-bold text-cyan-300">India</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="font-bold text-white">{selectedStateName}</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="text-slate-200">Pune District</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="text-slate-300">Haveli Block</span>
          <span className="text-slate-600">&rarr;</span>
          <button
            onClick={() => setVillageDrawerData(getVillageIntelligence('556214'))}
            className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900 font-bold flex items-center space-x-1 transition"
            title="Inspect Village Wagholi"
          >
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            <span>Wagholi Village (556214)</span>
          </button>
        </div>

        <button
          onClick={() => setVillageDrawerData(getVillageIntelligence('556214'))}
          className="text-[10px] text-cyan-300 hover:underline flex items-center space-x-0.5"
        >
          <span>Open Village Intelligence</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 2. Main Map Canvas Container */}
      <div className="relative my-0 flex-1 min-h-[350px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
        
        {/* Background Texture & GIS Satellite Grid */}
        {viewMode === 'satellite' && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Dark Space Satellite Texture */}
            <div className="absolute inset-0 bg-radial from-[#132338] via-[#09111e] to-[#040810] opacity-95"></div>
            
            {/* Precision GIS Grid Lines */}
            <div 
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            ></div>

            {/* Orbital Radar Scan Sweep Animation */}
            {showRadarScan && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="w-full h-24 bg-gradient-to-b from-cyan-400/20 via-cyan-500/5 to-transparent animate-radar-sweep"></div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'heatmap' && (
          <div className="absolute inset-0 pointer-events-none z-0 bg-[#0a0f1d]">
            <div className="absolute inset-0 bg-radial from-rose-950/30 via-indigo-950/40 to-[#070b14]"></div>
          </div>
        )}

        {/* Telemetry HUD Top-Left (Satellite Mode) */}
        {viewMode === 'satellite' && (
          <div className="absolute top-2.5 left-3 bg-[#0f172a]/90 backdrop-blur-md px-2.5 py-1.5 rounded border border-cyan-500/30 shadow-lg z-20 text-[10px] space-y-0.5 font-mono text-cyan-300">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              <span>SAT-TELEMETRY: ACTIVE</span>
            </div>
            <div className="text-slate-400 flex items-center space-x-2">
              <span>CURSOR: <strong className="text-slate-200">{cursorCoords.lat}, {cursorCoords.lng}</strong></span>
            </div>
            <div className="text-slate-400 flex items-center space-x-2">
              <span>GSD RES: <strong className="text-slate-200">0.5m/px</strong></span>
              <span>•</span>
              <span>CLOUD: <strong className="text-emerald-400">0.8%</strong></span>
            </div>
          </div>
        )}

        {/* Map Legend Overlay (Top Right) */}
        <div className={`absolute top-2.5 right-3 px-2.5 py-2 rounded border shadow-lg z-20 text-[10.5px] space-y-1.5 backdrop-blur-md ${
          viewMode === 'satellite' || viewMode === 'heatmap'
            ? 'bg-[#0f172a]/90 border-slate-700/80 text-slate-200' 
            : 'bg-white/95 border-slate-200 text-slate-700'
        }`}>
          <div className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-700/50 pb-1 mb-1 flex items-center justify-between">
            <span>Project Status</span>
            <button 
              onClick={() => setFilterRiskOnly(!filterRiskOnly)}
              className={`px-1.5 py-0.2 rounded text-[9px] font-mono transition ${
                filterRiskOnly ? 'bg-purple-900/80 text-purple-200 border border-purple-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filterRiskOnly ? 'Showing High Risk' : 'Show All'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-xs shadow-emerald-500/50"></span>
            <span>Completed (100% Validated)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-xs shadow-amber-500/50"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-xs shadow-rose-500/50"></span>
            <span>Delayed Execution</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] ring-2 ring-purple-400/40 animate-pulse"></span>
            <span className="font-semibold text-purple-300">AI High Risk / Flagged</span>
          </div>
        </div>

        {/* Interactive Controls (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex flex-col space-y-1 z-20">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
            className={`w-7 h-7 rounded shadow-xs flex items-center justify-center font-bold transition ${
              viewMode === 'satellite'
                ? 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-700'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
            className={`w-7 h-7 rounded shadow-xs flex items-center justify-center font-bold transition ${
              viewMode === 'satellite'
                ? 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-700'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 1 && (
            <button 
              onClick={() => setZoomLevel(1)}
              className={`w-7 h-7 rounded shadow-xs flex items-center justify-center text-[10px] transition ${
                viewMode === 'satellite'
                  ? 'bg-slate-800/90 text-cyan-400 border border-slate-700 hover:bg-slate-700'
                  : 'bg-white border border-slate-300 text-slate-500 hover:bg-slate-100'
              }`}
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <button 
            onClick={() => setShowGeofences(!showGeofences)}
            className={`w-7 h-7 rounded shadow-xs flex items-center justify-center text-[10px] transition ${
              showGeofences
                ? 'bg-cyan-600 text-white border border-cyan-400'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Toggle Geo-Fences"
          >
            <Compass className="w-3 h-3" />
          </button>
        </div>

        {/* SVG Interactive Map */}
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-300 select-none z-10"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg 
            viewBox="0 0 520 540" 
            className="w-full h-[340px] max-w-[430px] drop-shadow-md"
            onMouseMove={handleMouseMove}
          >
            <defs>
              {/* Gradients for Satellite & Heatmap Terrain */}
              <radialGradient id="stateGlowSat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
              </radialGradient>

              <linearGradient id="satTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="50%" stopColor="#152e4d" />
                <stop offset="100%" stopColor="#0d2038" />
              </linearGradient>

              <linearGradient id="satSelected" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
              </linearGradient>

              <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#fb923c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Latitude & Longitude Coordinate Guidelines */}
            {viewMode === 'satellite' && (
              <g stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25">
                <line x1="50" y1="120" x2="470" y2="120" />
                <line x1="50" y1="240" x2="470" y2="240" />
                <line x1="50" y1="360" x2="470" y2="360" />
                <line x1="50" y1="480" x2="470" y2="480" />
                <line x1="160" y1="30" x2="160" y2="520" />
                <line x1="280" y1="30" x2="280" y2="520" />
                <line x1="400" y1="30" x2="400" y2="520" />
                <text x="55" y="115" fill="#38bdf8" fontSize="8" fontFamily="monospace">32° N</text>
                <text x="55" y="235" fill="#38bdf8" fontSize="8" fontFamily="monospace">24° N</text>
                <text x="55" y="355" fill="#38bdf8" fontSize="8" fontFamily="monospace">16° N</text>
                <text x="55" y="475" fill="#38bdf8" fontSize="8" fontFamily="monospace">8° N</text>
                <text x="165" y="525" fill="#38bdf8" fontSize="8" fontFamily="monospace">74° E</text>
                <text x="285" y="525" fill="#38bdf8" fontSize="8" fontFamily="monospace">82° E</text>
                <text x="405" y="525" fill="#38bdf8" fontSize="8" fontFamily="monospace">90° E</text>
              </g>
            )}

            {/* Northern States (J&K, Ladakh, Himachal, Punjab, Uttarakhand) */}
            <path
              d="M 205 35 L 235 30 L 260 55 L 265 95 L 245 125 L 210 135 L 185 115 L 195 70 Z"
              fill={viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1f2937' : '#dbeafe'}
              stroke={viewMode === 'satellite' ? '#38bdf8' : '#94a3b8'}
              strokeWidth={viewMode === 'satellite' ? '1.5' : '1.2'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Uttar Pradesh')}
            />

            {/* Rajasthan */}
            <path
              d="M 140 180 L 195 160 L 225 185 L 220 230 L 180 250 L 135 225 Z"
              fill={selectedStateName === 'Rajasthan' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Rajasthan' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Rajasthan' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Rajasthan')}
            />

            {/* Gujarat */}
            <path
              d="M 135 225 L 180 250 L 175 290 L 155 300 L 125 285 L 110 260 L 135 250 Z"
              fill={selectedStateName === 'Gujarat' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Gujarat' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Gujarat' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Gujarat')}
            />

            {/* Uttar Pradesh */}
            <path
              d="M 225 160 L 310 165 L 345 205 L 305 235 L 245 225 L 225 185 Z"
              fill={selectedStateName === 'Uttar Pradesh' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Uttar Pradesh' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Uttar Pradesh' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Uttar Pradesh')}
            />

            {/* Madhya Pradesh */}
            <path
              d="M 180 250 L 220 230 L 275 230 L 295 270 L 260 295 L 195 285 Z"
              fill={selectedStateName === 'Madhya Pradesh' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Madhya Pradesh' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Madhya Pradesh' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Madhya Pradesh')}
            />

            {/* Bihar & Jharkhand */}
            <path
              d="M 310 165 L 370 180 L 375 235 L 330 245 L 305 235 L 345 205 Z"
              fill={selectedStateName === 'Bihar' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Bihar' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Bihar' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Bihar')}
            />

            {/* West Bengal */}
            <path
              d="M 365 210 L 390 220 L 395 280 L 360 285 L 360 250 Z"
              fill={selectedStateName === 'West Bengal' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'West Bengal' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'West Bengal' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('West Bengal')}
            />

            {/* Northeast States */}
            <path
              d="M 390 195 L 450 180 L 470 215 L 430 240 L 395 230 Z"
              fill={viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0'}
              stroke={viewMode === 'satellite' ? '#475569' : '#94a3b8'}
              strokeWidth="1"
              className="hover:opacity-80 cursor-pointer transition"
            />

            {/* MAHARASHTRA (Showcase State) */}
            <path
              d="M 175 290 L 260 295 L 285 335 L 245 365 L 195 365 L 180 325 Z"
              fill={selectedStateName === 'Maharashtra' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#93c5fd') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#cbd5e1')}
              stroke={selectedStateName === 'Maharashtra' ? '#38bdf8' : (viewMode === 'satellite' ? '#0ea5e9' : '#1d4ed8')}
              strokeWidth={selectedStateName === 'Maharashtra' ? '3' : '1.5'}
              className="cursor-pointer transition hover:opacity-90"
              onClick={() => handleStateClick('Maharashtra')}
            />

            {/* Odisha & Chhattisgarh */}
            <path
              d="M 285 270 L 345 275 L 335 340 L 285 335 L 260 295 Z"
              fill={viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0'}
              stroke={viewMode === 'satellite' ? '#475569' : '#94a3b8'}
              strokeWidth="1"
              className="hover:opacity-80 cursor-pointer transition"
            />

            {/* Andhra Pradesh & Telangana */}
            <path
              d="M 245 335 L 315 340 L 300 420 L 255 415 L 240 365 Z"
              fill={selectedStateName === 'Andhra Pradesh' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Andhra Pradesh' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Andhra Pradesh' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Andhra Pradesh')}
            />

            {/* Karnataka */}
            <path
              d="M 195 365 L 245 365 L 255 425 L 210 445 L 195 390 Z"
              fill={selectedStateName === 'Karnataka' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Karnataka' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Karnataka' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Karnataka')}
            />

            {/* Tamil Nadu & Kerala */}
            <path
              d="M 215 440 L 260 425 L 260 495 L 225 500 L 210 460 Z"
              fill={selectedStateName === 'Tamil Nadu' ? (viewMode === 'satellite' ? 'url(#satSelected)' : '#bfdbfe') : (viewMode === 'satellite' ? 'url(#satTerrain)' : viewMode === 'heatmap' ? '#1e293b' : '#e2e8f0')}
              stroke={selectedStateName === 'Tamil Nadu' ? '#38bdf8' : (viewMode === 'satellite' ? '#475569' : '#64748b')}
              strokeWidth={selectedStateName === 'Tamil Nadu' ? '2.2' : '1'}
              className="hover:opacity-80 cursor-pointer transition"
              onClick={() => handleStateClick('Tamil Nadu')}
            />

            {/* Heatmap Glow Blooms (Heatmap Mode) */}
            {viewMode === 'heatmap' && (
              <g className="pointer-events-none">
                <circle cx="215" cy="320" r="32" fill="url(#heatGlow)" />
                <circle cx="320" cy="215" r="35" fill="url(#heatGlow)" />
                <circle cx="160" cy="205" r="28" fill="url(#heatGlow)" />
                <circle cx="375" cy="260" r="30" fill="url(#heatGlow)" />
              </g>
            )}

            {/* Geo-fence Boundaries around Active Projects */}
            {showGeofences && filteredMarkers.map((marker) => (
              <polygon
                key={`fence-${marker.id}`}
                points={`${marker.x - 12},${marker.y - 8} ${marker.x + 10},${marker.y - 12} ${marker.x + 14},${marker.y + 10} ${marker.x - 8},${marker.y + 12}`}
                fill={marker.status === 'highRisk' ? '#a855f7' : '#38bdf8'}
                fillOpacity="0.08"
                stroke={marker.status === 'highRisk' ? '#c084fc' : '#38bdf8'}
                strokeWidth="0.8"
                strokeDasharray="2 2"
                className="pointer-events-none"
              />
            ))}

            {/* Interactive Project Markers */}
            {filteredMarkers.map((marker) => {
              const isSelectedState = selectedStateName === marker.state;
              const isSelectedMarker = selectedMarker?.id === marker.id;
              const color = getStatusColor(marker.status);

              return (
                <g
                  key={marker.id}
                  className="cursor-pointer transition-transform duration-200 hover:scale-135"
                  onMouseEnter={() => setHoveredMarker(marker)}
                  onMouseLeave={() => setHoveredMarker(null)}
                  onClick={() => {
                    setSelectedMarker(marker);
                    handleStateClick(marker.state);
                  }}
                >
                  {/* Subtle pulse effect for high risk or selected */}
                  {(marker.status === 'highRisk' || isSelectedMarker) && (
                    <circle
                      cx={marker.x}
                      cy={marker.y}
                      r="12"
                      fill={color}
                      opacity="0.35"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer Satellite Targeting Reticle in Satellite Mode */}
                  {viewMode === 'satellite' && (
                    <circle
                      cx={marker.x}
                      cy={marker.y}
                      r={isSelectedState ? "8.5" : "6.5"}
                      fill="none"
                      stroke={color}
                      strokeWidth="0.8"
                      strokeDasharray="2 1"
                      opacity="0.8"
                    />
                  )}

                  {/* Outer Marker Ring */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelectedState ? "5.5" : "4.5"}
                    fill={color}
                    stroke={viewMode === 'satellite' ? '#0f172a' : '#ffffff'}
                    strokeWidth="1.5"
                    className="drop-shadow-sm"
                  />

                  {/* Center Dot */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r="1.8"
                    fill="#ffffff"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip for Marker */}
        {hoveredMarker && !selectedMarker && (
          <div 
            className="absolute z-30 bg-[#0f172a]/95 text-white text-[10px] p-2 rounded-md shadow-xl border border-cyan-500/40 pointer-events-none transform -translate-x-1/2 -translate-y-12 backdrop-blur-md max-w-[210px]"
            style={{ 
              left: `${(hoveredMarker.x / 520) * 100}%`, 
              top: `${(hoveredMarker.y / 540) * 100}%` 
            }}
          >
            <div className="font-bold text-cyan-300 truncate">{hoveredMarker.name}</div>
            <div className="text-[9px] text-slate-300 flex justify-between mt-0.5">
              <span>{hoveredMarker.district}, {hoveredMarker.state}</span>
              <span className="font-mono text-cyan-400">{hoveredMarker.costCr}</span>
            </div>
            <div className="text-[8.5px] mt-1 text-slate-400 font-mono">
              Fin: {hoveredMarker.financialProgress}% | Phy: {hoveredMarker.physicalProgress}%
            </div>
          </div>
        )}

        {/* Selected Project Satellite Deep-Inspection Card (Floating Over Map) */}
        {selectedMarker ? (
          <div className="absolute bottom-3 right-3 bg-[#0f172a]/95 text-white p-3.5 rounded-lg shadow-2xl border border-cyan-500/50 max-w-[250px] sm:min-w-[240px] text-xs z-30 backdrop-blur-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
              <div className="flex items-center space-x-1.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-[12px] text-cyan-200">Satellite Inspection</span>
              </div>
              <button 
                onClick={() => setSelectedMarker(null)}
                className="text-slate-400 hover:text-white text-xs px-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 space-y-1.5 text-[11px]">
              <div className="font-semibold text-white truncate">{selectedMarker.name}</div>
              <div className="text-[10px] text-slate-400">
                MP: <span className="text-slate-200 font-medium">{selectedMarker.mpName}</span>
              </div>
              
              <div className="p-1.5 rounded bg-slate-900/80 border border-slate-700/60 font-mono text-[9.5px] text-slate-300 space-y-0.5">
                <div className="flex justify-between">
                  <span>GPS:</span>
                  <span className="text-cyan-400">{selectedMarker.lat}°N, {selectedMarker.lng}°E</span>
                </div>
                <div className="flex justify-between">
                  <span>Financial vs Physical:</span>
                  <span className="text-amber-400 font-bold">{selectedMarker.financialProgress}% vs {selectedMarker.physicalProgress}%</span>
                </div>
              </div>

              {/* Satellite Ground Change Detection Banner */}
              <div className={`p-1.5 rounded text-[9.5px] border ${
                selectedMarker.satelliteVerified
                  ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-600/50 text-rose-200'
              }`}>
                {selectedMarker.satelliteDelta}
              </div>
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-slate-700/80 space-y-1.5">
              <button
                onClick={() => setVillageDrawerData(getVillageIntelligence('556214'))}
                className="w-full py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10.5px] flex items-center justify-center space-x-1.5 transition shadow-xs"
              >
                <MapPin className="w-3 h-3" />
                <span>Open Village Intelligence (Wagholi)</span>
              </button>
              <button
                onClick={() => navigate(`/projects/${selectedMarker.projectId || SHOWCASE_PROJECT_ID}`)}
                className="w-full py-1 px-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-[10.5px] flex items-center justify-center space-x-1.5 transition"
              >
                <SearchCode className="w-3 h-3" />
                <span>Open Full Forensic Record</span>
              </button>
            </div>
          </div>
        ) : (
          /* Selected State Summary Card (Default View) */
          <div className="absolute bottom-3 right-3 bg-[#0f172a]/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 max-w-[220px] sm:min-w-[205px] text-xs z-20 backdrop-blur-md">
            <div className="font-bold text-xs text-white mb-2 pb-1 border-b border-slate-700 flex items-center justify-between">
              <span className="text-cyan-300">{selectedState.state}</span>
              {selectedState.highRiskProjects > 0 && (
                <span className="text-[9.5px] px-1.5 py-0.2 bg-purple-900/90 text-purple-200 border border-purple-500 rounded">
                  {selectedState.highRiskProjects} Flagged
                </span>
              )}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Total Projects :</span>
                <span className="font-bold text-white">{selectedState.totalProjects.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>In Progress :</span>
                <span className="font-semibold">{selectedState.inProgress.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Completed :</span>
                <span className="font-semibold">{selectedState.completed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Delayed :</span>
                <span className="font-semibold">{selectedState.delayed.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setVillageDrawerData(getVillageIntelligence('556214'))}
              className="w-full mt-2 pt-1 border-t border-slate-700 text-left text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center justify-between transition group"
            >
              <span>Explore Village: Wagholi (556214)</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate(`/projects?state=${encodeURIComponent(selectedState.state)}`)}
              className="w-full mt-1 pt-1 border-t border-slate-800 text-left text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center justify-between transition group"
            >
              <span>View State Dashboard</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* 3. Map Subtitle & Earth Observation Status */}
      <div className={`px-3 py-1.5 text-[10.5px] text-center border-t flex items-center justify-between ${
        viewMode === 'satellite' || viewMode === 'heatmap'
          ? 'border-slate-800 bg-[#0c1427] text-slate-400' 
          : 'border-slate-100 bg-slate-50 text-slate-500'
      }`}>
        <div className="flex items-center space-x-1 text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Geo-Referenced with Cadastral Land Parcel Records & MoSPI eSAKSHI Registry</span>
        </div>
        <div className="hidden sm:block text-[10px] text-slate-400">
          Click any state boundary or radar marker to inspect ground evidence
        </div>
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

