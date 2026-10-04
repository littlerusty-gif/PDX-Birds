import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Observation, Hotspot, FlightCorridor, ViewMode, RegionConfig } from '../types/bird';
import { MeetupProposal } from '../types/chat';
import { SPECIES_FORECASTS, isSpeciesOptimalNow } from '../data/viewingForecast';
import { Navigation, Wind, Sparkles, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface MapProps {
  observations: Observation[];
  hotspots?: Hotspot[];
  selectedItem: Observation | Hotspot | null;
  mode: ViewMode;
  onSelectItem: (item: Observation | Hotspot) => void;
  corridors?: FlightCorridor[];
  selectedCorridor?: FlightCorridor | null;
  onSelectCorridor?: (corridor: FlightCorridor | null) => void;
  region?: RegionConfig;
  userLocation?: [number, number] | null;
  onLocateMe?: () => void;
  isLocating?: boolean;
  pinnedMeetup?: MeetupProposal | null;
}

export const Map: React.FC<MapProps> = ({
  observations = [],
  hotspots = [],
  selectedItem,
  mode,
  onSelectItem,
  corridors = [],
  selectedCorridor,
  onSelectCorridor,
  region,
  userLocation,
  onLocateMe,
  isLocating = false,
  pinnedMeetup,
}) => {
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups for clean, crash-proof marker management
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const gpsLayerRef = useRef<L.LayerGroup | null>(null);
  const meetupLayerRef = useRef<L.LayerGroup | null>(null);

  const [showFlightPaths, setShowFlightPaths] = useState<boolean>(true);

  // Null-safe filtered observations
  const validObservations = useMemo(() => {
    return (observations || []).filter(
      (o) =>
        o &&
        typeof o.lat === 'number' &&
        typeof o.lng === 'number' &&
        !isNaN(o.lat) &&
        !isNaN(o.lng)
    );
  }, [observations]);

  // Is Portland region check
  const isPortlandOnly = useMemo(() => {
    if (!region) return false;
    return region.id === 'portland' || region.regionCode === 'US-OR-051';
  }, [region]);

  // 1. Safe Leaflet Map Initialization with DOM element check and cleanup
  useEffect(() => {
    const container = document.getElementById('map');
    if (!container || mapInstanceRef.current) return;

    const initialCenter: [number, number] = region?.center || [45.5152, -122.6784];
    const initialZoom: number = region?.zoom || 12;

    const map = L.map(container, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    // Add base OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Initialize isolated layer groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);
    gpsLayerRef.current = L.layerGroup().addTo(map);
    meetupLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size once DOM layout settles
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        console.error(e);
      }
    }, 150);

    const handleResize = () => {
      try {
        map.invalidateSize();
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Region center change handler (e.g. Washington: [47.5, -120.5], zoom 7)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !region) return;

    try {
      if (region.category === 'gps' && userLocation) {
        map.setView(userLocation, 12);
      } else if (region.center && typeof region.center[0] === 'number') {
        map.setView(region.center, region.zoom);
      }
      map.invalidateSize();
    } catch (e) {
      console.error(e);
    }
  }, [region, userLocation]);

  // 3. Pan to selected item
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedItem) return;

    try {
      if (typeof selectedItem.lat === 'number' && typeof selectedItem.lng === 'number') {
        map.setView([selectedItem.lat, selectedItem.lng], 14, { animate: true });
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedItem]);

  // 4. Center on pinned meetup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pinnedMeetup) return;

    try {
      if (typeof pinnedMeetup.lat === 'number' && typeof pinnedMeetup.lng === 'number') {
        map.setView([pinnedMeetup.lat, pinnedMeetup.lng], 13, { animate: true });
      }
    } catch (e) {
      console.error(e);
    }
  }, [pinnedMeetup]);

  // 5. Render GPS user location
  useEffect(() => {
    const layer = gpsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (userLocation && typeof userLocation[0] === 'number') {
      const gpsIcon = L.divIcon({
        className: 'relative flex items-center justify-center',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-75 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-sky-500 border-2 border-white shadow-lg items-center justify-center text-[10px] text-white">
              📍
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(userLocation, { icon: gpsIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f1f5f9;">
          <strong style="color: #38bdf8;">Your GPS Location</strong>
          <p style="margin: 4px 0 0 0; color: #94a3b8;">Showing observations within 30-mile radius.</p>
        </div>
      `);
      layer.addLayer(marker);

      const circle = L.circle(userLocation, {
        radius: 48280, // 30 miles in meters
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '4, 4',
      });
      layer.addLayer(circle);
    }
  }, [userLocation]);

  // 6. Render Pinned Meetup Marker
  useEffect(() => {
    const layer = meetupLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (pinnedMeetup && typeof pinnedMeetup.lat === 'number' && typeof pinnedMeetup.lng === 'number') {
      const meetupIcon = L.divIcon({
        className: 'relative flex items-center justify-center',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-10 w-10 rounded-full bg-emerald-400 opacity-80 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-8 w-8 bg-emerald-500 border-2 border-white shadow-2xl text-slate-950 font-black text-sm items-center justify-center">
              🤝
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([pinnedMeetup.lat, pinnedMeetup.lng], { icon: meetupIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f1f5f9; min-width: 190px;">
          <div style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #34d399; margin-bottom: 2px;">
            Community Field Meetup
          </div>
          <strong style="font-size: 13px; color: #ffffff;">${pinnedMeetup.locationName}</strong>
          <div style="color: #38bdf8; margin: 4px 0 2px 0;">📅 ${pinnedMeetup.dateTime}</div>
          <div style="color: #fbbf24;">🎯 Targets: ${pinnedMeetup.targetSpecies}</div>
        </div>
      `);
      layer.addLayer(marker);
    }
  }, [pinnedMeetup]);

  // 7. Render Observation & Hotspot Markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (mode === 'hotspots') {
      (hotspots || []).forEach((spot) => {
        if (!spot || typeof spot.lat !== 'number' || typeof spot.lng !== 'number') return;
        const isSelected = selectedItem?.lat === spot.lat && selectedItem?.lng === spot.lng;

        const icon = L.divIcon({
          className: 'relative flex items-center justify-center',
          html: `
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${
              isSelected ? '#10b981' : '#047857'
            }; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              📍
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([spot.lat, spot.lng], { icon });
        marker.on('click', () => onSelectItem(spot));
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #f1f5f9; min-width: 180px;">
            <strong style="font-size: 13px; color: #ffffff;">${spot.locName}</strong>
            <p style="margin: 4px 0 0 0; color: #34d399;">Species Richness: <strong>${spot.numSpeciesAllTime} recorded</strong></p>
          </div>
        `);
        layer.addLayer(marker);
      });
      return;
    }

    // Sightings Mode
    (validObservations || []).forEach((obs) => {
      const isSelected = selectedItem && 'id' in selectedItem && selectedItem.id === obs.id;
      const count = obs.howMany || 1;
      const isRoost = obs.isCrowRoost || count >= 250;

      let bgColor = '#0d9488'; // teal
      let size = 26;
      if (isRoost) {
        bgColor = '#ef4444'; // red
        size = 34;
      } else if (count > 100) {
        bgColor = '#f97316'; // orange
        size = 30;
      } else if (count > 20) {
        bgColor = '#eab308'; // yellow
        size = 28;
      }

      const icon = L.divIcon({
        className: 'relative flex items-center justify-center',
        html: `
          <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; border: 2px solid ${
          isSelected ? '#34d399' : '#ffffff'
        }; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 10px; font-weight: bold; color: #020617; box-shadow: 0 4px 12px rgba(0,0,0,0.6); transform: ${
          isSelected ? 'scale(1.2)' : 'scale(1)'
        }; transition: transform 0.2s;">
            ${count > 999 ? (count / 1000).toFixed(1) + 'k' : count}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([obs.lat, obs.lng], { icon });
      marker.on('click', () => onSelectItem(obs));
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f1f5f9; min-width: 200px;">
          <div style="font-size: 13px; font-weight: bold; color: #ffffff;">${obs.comName}</div>
          <div style="font-size: 11px; font-style: italic; color: #94a3b8; margin-bottom: 4px;">${obs.sciName}</div>
          <div style="color: #34d399; font-weight: bold;">Count: ${count.toLocaleString()}</div>
          <div style="color: #cbd5e1; margin-top: 2px;">📍 ${obs.locName}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${obs.obsDt}</div>
        </div>
      `);
      layer.addLayer(marker);
    });
  }, [validObservations, hotspots, mode, selectedItem, onSelectItem]);

  // 8. Render Portland Roost Corridors (only in Portland Metro)
  useEffect(() => {
    const layer = corridorsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!isPortlandOnly || !showFlightPaths) return;

    (corridors || []).forEach((c) => {
      if (!c.coordinates || c.coordinates.length < 2) return;
      const isSelected = selectedCorridor?.id === c.id;

      const polyline = L.polyline(c.coordinates, {
        color: c.color || '#38bdf8',
        weight: isSelected ? 5 : 3.5,
        opacity: isSelected ? 0.95 : 0.75,
        dashArray: '6, 6',
      });

      polyline.on('click', () => onSelectCorridor && onSelectCorridor(c));
      polyline.bindTooltip(
        `<strong>${c.name}</strong><br/>~${c.estFlockSize.toLocaleString()} crows (${c.timeWindow})`,
        { sticky: true }
      );
      layer.addLayer(polyline);
    });
  }, [isPortlandOnly, showFlightPaths, corridors, selectedCorridor, onSelectCorridor]);

  return (
    <div
      className="w-full h-full min-h-[500px] flex-1 relative z-0"
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    >
      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-wrap items-center gap-2">
        {onLocateMe && (
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border backdrop-blur-md ${
              region?.category === 'gps'
                ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-sky-500/30'
                : 'bg-slate-900/90 hover:bg-slate-800 text-sky-400 border-sky-500/40'
            } active:scale-95 disabled:opacity-50`}
            title="Center on my GPS coordinates (30-mile radius)"
          >
            <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        )}

        {/* Flight Paths Toggle Control Button (shown ONLY in Portland Roost view) */}
        {isPortlandOnly && (
          <button
            onClick={() => setShowFlightPaths(!showFlightPaths)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border backdrop-blur-md ${
              showFlightPaths
                ? 'bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 border-emerald-400/80 shadow-emerald-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle Roost Inbound Trajectories"
          >
            <Wind size={13} className={showFlightPaths ? 'animate-pulse' : ''} />
            <span>Roost Paths</span>
          </button>
        )}
      </div>

      {/* Primary Leaflet DOM Mount Element with Explicit Inline Sizing */}
      <div
        id="map"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        className="w-full h-full relative"
      />
    </div>
  );
};
