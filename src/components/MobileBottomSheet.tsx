import React from 'react';
import { Observation, Hotspot } from '../types/bird';
import { ExternalLink, Navigation, CheckCircle2, X, Sparkles, MapPin } from 'lucide-react';

interface MobileBottomSheetProps {
  item: Observation | Hotspot | null;
  onClose: () => void;
  onOpenAiWidget: (query?: string) => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({ item, onClose, onOpenAiWidget }) => {
  if (!item) return null;

  const isObservation = 'howMany' in item;
  const obs = isObservation ? (item as Observation) : null;
  const spot = !isObservation ? (item as Hotspot) : null;

  const count = obs?.howMany || 1;
  const isRoost = obs?.isCrowRoost || count >= 250;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden animate-in slide-in-from-bottom duration-300">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm -z-10"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="bg-slate-900/95 border-t border-slate-750 backdrop-blur-xl rounded-t-2xl p-4 max-h-[80dvh] overflow-y-auto shadow-2xl text-slate-100 pb-8">
        {/* Grab Handle */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            {obs ? (
              <>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <span>{obs.comName}</span>
                  {isRoost && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 animate-pulse">
                      Mega-Roost
                    </span>
                  )}
                </h3>
                <p className="text-xs italic text-slate-400">{obs.sciName}</p>
              </>
            ) : (
              <>
                <h3 className="text-base font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>{spot?.locName}</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">eBird Hotspot: {spot?.locId}</p>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Badges / Stats */}
        {obs && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
                isRoost
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                  : count > 100
                  ? 'bg-orange-500 text-slate-950'
                  : count > 20
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-teal-500 text-slate-950'
              }`}
            >
              {count.toLocaleString()} birds
            </span>

            {obs.obsReviewed && (
              <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <CheckCircle2 size={12} /> Confirmed
              </span>
            )}

            <span className="text-xs text-slate-400 ml-auto font-mono">
              {obs.obsDt}
            </span>
          </div>
        )}

        {/* Location Row */}
        {obs && (
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-2 bg-slate-850 p-2 rounded-lg border border-slate-800">
            <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{obs.locName}</span>
          </div>
        )}

        {/* Flight Direction / Vector */}
        {obs?.direction && (
          <div className="bg-sky-950/60 border border-sky-800/60 text-sky-300 p-2 rounded-lg text-xs font-semibold flex items-center gap-2 mb-2">
            <Navigation size={14} className="text-sky-400 flex-shrink-0" />
            <span>Flight Vector: {obs.direction}</span>
          </div>
        )}

        {/* Field Notes */}
        {obs?.notes && (
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-750 text-xs text-slate-300 mb-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Field Notes</div>
            <p className="leading-relaxed">{obs.notes}</p>
          </div>
        )}

        {/* Hotspot details if spot */}
        {spot && (
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-750 text-xs text-slate-300 mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400">All-Time Species Reported:</span>
              <span className="font-extrabold text-emerald-400 text-sm">{spot.numSpeciesAllTime}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Coordinates:</span>
              <span className="font-mono">{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {obs?.subId && obs.subId !== 'COMMUNITY' ? (
            <a
              href={`https://ebird.org/checklist/${obs.subId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              <span>eBird Checklist</span>
              <ExternalLink size={13} />
            </a>
          ) : spot ? (
            <a
              href={`https://ebird.org/hotspot/${spot.locId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              <span>View Hotspot</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <div className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-800 text-emerald-400 font-semibold text-xs rounded-xl border border-emerald-500/20">
              <CheckCircle2 size={13} />
              <span>Community Spotter</span>
            </div>
          )}

          <button
            onClick={() => {
              const query = obs ? `Tell me about ${obs.comName} roosting and migration patterns around ${obs.locName} in Portland.` : undefined;
              onOpenAiWidget(query);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-750 border border-purple-500/40 text-purple-300 font-bold text-xs rounded-xl transition-colors"
          >
            <Sparkles size={13} className="text-purple-400" />
            <span>AI Intel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
