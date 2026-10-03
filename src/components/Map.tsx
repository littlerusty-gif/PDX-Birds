import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Observation, Hotspot, FlightCorridor, ViewMode, RegionConfig } from '../types/bird';
import { SPECIES_FORECASTS, isSpeciesOptimalNow } from '../data/viewingForecast';
import { ExternalLink, Navigation, CheckCircle2, Compass, Wind, Layers, Clock, Sparkles, MapPin, ZoomIn } from 'lucide-react';

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
}

// Controller component to smoothly adjust bounds and fly to items
function MapController({
  item,
  selectedCorridor,
  region,
  userLocation,
  onZoomChange,
}: {
  item: Observation | Hotspot | null;
  selectedCorridor?: FlightCorridor | null;
  region?: RegionConfig;
  userLocation?: [number, number] | null;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Pan to selected item
  useEffect(() => {
    if (item) {
      map.flyTo([item.lat, item.lng], 14, { duration: 1.2 });
    }
  }, [item, map]);

  // Fit bounds to selected corridor
  useEffect(() => {
    if (selectedCorridor && selectedCorridor.coordinates.length > 0) {
      const bounds = L.latLngBounds(selectedCorridor.coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.2 });
    }
  }, [selectedCorridor, map]);

  // Adjust Leaflet map bounds to fit region bounding box or center
  useEffect(() => {
    if (region) {
      if (region.category === 'gps' && userLocation) {
        map.flyTo(userLocation, 12, { duration: 1.2 });
      } else if (region.bounds) {
        map.fitBounds(region.bounds, { padding: [35, 35], maxZoom: region.zoom, duration: 1.2 });
      } else {
        map.flyTo(region.center, region.zoom, { duration: 1.2 });
      }
    }
  }, [region, userLocation, map]);

  return null;
}

// Bearing helper
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLng);
  const brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}

// Progress interpolation for traveling bird silhouettes
function getPositionAtProgress(
  coords: [number, number][],
  progress: number
): { lat: number; lng: number; bearing: number } {
  if (coords.length === 0) return { lat: 0, lng: 0, bearing: 0 };
  if (coords.length === 1) return { lat: coords[0][0], lng: coords[0][1], bearing: 0 };

  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const latDiff = coords[i + 1][0] - coords[i][0];
    const lngDiff = coords[i + 1][1] - coords[i][1];
    const len = Math.hypot(latDiff, lngDiff);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return { lat: coords[0][0], lng: coords[0][1], bearing: 0 };

  const targetDist = (((progress % 1) + 1) % 1) * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist || i === segmentLengths.length - 1) {
      const segT = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      const lat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * segT;
      const lng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * segT;
      const bearing = calculateBearing(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
      return { lat, lng, bearing };
    }
    accumulated += segLen;
  }

  const last = coords[coords.length - 1];
  const secondLast = coords[coords.length - 2];
  return {
    lat: last[0],
    lng: last[1],
    bearing: calculateBearing(secondLast[0], secondLast[1], last[0], last[1]),
  };
}

interface ObservationCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  totalBirds: number;
  hasNotable: boolean;
  hasMegaRoost: boolean;
  observations: Observation[];
}

