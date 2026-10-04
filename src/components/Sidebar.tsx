import React, { useState, useEffect, useMemo } from 'react';
import { Observation, Hotspot, ViewMode, FlightCorridor, RegionConfig } from '../types/bird';
import { SPECIES_FORECASTS, isSpeciesOptimalNow } from '../data/viewingForecast';
import {
  MapPin,
  Compass,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Wind,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  Navigation,
  Clock,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mode: ViewMode;
  observations: Observation[];
  hotspots?: Hotspot[];
  selectedItem: Observation | Hotspot | null;
  onSelectItem: (item: Observation | Hotspot) => void;
  isLoading?: boolean;
  corridors?: FlightCorridor[];
  selectedCorridor?: FlightCorridor | null;
  onSelectCorridor?: (corridor: FlightCorridor) => void;
  filterBestNow?: boolean;
  onToggleFilterBestNow?: () => void;
  currentRegion?: RegionConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  mode,
  observations,
  hotspots,
  selectedItem,
  onSelectItem,
  isLoading = false,
  corridors = [],
  selectedCorridor,
  onSelectCorridor,
  filterBestNow = false,
  onToggleFilterBestNow,
  currentRegion,
}) => {
  const [activeTab, setActiveTab] = useState<'sightings' | 'influx'>('sightings');

  const isPortland = useMemo(() => {
    if (!currentRegion) return false;
    return currentRegion.id === 'portland' || currentRegion.regionCode === 'US-OR-051';
  }, [currentRegion]);

  // When switching away from Portland, reset active tab to sightings
  useEffect(() => {
    if (!isPortland && activeTab === 'influx') {
      setActiveTab('sightings');
    }
  }, [isPortland, activeTab]);

  const totalBirds = observations.reduce((acc, curr) => acc + (curr.howMany || 1), 0);
  const megaRoostCount = observations.filter((o) => o.howMany >= 250 || o.isCrowRoost).length;
  const notableCount = observations.filter(
    (o) => o.obsReviewed || (o.notes && o.notes.toLowerCase().includes('notable'))
  ).length;
  const totalCorridorBirds = corridors.reduce((acc, c) => acc + c.estFlockSize, 0);

  return (
    <>
      {/* Toggle button on map border */}
      <button
        onClick={onToggle}
        className={`fixed md:absolute top-28 z-20 bg-slate-900 border border-slate-750 text-slate-300 p-2 rounded-r-lg shadow-xl hover:bg-slate-800 transition-all ${
          isOpen ? 'left-80 md:left-96' : 'left-0'
        }`}
        title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Main Sidebar Pane */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-30 md:z-10 h-full bg-slate-950/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'w-80 md:w-96 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none'
        }`}
      >
        {/* Navigation Tabs (Sightings vs Flight Influx Routes) */}
        <div className="p-2.5 border-b border-slate-800 bg-slate-900/80">
          <div className={`grid ${isPortland ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold`}>
            <button
              onClick={() => setActiveTab('sightings')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
                activeTab === 'sightings'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={13} />
              <span>Sightings ({observations.length})</span>
            </button>
            {isPortland && (
              <button
                onClick={() => setActiveTab('influx')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
                  activeTab === 'influx'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wind size={13} />
                <span>Portland Corridors</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================== TAB 1: SIGHTINGS FEED ===================== */}
        {activeTab === 'sightings' && (
          <>
            {/* Top Intelligence Stats & Active Region */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/60">
              {currentRegion && (
                <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin size={13} className="text-emerald-400 shrink-0" />
                    <span className="font-bold text-slate-200 truncate">{currentRegion.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 font-mono shrink-0">
                    {currentRegion.regionCode || currentRegion.category}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity size={13} className="text-emerald-400" />
                  <span>Observation Feed</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {mode === 'hotspots' ? `${hotspots?.length || 0} Hotspots` : `${observations.length} Reports`}
                </span>
              </div>

              {mode !== 'hotspots' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <div className="text-slate-400 text-[10px]">Total Counted</div>
                    <div className="text-sm font-extrabold text-slate-100">{totalBirds.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    {isPortland ? (
                      <>
                        <div className="text-slate-400 text-[10px]">Mega-Roosts (&gt;250)</div>
                        <div className="text-sm font-extrabold text-red-400">{megaRoostCount} Active</div>
                      </>
                    ) : (
                      <>
                        <div className="text-slate-400 text-[10px]">Notable Sightings</div>
                        <div className="text-sm font-extrabold text-emerald-400">{notableCount} Verified</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Observation / Hotspot Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading && (
                <div className="flex items-center justify-center py-10 text-xs text-slate-400 gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching live regional telemetry...</span>
                </div>
              )}

              {!isLoading &&
                mode === 'hotspots' &&
                hotspots?.map((spot) => {
                  const isSelected = selectedItem?.lat === spot.lat && selectedItem?.lng === spot.lng;
                  return (
                    <div
                      key={spot.locId}
                      onClick={() => onSelectItem(spot)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                          <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
                          <span>{spot.locName}</span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">{spot.locId}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mt-2">
                        <span>Species Richness:</span>
                        <span className="text-emerald-300 font-bold">{spot.numSpeciesAllTime} recorded</span>
                      </div>
                    </div>
                  );
                })}

              {!isLoading &&
                mode !== 'hotspots' &&
                observations.map((obs) => {
                  const isSelected = selectedItem && 'id' in selectedItem && selectedItem.id === obs.id;
                  const count = obs.howMany || 1;
                  const isMegaRoost = obs.isCrowRoost || count >= 250;

                  let badgeColor = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
                  if (isMegaRoost) {
                    badgeColor = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
                  } else if (count > 100) {
                    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                  } else if (count > 20) {
                    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  }

                  return (
                    <div
                      key={obs.id}
                      onClick={() => onSelectItem(obs)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{obs.comName}</h4>
                          <p className="text-[11px] italic text-slate-400">{obs.sciName}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColor}`}>
                          {count.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-300 text-[11px] mb-1 truncate flex items-center gap-1">
                        <span className="text-emerald-400">📍</span>
                        <span>{obs.locName}</span>
                      </div>

                      {/* Optimal Viewing Window Badge */}
                      {SPECIES_FORECASTS[obs.speciesCode.toLowerCase()] && (
                        <div className="flex items-center gap-1.5 my-1.5 flex-wrap">
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

                      {isPortland && obs.originStagingArea && (
                        <div className="flex items-center gap-1.5 text-sky-300 text-[11px] bg-sky-950/40 px-2 py-0.5 rounded w-fit mb-1 border border-sky-800/50">
                          <Compass size={11} className="text-sky-400" />
                          <span>Origin: {obs.originStagingArea}</span>
                        </div>
                      )}

                      {isPortland && obs.direction && (
                        <div className="flex items-center gap-1.5 text-sky-400 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded w-fit mb-1 border border-slate-700">
                          <Navigation size={11} />
                          <span>Vector: {obs.direction}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800/70">
                        <span>{obs.obsDt}</span>
                        {obs.subId && obs.subId !== 'COMMUNITY' ? (
                          <a
                            href={`https://ebird.org/checklist/${obs.subId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                            onClick={(e) => e.stopPropagation()}
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
                  );
                })}

              {!isLoading && observations.length === 0 && (
                <div className="text-center py-10 text-xs text-slate-400">
                  No observations found matching the current filters.
                </div>
              )}
            </div>
          </>
        )}

        {/* ===================== TAB 2: PORTLAND FLIGHT INFLUX CORRIDORS ===================== */}
        {activeTab === 'influx' && isPortland && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs mb-2">
              <div className="text-slate-400 text-[11px] uppercase font-bold mb-1">
                Roost Convergence Vectors
              </div>
              <p className="text-slate-300 leading-relaxed">
                Known staging flyways converging into the downtown Portland winter mega-roost between 4:15 PM and 5:45 PM.
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Total Influx:</span>
                <span className="font-extrabold text-emerald-400 font-mono">
                  ~{totalCorridorBirds.toLocaleString()} crows
                </span>
              </div>
            </div>

            {corridors.map((c) => {
              const isSelected = selectedCorridor?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCorridor && onSelectCorridor(c)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-sky-400 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      ~{c.estFlockSize.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <Clock size={11} className="text-slate-400" />
                    <span>Active Window: {c.timeWindow}</span>
                  </div>

                  <div className="text-[11px] text-sky-300/90 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80 mt-2">
                    {c.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
};
