import React, { useState } from 'react';
import { RegionConfig } from '../types/bird';
import { US_STATES, PRIMARY_REGIONS } from '../data/regions';
import { Navigation, MapPin, Globe, Compass, ChevronRight, X, Sparkles } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegion: (region: RegionConfig) => void;
  onLocateMe: () => void;
  isLocating?: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSelectRegion,
  onLocateMe,
  isLocating = false,
}) => {
  const [selectedStateCode, setSelectedStateCode] = useState<string>('');

  if (!isOpen) return null;

  const handleStateSelect = (code: string) => {
    const state = US_STATES.find((s) => s.code === code);
    if (!state) return;

    const stateRegion: RegionConfig = {
      id: `state-${state.code.toLowerCase()}`,
      name: `${state.name} (${state.code})`,
      category: 'state',
      regionCode: state.code,
      center: state.center,
      zoom: state.zoom,
      description: `Live observations and notable sightings from ${state.name}.`,
      endpoint: `data/obs/${state.code}/recent/notable?detail=full&back=7`,
    };

    onSelectRegion(stateRegion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-5 pb-4 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-md">
              <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles size={11} />
                <span>The Bird Book</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Select Your Birding Region
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Welcome to The Bird Book! Select where you would like to track bird observations,
            rarities, and urban roosts. You can switch regions at any time.
          </p>
        </div>

        {/* Options List */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto custom-scrollbar">
          {/* 1. Current Location (GPS Nearby) */}
          <button
            onClick={() => {
              onLocateMe();
              onClose();
            }}
            disabled={isLocating}
            className="w-full text-left p-3 rounded-xl border border-sky-500/30 bg-sky-950/20 hover:bg-sky-900/30 transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0">
                <Navigation size={18} className={isLocating ? 'animate-spin' : ''} />
              </div>
              <div>
                <div className="text-xs font-bold text-sky-200">
                  Current Location (GPS Nearby)
                </div>
                <div className="text-[11px] text-slate-400">
                  {isLocating ? 'Detecting coordinates...' : 'Center map on your GPS coordinates within a 30-mile radius'}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-sky-400 transition-colors shrink-0" />
          </button>

          {/* 2. Portland Metro & Roost Corridors */}
          <button
            onClick={() => {
              const portland = PRIMARY_REGIONS.find((r) => r.id === 'portland') || PRIMARY_REGIONS[0];
              onSelectRegion(portland);
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <span>Portland Metro & Roost Corridors</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Default
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Downtown mega-roosts, Willamette River flyway, and Chapman Chimney
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
          </button>

          {/* 3. Washington State */}
          <button
            onClick={() => {
              const wa = US_STATES.find((s) => s.code === 'US-WA')!;
              onSelectRegion({
                id: 'state-us-wa',
                name: 'Washington State (US-WA)',
                category: 'state',
                regionCode: 'US-WA',
                center: wa.center,
                zoom: wa.zoom,
                description: 'Live eBird observations from Washington State.',
                endpoint: 'data/obs/US-WA/recent/notable?detail=full&back=7',
              });
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl border border-slate-750 bg-slate-850 hover:bg-slate-800 transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                WA
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Washington State</div>
                <div className="text-[11px] text-slate-400">Puget Sound, Cascades, and Columbia Basin flyways</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-400 transition-colors shrink-0" />
          </button>

          {/* 4. Oregon State */}
          <button
            onClick={() => {
              const or = US_STATES.find((s) => s.code === 'US-OR')!;
              onSelectRegion({
                id: 'state-us-or',
                name: 'Oregon State (US-OR)',
                category: 'state',
                regionCode: 'US-OR',
                center: or.center,
                zoom: or.zoom,
                description: 'Live eBird observations from Oregon State.',
                endpoint: 'data/obs/US-OR/recent/notable?detail=full&back=7',
              });
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl border border-slate-750 bg-slate-850 hover:bg-slate-800 transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                OR
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Oregon State</div>
                <div className="text-[11px] text-slate-400">Coast, Willamette Valley, Cascades, and High Desert</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
          </button>

          {/* 5. Nationwide Rare / Notable */}
          <button
            onClick={() => {
              const nation = PRIMARY_REGIONS.find((r) => r.id === 'nationwide')!;
              onSelectRegion(nation);
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-200">Nationwide Rare / Notable (US)</div>
                <div className="text-[11px] text-slate-400">Live eBird alerts for rare and vagrant sightings across the country</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-400 transition-colors shrink-0" />
          </button>

          {/* 6. Select Any US State... */}
          <div className="p-3 rounded-xl border border-slate-750 bg-slate-850">
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
              <span>Select Any US State...</span>
              <span className="text-[10px] text-slate-400">50 States + DC</span>
            </label>
            <select
              value={selectedStateCode}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStateCode(val);
                if (val) {
                  handleStateSelect(val);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
            >
              <option value="">Choose a US State (US-AL through US-WY)...</option>
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.code} — {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>You can change regions anytime in the top bar.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-colors"
          >
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
};