export const Map: React.FC<MapProps> = ({
  observations,
  hotspots,
  selectedItem,
  mode,
  onSelectItem,
  corridors = [],
  selectedCorridor = null,
  onSelectCorridor,
  region,
  userLocation,
  onLocateMe,
  isLocating = false,
}) => {
  const defaultCenter: [number, number] = region ? region.center : [45.5152, -122.6784];
  const defaultZoom = region ? region.zoom : 12;

  const [currentZoom, setCurrentZoom] = useState<number>(defaultZoom);
  const [showFlightPaths, setShowFlightPaths] = useState<boolean>(true);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  // Active in metro hubs (Portland, Seattle, etc.) or when zoomed in
  const isMetroView = currentZoom >= 10 || region?.category === 'metro' || region?.id === 'portland';

  // Smooth continuous flight animation loop for traveling bird silhouettes
  useEffect(() => {
    if (!showFlightPaths) return;
    const interval = setInterval(() => {
      setAnimationProgress((prev) => (prev + 0.0035) % 1);
    }, 40);
    return () => clearInterval(interval);
  }, [showFlightPaths]);

  // Spatial Clustering for Nationwide / Statewide views (when currentZoom < 10)
  const observationClusters = useMemo(() => {
    if (isMetroView || mode === 'hotspots') return [];

    const gridSize = currentZoom <= 5 ? 2.8 : currentZoom <= 7 ? 1.2 : 0.55;
    const grid = new Map<string, Observation[]>();

    observations.forEach((obs) => {
      const gridX = Math.floor(obs.lng / gridSize);
      const gridY = Math.floor(obs.lat / gridSize);
      const key = `${gridX}:${gridY}`;
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(obs);
    });

    const clusters: ObservationCluster[] = [];
    grid.forEach((items, key) => {
      const totalBirds = items.reduce((acc, o) => acc + (o.howMany || 1), 0);
      const avgLat = items.reduce((acc, o) => acc + o.lat, 0) / items.length;
      const avgLng = items.reduce((acc, o) => acc + o.lng, 0) / items.length;
      const hasMegaRoost = items.some((o) => o.isCrowRoost || (o.howMany || 1) >= 250);
      const hasNotable = items.some(
        (o) => o.obsReviewed || (o.notes && o.notes.toLowerCase().includes('notable'))
      );

      clusters.push({
        id: `cluster-${key}`,
        lat: Number(avgLat.toFixed(4)),
        lng: Number(avgLng.toFixed(4)),
        count: items.length,
        totalBirds,
        hasNotable,
        hasMegaRoost,
        observations: items,
      });
    });

    return clusters;
  }, [observations, isMetroView, mode, currentZoom]);

  // Custom Clustered Observation Pin (Colored by Rarity & Flock Size)
  const createClusterIcon = (cluster: ObservationCluster) => {
    let bgColor = '#10b981'; // Emerald for standard clusters
    let pulseHtml = '';
    let size = cluster.count >= 10 ? 38 : 32;

    if (cluster.hasMegaRoost) {
      bgColor = '#ef4444'; // Glowing crimson for mega-roosts
      pulseHtml = `<span class="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>`;
      size = 40;
    } else if (cluster.hasNotable) {
      bgColor = '#a855f7'; // Purple for notable & rare species
      pulseHtml = `<span class="absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-60 animate-ping"></span>`;
      size = 36;
    } else if (cluster.totalBirds >= 50) {
      bgColor = '#f59e0b'; // Amber for high flock counts
    }

    const displayCount =
      cluster.totalBirds > 999
        ? (cluster.totalBirds / 1000).toFixed(1) + 'k'
        : cluster.count > 1
        ? `${cluster.count} obs`
        : cluster.totalBirds;

    return L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer" style="width: ${size}px; height: ${size}px;">
          ${pulseHtml}
          <div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px;" 
               class="rounded-full border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-[10px] text-center px-0.5 leading-none">
            ${displayCount}
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Custom individual observation marker
  const createObservationIcon = (obs: Observation) => {
    const count = obs.howMany || 1;
    const isRoost = obs.isCrowRoost || count >= 250;

    let color = '#14b8a6'; // Soft teal (1-20)
    let size = 22;

    if (isRoost) {
      color = '#ef4444'; // Glowing crimson pulse (> 250)
      size = 32;
    } else if (count > 100) {
      color = '#f97316'; // Deep orange (101-250)
      size = 26;
    } else if (count > 20) {
      color = '#f59e0b'; // Bright amber (21-100)
      size = 24;
    }

    let arrowHtml = '';
    if (obs.direction) {
      let arrowChar = '➔';
      if (obs.direction.includes('SW')) arrowChar = '↙';
      else if (obs.direction.includes('West') || obs.direction.includes('W')) arrowChar = '←';
      else if (obs.direction.includes('Circl')) arrowChar = '⟳';
      else if (obs.direction.includes('Roost')) arrowChar = '★';

      arrowHtml = `<div class="absolute -top-2 -right-2 bg-sky-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold border border-slate-900 shadow">${arrowChar}</div>`;
    }

    if (isRoost) {
      return L.divIcon({
        className: 'relative flex items-center justify-center',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-75 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-7 w-7 bg-red-600 border-2 border-white shadow-lg text-white font-extrabold text-[10px] items-center justify-center">
              ${count > 999 ? (count / 1000).toFixed(1) + 'k' : count}
            </span>
            ${arrowHtml}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    }

    return L.divIcon({
      className: 'relative',
      html: `
        <div style="background-color: ${color}; width: ${size}px; height: ${size}px;" 
             class="rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center text-slate-950 font-bold text-[10px]">
          ${count > 99 ? '99+' : count}
          ${arrowHtml}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const createHotspotIcon = () => {
    return L.divIcon({
      className: 'relative',
      html: `
        <div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-slate-950 text-xs">
          📍
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'relative flex items-center justify-center',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-9 w-9 rounded-full bg-sky-400 opacity-75 animate-ping"></span>
          <span class="relative inline-flex rounded-full h-6 w-6 bg-sky-500 border-2 border-white shadow-xl text-white font-extrabold text-[11px] items-center justify-center">
            🛰️
          </span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const createArrowDecoratorIcon = (bearingDeg: number, color: string) => {
    return L.divIcon({
      className: 'directional-arrow-decorator',
      html: `
        <div style="transform: rotate(${bearingDeg}deg); color: ${color};" class="flex items-center justify-center opacity-90 drop-shadow">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L3 19l9-4 9 4L12 2z" />
          </svg>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const createFlyingBirdIcon = (bearingDeg: number, color: string, isLead: boolean = false) => {
    const size = isLead ? 26 : 21;
    return L.divIcon({
      className: 'flying-bird-marker-container pointer-events-none',
      html: `
        <div style="transform: rotate(${bearingDeg}deg);" class="flex items-center justify-center">
          <div class="animated-flying-bird" style="color: ${color};">
            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 6c-4.5 1-8.5 4.5-10 9C10.5 10.5 6.5 7 2 6c3 5 4.5 11 4.5 11l4.5-3 1 3 1-3 4.5 3s1.5-6 4.5-11z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Trajectories for roost observations
  const observationTrajectories = useMemo(() => {
    if (!isMetroView) return [];

    return observations
      .filter((obs) => obs.trajectoryCoords || obs.direction || obs.flightHeadingDeg)
      .map((obs) => {
        let coords = obs.trajectoryCoords;
        if (!coords || coords.length < 2) {
          let heading = obs.flightHeadingDeg ?? 225;
          if (!obs.flightHeadingDeg && obs.direction) {
            if (obs.direction.includes('SW')) heading = 225;
            else if (obs.direction.includes('West') || obs.direction.includes('W')) heading = 270;
            else if (obs.direction.includes('Northbound')) heading = 0;
            else if (obs.direction.includes('Southbound')) heading = 180;
          }
          const backAngle = (heading + 180) % 360;
          const originLat = obs.lat + Math.cos((backAngle * Math.PI) / 180) * 0.024;
          const originLng =
            obs.lng + (Math.sin((backAngle * Math.PI) / 180) * 0.024) / Math.cos((obs.lat * Math.PI) / 180);
          coords = [
            [originLat, originLng],
            [obs.lat, obs.lng],
          ];
        }

        const start = coords[coords.length - 2];
        const end = coords[coords.length - 1];
        const bearing = calculateBearing(start[0], start[1], end[0], end[1]);

        const mid = [
          start[0] + (end[0] - start[0]) * 0.5,
          start[1] + (end[1] - start[1]) * 0.5,
        ] as [number, number];

        return {
          id: obs.id,
          obs,
          coords,
          mid,
          bearing,
          isRoost: obs.isCrowRoost || (obs.howMany || 0) >= 250,
        };
      });
  }, [observations, isMetroView]);

  return (
    <div
      className="w-full h-full min-h-[500px] flex-1 relative z-0 touch-pan-x touch-pan-y"
      style={{ width: '100%', height: '100%', minHeight: '100%' }}
    >
      {/* Floating Map Controls (Top Right) */}
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

        {isMetroView && (
          <button
            onClick={() => setShowFlightPaths(!showFlightPaths)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border backdrop-blur-md ${
              showFlightPaths
                ? 'bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 border-emerald-400/80 shadow-emerald-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle Animated Inbound Flight Trajectories and Flying Bird Silhouettes"
          >
            <Wind size={13} className={showFlightPaths ? 'animate-pulse' : ''} />
            <span>Roost Paths {showFlightPaths ? 'ON' : 'OFF'}</span>
          </button>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full min-h-[500px]"
        style={{ width: '100%', height: '100%', minHeight: '100%' }}
        zoomControl={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapController
          item={selectedItem}
          selectedCorridor={selectedCorridor}
          region={region}
          userLocation={userLocation}
          onZoomChange={setCurrentZoom}
        />

        {/* User GPS Location Marker & 30-mile Radius */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={createUserLocationIcon()}>
              <Popup>
                <div className="p-1 text-slate-200 text-xs">
                  <div className="font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                    <Navigation size={13} />
                    <span>Your GPS Location</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Showing local bird observations within a 30-mile radius.
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={48280}
              pathOptions={{
                color: '#38bdf8',
                fillColor: '#0284c7',
                fillOpacity: 0.05,
                weight: 1.5,
                dashArray: '6, 6',
              }}
            />
          </>
        )}

        {/* Major Flight Corridors in Metro Roosts */}
        {isMetroView &&
          showFlightPaths &&
          corridors.map((corridor) => {
            const isSelected = selectedCorridor?.id === corridor.id;

            const legArrowMarkers: { pos: [number, number]; bearing: number; key: string }[] = [];
            for (let i = 0; i < corridor.coordinates.length - 1; i++) {
              const p1 = corridor.coordinates[i];
              const p2 = corridor.coordinates[i + 1];
              const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
              const legLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);

              const ratios = legLen > 0.015 ? [0.35, 0.72] : [0.5];
              ratios.forEach((ratio, rIdx) => {
                legArrowMarkers.push({
                  pos: [p1[0] + (p2[0] - p1[0]) * ratio, p1[1] + (p2[1] - p1[1]) * ratio],
                  bearing,
                  key: `${corridor.id}-leg-${i}-${rIdx}`,
                });
              });
            }

            const birdOffsets = [0, 0.36, 0.72];
            const flyingBirds = birdOffsets.map((offset, bIdx) => {
              const t = (animationProgress + offset) % 1;
              const pos = getPositionAtProgress(corridor.coordinates, t);
              return {
                pos: [pos.lat, pos.lng] as [number, number],
                bearing: pos.bearing,
                isLead: bIdx === 0,
                key: `${corridor.id}-bird-${bIdx}`,
              };
            });

            return (
              <React.Fragment key={corridor.id}>
                <Polyline
                  positions={corridor.coordinates}
                  pathOptions={{
                    color: corridor.color,
                    weight: isSelected ? 8 : 5,
                    opacity: isSelected ? 0.45 : 0.28,
                    lineCap: 'round',
                  }}
                />

                <Polyline
                  positions={corridor.coordinates}
                  pathOptions={{
                    color: corridor.color,
                    weight: isSelected ? 4 : 2.8,
                    opacity: 0.95,
                    dashArray: '8, 8',
                    className: 'flight-trajectory-polyline',
                  }}
                  eventHandlers={{
                    click: () => onSelectCorridor && onSelectCorridor(corridor),
                  }}
                >
                  <Tooltip sticky direction="top" className="custom-leaflet-tooltip">
                    <div className="text-xs font-semibold p-1">
                      <div className="font-bold text-sky-400">{corridor.name}</div>
                      <div className="text-slate-200">Window: {corridor.timeWindow}</div>
                      <div className="text-emerald-400 font-bold">~{corridor.estFlockSize.toLocaleString()} Crows</div>
                    </div>
                  </Tooltip>
                </Polyline>

                {legArrowMarkers.map((arrow) => (
                  <Marker
                    key={arrow.key}
                    position={arrow.pos}
                    icon={createArrowDecoratorIcon(arrow.bearing, corridor.color)}
                    interactive={false}
                  />
                ))}

                {flyingBirds.map((bird) => (
                  <Marker
                    key={bird.key}
                    position={bird.pos}
                    icon={createFlyingBirdIcon(bird.bearing, corridor.color, bird.isLead)}
                    interactive={false}
                  />
                ))}
              </React.Fragment>
            );
          })}

        {/* Metro Observation Trajectories */}
        {isMetroView &&
          showFlightPaths &&
          observationTrajectories.map((traj) => {
            const color = traj.isRoost ? '#ef4444' : '#38bdf8';
            const birdPos = getPositionAtProgress(traj.coords, (animationProgress * 1.5) % 1);

            return (
              <React.Fragment key={`obs-traj-${traj.id}`}>
                <Polyline
                  positions={traj.coords}
                  pathOptions={{
                    color,
                    weight: 2.5,
                    opacity: 0.9,
                    dashArray: '6, 6',
                    className: 'flight-trajectory-polyline',
                  }}
                  eventHandlers={{
                    click: () => onSelectItem(traj.obs),
                  }}
                />

                <Marker
                  position={traj.mid}
                  icon={createArrowDecoratorIcon(traj.bearing, color)}
                  interactive={false}
                />

                <Marker
                  position={[birdPos.lat, birdPos.lng]}
                  icon={createFlyingBirdIcon(birdPos.bearing, color, true)}
                  interactive={false}
                />
              </React.Fragment>
            );
          })}

        {/* ===================== NATIONWIDE / STATE CLUSTERED PINS (Zoom < 10) ===================== */}
        {!isMetroView &&
          mode !== 'hotspots' &&
          observationClusters.map((cluster) => (
            <Marker
              key={cluster.id}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster)}
            >
              <Popup>
                <div className="p-1 min-w-[210px] text-slate-200">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>Regional Flock Cluster</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">
                      {cluster.totalBirds.toLocaleString()} birds
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1 mb-2">
                    {cluster.observations.slice(0, 5).map((obs) => (
                      <div
                        key={obs.id}
                        onClick={() => onSelectItem(obs)}
                        className="text-xs p-1.5 rounded bg-slate-850 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate font-semibold text-slate-200">{obs.comName}</span>
                        <span className="text-[11px] text-emerald-400 font-bold ml-1.5">
                          {obs.howMany.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {cluster.observations.length > 5 && (
                      <div className="text-[10px] text-slate-400 italic text-center">
                        + {cluster.observations.length - 5} more observations in this sector
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>Click on a sighting or zoom in to inspect</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ===================== INDIVIDUAL OBSERVATIONS (Zoom >= 10 or Metro) ===================== */}
        {(isMetroView || mode === 'hotspots') &&
          mode !== 'hotspots' &&
          observations.map((obs) => (
            <Marker
              key={obs.id}
              position={[obs.lat, obs.lng]}
              icon={createObservationIcon(obs)}
              eventHandlers={{ click: () => onSelectItem(obs) }}
            >
              <Popup>
                <div className="p-1 min-w-[220px] text-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{obs.comName}</h3>
                      <p className="text-xs italic text-slate-400">{obs.sciName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        obs.howMany >= 250
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {obs.howMany.toLocaleString()} birds
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-1.5 flex items-center gap-1">
                    <span className="text-emerald-400">📍</span>
                    <span className="truncate">{obs.locName}</span>
                  </div>

                  {SPECIES_FORECASTS[obs.speciesCode.toLowerCase()] && (
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="bg-amber-950/60 border border-amber-800/40 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock size={10} className="text-amber-400" />
                        <span>{SPECIES_FORECASTS[obs.speciesCode.toLowerCase()].optimalWindowBadge}</span>
                      </span>
                      {isSpeciesOptimalNow(obs.speciesCode) && (
                        <span className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-0.5">
                          <Sparkles size={9} />
                          <span>PEAK NOW</span>
                        </span>
                      )}
                    </div>
                  )}

                  {obs.originStagingArea && (
                    <div className="bg-slate-800/90 border border-sky-500/30 rounded px-2 py-1 text-xs text-sky-300 flex items-center gap-1.5 mb-1.5">
                      <Compass size={12} className="text-sky-400" />
                      <span>Origin: {obs.originStagingArea}</span>
                    </div>
                  )}

                  {obs.direction && (
                    <div className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-sky-300 flex items-center gap-1.5 mb-1.5">
                      <Navigation size={12} />
                      <span>Flight Vector: {obs.direction}</span>
                    </div>
                  )}

                  {obs.notes && (
                    <p className="text-[11px] text-slate-300 bg-slate-850 p-1.5 rounded mb-2 border border-slate-750">
                      {obs.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 mt-1 text-[11px]">
                    <span className="text-slate-400">{obs.obsDt}</span>
                    {obs.subId && obs.subId !== 'COMMUNITY' ? (
                      <a
                        href={`https://ebird.org/checklist/${obs.subId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Checklist <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={11} /> Community
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Hotspots Mode */}
        {mode === 'hotspots' &&
          hotspots?.map((spot) => (
            <Marker
              key={spot.locId}
              position={[spot.lat, spot.lng]}
              icon={createHotspotIcon()}
              eventHandlers={{ click: () => onSelectItem(spot) }}
            >
              <Popup>
                <div className="p-1 min-w-[210px] text-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm mb-1">
                    <span>📍</span>
                    <span>{spot.locName}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">Code: {spot.locId}</div>
                  <div className="bg-slate-800 rounded p-2 text-xs mb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">All-Time Species:</span>
                      <span className="font-bold text-emerald-300">{spot.numSpeciesAllTime}</span>
                    </div>
                  </div>
                  <a
                    href={`https://ebird.org/hotspot/${spot.locId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    View eBird Hotspot <ExternalLink size={12} />
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
