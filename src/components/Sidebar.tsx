import React from 'react';
import { Observation, Hotspot, ViewMode } from '../types/bird';
import { Navigation, ChevronLeft, ChevronRight, Layers, MapPin, ExternalLink, Activity } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mode: ViewMode;
  observations: Observation[];
  hotspots?: Hotspot[];
  selectedItem: Observation | Hotspot | null;
  onSelectItem: (item: Observation | Hotspot) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  mode,
  observations,
  hotspots,
  selectedItem,
  onSelectItem,
  isLoading,
}) => {
  const totalBirds = observations.reduce((acc, curr) => acc + (curr.howMany || 1), 0);
  const megaRoostCount = observations.filter(o => o.howMany >= 250 || o.isCrowRoost).length;

  return (
    <>
      {/* Toggle button on map border */}
      <button
        onClick={onToggle}
        className={`absolute top-28 z-10 bg-slate-900 border border-slate-750 text-slate-300 p-2 rounded-r-lg shadow-xl hover:bg-slate-800 transition-all ${
          isOpen ? 'left-80 md:left-96' : 'left-0'
        }`}
        title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Main Sidebar Pane */}
      <aside
        className={`absolute top-0 bottom-0 left-0 z-10 w-80 md:w-96 bg-slate-950/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Intelligence Stats */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/60">
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
                <div className="text-slate-400 text-[10px]">Mega-Roosts (&gt;250)</div>
                <div className="text-sm font-extrabold text-red-400">{megaRoostCount} Active</div>
              </div>
            </div>
          )}
        </div>

        {/* Observation / Hotspot Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-xs text-slate-400 gap-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Ingesting eBird 2.0 telemetry...</span>
            </div>
          )}

          {!isLoading && mode === 'hotspots' && hotspots?.map((spot) => {
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

          {!isLoading && mode !== 'hotspots' && observations.map((obs) => {
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

                {obs.direction && (
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      eBird List <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-emerald-400 font-medium">Community Verified</span>
                  )}
                </div>
              </div>
            );
          })}

          {!isLoading && mode !== 'hotspots' && observations.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No sightings recorded for this filter in Portland area.
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
            <Layers size={11} /> Flock Size Heatmap
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span> 1-20
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> 21-100
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> 101-250
            </span>
            <span className="flex items-center gap-1 font-bold text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block"></span> 250+
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
