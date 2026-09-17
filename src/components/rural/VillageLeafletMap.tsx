import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { LGDVillage } from '../../types/rural';
import { 
  Compass, 
  RotateCcw, 
  MapPin, 
  Info, 
  ChevronRight, 
  Layers, 
  AlertTriangle, 
  Building, 
  ExternalLink,
  ShieldCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon asset paths in Vite bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  villages: LGDVillage[];
  selectedVillageId?: string | null;
  onSelectVillage?: (village: LGDVillage) => void;
}

// State Centroids for India Hierarchy Navigation
const STATE_CENTROIDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Maharashtra': { lat: 19.7515, lng: 75.7139, zoom: 6 },
  'Bihar': { lat: 25.0961, lng: 85.3131, zoom: 7 },
  'Punjab': { lat: 31.1471, lng: 75.3412, zoom: 7 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, zoom: 7 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179, zoom: 6 },
  'Kerala': { lat: 10.8505, lng: 76.2711, zoom: 7 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, zoom: 7 }
};

export const VillageLeafletMap: React.FC<Props> = ({
  villages,
  selectedVillageId,
  onSelectVillage
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Hierarchy levels: 'india' | 'state' | 'district' | 'block' | 'village'
  const [currentLevel, setCurrentLevel] = useState<'india' | 'state' | 'district' | 'village'>('india');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [activeVillage, setActiveVillage] = useState<LGDVillage | null>(null);

  // Summary drawers
  const [stateSummary, setStateSummary] = useState<{ name: string; villages: number; projects: number; expenditure: number } | null>(null);
  const [districtSummary, setDistrictSummary] = useState<{ name: string; state: string; villages: number; projects: number; expenditure: number } | null>(null);

  // Coordinates vs Non-coordinates split
  const geocodedVillages = useMemo(() => villages.filter(v => v.coordinates !== null), [villages]);
  const nonGeocodedVillages = useMemo(() => villages.filter(v => v.coordinates === null), [villages]);

  // Sync active village if passed via props
  useEffect(() => {
    if (selectedVillageId) {
      const found = villages.find(v => v.id === selectedVillageId);
      if (found) {
        setActiveVillage(found);
        if (found.coordinates && mapInstanceRef.current) {
          mapInstanceRef.current.setView([found.coordinates.lat, found.coordinates.lng], 13, { animate: true });
        }
      }
    }
  }, [selectedVillageId, villages]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 82.0],
        zoom: 4,
        zoomControl: false,
        attributionControl: false
      });

      // Standard OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer group for markers
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount if needed
    };
  }, []);

  // 2. Render Hierarchy Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // IF AT INDIA LEVEL: Render State Hubs / Aggregates
    if (currentLevel === 'india') {
      const stateGroups: Record<string, { count: number; projects: number; expenditure: number }> = {};
      villages.forEach(v => {
        if (!stateGroups[v.state]) stateGroups[v.state] = { count: 0, projects: 0, expenditure: 0 };
        stateGroups[v.state].count++;
        stateGroups[v.state].projects += v.projectCount;
        stateGroups[v.state].expenditure += v.totalExpenditure;
      });

      Object.entries(stateGroups).forEach(([stateName, data]) => {
        const centroid = STATE_CENTROIDS[stateName];
        if (!centroid) return;

        const iconHtml = `
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#0b2e59] text-white border-2 border-white shadow-lg font-bold text-xs cursor-pointer hover:scale-110 transition-transform">
            ${data.count}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'state-bubble-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([centroid.lat, centroid.lng], { icon: customIcon });
        marker.on('click', () => {
          setSelectedState(stateName);
          setCurrentLevel('state');
          setStateSummary({
            name: stateName,
            villages: data.count,
            projects: data.projects,
            expenditure: data.expenditure
          });
          map.setView([centroid.lat, centroid.lng], centroid.zoom, { animate: true });
        });

        marker.bindTooltip(`<strong>${stateName}</strong><br/>${data.count} Villages | ${data.projects} Works`, {
          direction: 'top',
          offset: [0, -20]
        });

        layerGroup.addLayer(marker);
      });
    }

    // IF AT STATE OR DISTRICT OR VILLAGE LEVEL: Render Verified Geocoded Villages
    if (currentLevel !== 'india') {
      const relevantVillages = geocodedVillages.filter(v => {
        if (selectedState && v.state !== selectedState) return false;
        if (selectedDistrict && v.district !== selectedDistrict) return false;
        return true;
      });

      relevantVillages.forEach(v => {
        if (!v.coordinates) return;

        // Color coding strictly based on recorded project count
        let pinColor = '#64748b'; // 0 projects: Slate grey
        if (v.projectCount >= 6) pinColor = '#10b981'; // 6+: Emerald
        else if (v.projectCount >= 3) pinColor = '#2563eb'; // 3-5: Institutional blue
        else if (v.projectCount >= 1) pinColor = '#f59e0b'; // 1-2: Amber (Low recorded project count)

        // Risk badge indicator if high risk or delayed
        const hasWarning = v.highRiskCount > 0 || v.delayedCount > 0;

        const markerHtml = `
          <div style="position: relative; cursor: pointer;">
            <div style="background-color: ${pinColor}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
              ${v.projectCount}
            </div>
            ${hasWarning ? '<div style="position: absolute; top: -4px; right: -4px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; border: 1px solid white;"></div>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'village-custom-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([v.coordinates.lat, v.coordinates.lng], { icon });

        marker.on('click', () => {
          setActiveVillage(v);
          if (onSelectVillage) onSelectVillage(v);
        });

        marker.bindTooltip(`
          <div style="font-size: 11px; padding: 2px;">
            <strong>${v.villageName}</strong> (LGD: ${v.villageCode})<br/>
            ${v.subDistrict} Block, ${v.district}<br/>
            <span style="color: ${v.projectCount === 0 ? '#64748b' : '#0b2e59'}; font-weight: 600;">
              ${v.projectCount} Recorded Works
            </span>
          </div>
        `, { direction: 'top', offset: [0, -12] });

        layerGroup.addLayer(marker);
      });
    }

  }, [currentLevel, selectedState, selectedDistrict, villages, geocodedVillages, onSelectVillage]);

  // Reset to All-India View
  const handleResetToIndia = () => {
    setCurrentLevel('india');
    setSelectedState(null);
    setSelectedDistrict(null);
    setStateSummary(null);
    setDistrictSummary(null);
    setActiveVillage(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.5, 82.0], 4, { animate: true });
    }
  };

  return (
    <div className="relative bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
      {/* Top Map Toolbar & Breadcrumbs */}
      <div className="bg-[#f8fafc] border-b border-gov-border px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Hierarchy Breadcrumbs */}
        <div className="flex items-center space-x-1 font-medium text-slate-700">
          <button
            onClick={handleResetToIndia}
            className={`hover:text-gov-navy transition ${currentLevel === 'india' ? 'font-bold text-gov-navy' : ''}`}
          >
            India Overview
          </button>

          {selectedState && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <button
                onClick={() => {
                  setSelectedDistrict(null);
                  setCurrentLevel('state');
                }}
                className={`hover:text-gov-navy transition ${!selectedDistrict ? 'font-bold text-gov-navy' : ''}`}
              >
                {selectedState}
              </button>
            </>
          )}

          {selectedDistrict && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-gov-navy">{selectedDistrict} District</span>
            </>
          )}

          {activeVillage && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-blue-700">{activeVillage.villageName}</span>
            </>
          )}
        </div>

        {/* Right Map Actions & Legend */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>0 Works</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>1–2 Works</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>3–5 Works</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>6+ Works</span>
            </span>
          </div>

          <button
            onClick={handleResetToIndia}
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center space-x-1 shadow-xs"
            title="Reset Map to All-India Overview"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* State Summary Floating Card */}
        {stateSummary && currentLevel === 'state' && (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-gov-border rounded-gov shadow-lg p-3 max-w-xs text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h4 className="font-bold text-gov-navy text-sm">{stateSummary.name}</h4>
              <button onClick={() => setStateSummary(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Villages in Sample</span>
                <span className="font-bold text-slate-800">{stateSummary.villages}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Recorded Works</span>
                <span className="font-bold text-slate-800">{stateSummary.projects}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Total Expenditure</span>
                <span className="font-bold text-emerald-700">₹{(stateSummary.expenditure / 100000).toFixed(1)} Lakhs</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Click individual village pins to inspect local project histories.
            </p>
          </div>
        )}

        {/* Non-geocoded villages warning note / notification */}
        {nonGeocodedVillages.length > 0 && currentLevel !== 'india' && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-xs border border-amber-300 rounded px-3 py-1.5 text-[11px] text-amber-900 shadow-md flex items-center space-x-1.5 max-w-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {nonGeocodedVillages.length} villages in this filter lack verified coordinates in official LGD source. Displayed in table below.
            </span>
          </div>
        )}

        {/* Selected Village Intelligence Panel (Desktop Overlay / Mobile Bottom Sheet) */}
        {activeVillage && (
          <div className="absolute right-0 bottom-0 top-auto sm:top-0 w-full sm:w-80 md:w-96 bg-white sm:border-l border-t sm:border-t-0 border-gov-border shadow-2xl sm:shadow-lg z-20 flex flex-col max-h-[80%] sm:max-h-full animate-slideInRight overflow-hidden">
            
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto my-2 shrink-0"></div>

            {/* Header */}
            <div className="bg-[#0b2e59] text-white p-3.5 flex items-start justify-between">
              <div>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-400 text-slate-900 mb-1">
                  LGD: {activeVillage.villageCode}
                </span>
                <h3 className="text-sm sm:text-base font-bold leading-snug">
                  {activeVillage.villageName}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {activeVillage.subDistrict} Block, {activeVillage.district}
                </p>
              </div>
              <button
                onClick={() => setActiveVillage(null)}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto text-xs text-slate-700 flex-1">
              
              {/* Coordinate Provenance */}
              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Geographical Position</span>
                  {activeVillage.coordinates ? (
                    <span className="text-slate-700 font-mono font-medium">
                      {activeVillage.coordinates.lat.toFixed(4)}° N, {activeVillage.coordinates.lng.toFixed(4)}° E
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">Unmapped in Source</span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-slate-600">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Source: {activeVillage.coordinatesSource}</span>
                </div>
              </div>

              {/* Administrative Representation */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-100 pb-2">
                <div>
                  <span className="text-slate-500 block">Constituency</span>
                  <span className="font-semibold text-slate-900">{activeVillage.constituency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hon'ble MP</span>
                  <span className="font-semibold text-slate-900">{activeVillage.mpName}</span>
                </div>
              </div>

              {/* Works Summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50/70 border border-blue-200 rounded">
                  <span className="text-[10px] text-blue-800 font-semibold block">Total Works</span>
                  <span className="text-base font-bold text-gov-navy">{activeVillage.projectCount}</span>
                </div>
                <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Completed</span>
                  <span className="text-base font-bold text-emerald-700">{activeVillage.completedCount}</span>
                </div>
                <div className="p-2 bg-amber-50/70 border border-amber-200 rounded">
                  <span className="text-[10px] text-amber-800 font-semibold block">Delayed</span>
                  <span className="text-base font-bold text-amber-700">{activeVillage.delayedCount}</span>
                </div>
              </div>

              {/* Expenditure */}
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="text-slate-600">Total Expenditure:</span>
                <span className="font-bold text-slate-900">
                  ₹{(activeVillage.totalExpenditure / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              {/* Sectors */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Recorded Sectors ({activeVillage.sectorsPresent.length}):
                </span>
                {activeVillage.sectorsPresent.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {activeVillage.sectorsPresent.map((sec, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-300">
                        {sec}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No recorded sectors in dataset</span>
                )}
              </div>

              {/* Disclaimer Notice */}
              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded text-[10px] text-amber-800 leading-tight">
                ℹ️ <strong>Note:</strong> A low project count does not imply lack of infrastructure or development. Other central/state schemes may fund local assets.
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-3 bg-slate-50 border-t border-gov-border shrink-0">
              <button
                onClick={() => navigate(`/village/${activeVillage.id}`)}
                className="w-full py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs flex items-center justify-center space-x-1.5 transition"
              >
                <span>View Complete Project History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
