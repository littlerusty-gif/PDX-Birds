import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Observation, Hotspot } from '../types/bird';
import { ExternalLink, Navigation, CheckCircle2 } from 'lucide-react';

interface MapProps {
  observations: Observation[];
  hotspots?: Hotspot[];
  selectedItem: Observation | Hotspot | null;
  mode: 'species' | 'recent' | 'notable' | 'hotspots';
  onSelectItem: (item: Observation | Hotspot) => void;
}

// Map controller to invalidate sizing and handle smooth pan/zoom
function MapController({ item }: { item: Observation | Hotspot | null }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately after map creation to prevent blank/unrendered tiles
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

  useEffect(() => {
    if (item) {
      map.flyTo([item.lat, item.lng], 14, { duration: 1.2 });
    }
  }, [item, map]);

  return null;
}

export const Map: React.FC<MapProps> = ({
  observations,
  hotspots,
  selectedItem,
  mode,
  onSelectItem,
}) => {
  const portlandCenter: [number, number] = [45.5152, -122.6784];

  // Custom graduated HTML markers with color coding and glowing pulse for roosts
  const createObservationIcon = (obs: Observation) => {
    const count = obs.howMany || 1;
    const isRoost = obs.isCrowRoost || count >= 250;

    let color = '#14b8a6'; // Soft teal (1-20)
    let size = 20;

    if (isRoost) {
      color = '#ef4444'; // Glowing crimson pulse (> 250)
      size = 32;
    } else if (count > 100) {
      color = '#f97316'; // Deep orange (101-250)
      size = 26;
    } else if (count > 20) {
      color = '#f59e0b'; // Bright amber (21-100)
      size = 22;
    }

    // Directional vector transit arrow
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
      // Crimson pulse marker for roosts
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

    // Standard graduated circular marker
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

  return (
    <div
      className="w-full h-full min-h-[500px] flex-1 relative z-0 touch-pan-x touch-pan-y"
      style={{ width: '100%', height: '100%', minHeight: '100%' }}
    >
      <MapContainer
        center={portlandCenter}
        zoom={12}
        className="w-full h-full min-h-[500px]"
        style={{ width: '100%', height: '100%', minHeight: '100%' }}
        zoomControl={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
      >
        {/* Standard Free Public OpenStreetMap Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapController item={selectedItem} />

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

        {/* Observations (Species, Recent, Notable) */}
        {mode !== 'hotspots' &&
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
      </MapContainer>
    </div>
  );
};
