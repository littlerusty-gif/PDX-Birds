import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewMode, TaxonomyItem, RegionConfig, Observation } from '../types/bird';
import { PRIMARY_REGIONS, US_STATES, NATIONWIDE_TAXONOMY } from '../data/regions';
import {
  Search,
  Compass,
  AlertTriangle,
  MapPin,
  Feather,
  Sparkles,
  Plus,
  X,
  List,
  Navigation,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

interface HeaderProps {
  mode: ViewMode;
  onSetMode: (mode: ViewMode) => void;
  selectedSpecies: TaxonomyItem | null;
  onSelectSpecies: (species: TaxonomyItem | null) => void;
  onOpenReportModal: () => void;
  onOpenAiWidget: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  filterBestNow?: boolean;
  onToggleFilterBestNow?: () => void;
  currentRegion: RegionConfig;
  onSelectRegion: (region: RegionConfig) => void;
  onLocateMe: () => void;
  isLocating?: boolean;
  observations?: Observation[];
  searchFilter: string;
  onSearchFilterChange: (val: string) => void;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSetMode,
  selectedSpecies,
  onSelectSpecies,
  onOpenReportModal,
  onOpenAiWidget,
  isSidebarOpen,
  onToggleSidebar,
  filterBestNow = false,
  onToggleFilterBestNow,
  currentRegion,
  onSelectRegion,
  onLocateMe,
  isLocating = false,
  observations = [],
  searchFilter,
  onSearchFilterChange,
  onOpenChat,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close species autocomplete on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute active region dropdown value
  const currentRegionValue = useMemo(() => {
    if (currentRegion.category === 'gps') return 'gps';
    if (currentRegion.id === 'portland' || currentRegion.regionCode === 'US-OR-051') return 'portland';
    if (currentRegion.regionCode === 'US-WA' || currentRegion.id === 'state-us-wa') return 'US-WA';
    if (currentRegion.regionCode === 'US-OR' || currentRegion.id === 'state-us-or') return 'US-OR';
    if (currentRegion.regionCode === 'US' || currentRegion.id === 'nationwide') return 'US';
    return currentRegion.regionCode || currentRegion.id;
  }, [currentRegion]);

  // Synchronized dropdown selection handler
  const handleDropdownSelect = (val: string) => {
    if (val === 'gps') {
      onLocateMe();
    } else if (val === 'portland') {
      onSelectRegion(PRIMARY_REGIONS[0]);
    } else if (val === 'US-WA') {
      const wa: RegionConfig = {
        id: 'state-us-wa',
        name: 'Washington State (US-WA)',
        category: 'state',
        regionCode: 'US-WA',
        center: [47.5000, -120.5000],
        zoom: 7,
        bounds: [[45.54, -124.85], [49.00, -116.92]],
        description: 'Puget Sound, Cascades, Olympic Peninsula, Skagit Flats & Columbia Basin flyways.',
        endpoint: 'data/obs/US-WA/recent/notable?detail=full&back=7',
      };
      onSelectRegion(wa);
    } else if (val === 'US-OR') {
      const or = PRIMARY_REGIONS.find((r) => r.regionCode === 'US-OR') || {
        id: 'state-us-or',
        name: 'Oregon State (US-OR)',
        category: 'state',
        regionCode: 'US-OR',
        center: [43.8041, -120.5542],
        zoom: 7,
        bounds: [[41.99, -124.57], [46.24, -116.46]],
        description: 'Oregon coast, Willamette Valley, Cascades, and High Desert.',
        endpoint: 'data/obs/US-OR/recent/notable?detail=full&back=7',
      };
      onSelectRegion(or);
    } else if (val === 'US' || val === 'nationwide') {
      const nation = PRIMARY_REGIONS.find((r) => r.regionCode === 'US') || {
        id: 'nationwide',
        name: 'Nationwide Rare & Notable (US)',
        category: 'nationwide',
        regionCode: 'US',
        center: [39.8283, -98.5795],
        zoom: 4,
        bounds: [[24.39, -125.0], [49.38, -66.93]],
        description: 'Live alerts across the United States.',
        endpoint: 'data/obs/US/recent/notable?detail=full&back=7',
      };
      onSelectRegion(nation);
    } else {
      const st = US_STATES.find((s) => s.code === val);
      if (st) {
        onSelectRegion({
          id: `state-${st.code.toLowerCase()}`,
          name: `${st.code} - ${st.name}`,
          category: 'state',
          regionCode: st.code,
          center: st.center,
          zoom: st.zoom,
          bounds: st.bounds,
          description: `Live observations from ${st.name} (${st.code}).`,
          endpoint: `data/obs/${st.code}/recent/notable?detail=full&back=7`,
        });
      }
    }
  };

  // Combined nationwide taxonomy + observed species for autocomplete
  const combinedTaxonomy = useMemo(() => {
    const map = new Map<string, TaxonomyItem>();
    NATIONWIDE_TAXONOMY.forEach((t) => map.set(t.speciesCode.toLowerCase(), t));
    observations.forEach((obs) => {
      const code = obs.speciesCode.toLowerCase();
      if (!map.has(code)) {
        map.set(code, {
          comName: obs.comName.replace(/\(Community Sighting\)/g, '').trim(),
          sciName: obs.sciName,
          speciesCode: obs.speciesCode,
        });
      }
    });
    return Array.from(map.values());
  }, [observations]);

  // Filtered taxonomy matches for search bar
  const filteredTaxonomy = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return [];
    return combinedTaxonomy
      .filter(
        (item) =>
          item.comName.toLowerCase().includes(q) ||
          item.sciName.toLowerCase().includes(q) ||
          item.speciesCode.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchFilter, combinedTaxonomy]);

  const getRegionIcon = (region: RegionConfig) => {
    if (region.category === 'gps') return <Navigation size={14} className="text-sky-400" />;
    if (region.category === 'metro') return <MapPin size={14} className="text-emerald-400" />;
    if (region.regionCode === 'US-WA') return <MapPin size={14} className="text-teal-400" />;
    if (region.category === 'state') return <MapPin size={14} className="text-amber-400" />;
    return <Globe size={14} className="text-purple-400" />;
  };

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 px-3 md:px-5 py-2 md:py-2.5 z-30 fixed md:relative top-0 inset-x-0 shadow-xl w-full">
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Title & Brand: The Bird Book */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="The Bird Book Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-md rounded-full bg-slate-900 border border-slate-750"
            />
            <div>
              <h1 className="font-extrabold text-sm md:text-lg tracking-tight flex items-center gap-1.5 md:gap-2">
                <span>The Bird Book</span>
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-1.5 md:px-2 py-0.5 rounded border border-emerald-500/20">
                  USA eBird 2.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Nationwide Tracking, Local Roosts & Live eBird Telemetry
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className="p-1.5 rounded-lg bg-sky-600/90 text-white border border-sky-500 active:scale-95"
              title="Current Location (GPS Nearby)"
            >
              <Navigation size={15} className={isLocating ? 'animate-spin' : ''} />
            </button>
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                  isSidebarOpen
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
                title="Toggle Observations List"
              >
                <List size={16} />
              </button>
            )}
            <button
              onClick={onOpenReportModal}
              className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold"
              title="Report Sighting"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onOpenChat}
              className="p-1.5 rounded-lg bg-teal-600 text-white relative active:scale-95 shadow-sm"
              title="Field Chat & Meetups"
            >
              <Users size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            <button
              onClick={onOpenAiWidget}
              className="p-1.5 rounded-lg bg-purple-600 text-white"
              title="AI Roost Summary"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* Center: Synchronized Region Selector Dropdown & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 md:max-w-2xl md:mx-3">
          
          {/* 1. Synchronized Region Selector Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 pointer-events-none text-slate-400 z-10">
              {getRegionIcon(currentRegion)}
            </div>
            <select
              id="region-selector"
              data-testid="region-selector"
              aria-label="Region Selector"
              value={currentRegionValue}
              onChange={(e) => handleDropdownSelect(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-7 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-slate-600 focus:border-emerald-500 rounded-lg text-xs font-semibold text-slate-200 transition-colors shadow-sm appearance-none cursor-pointer focus:outline-none"
            >
              <option value="portland">Portland Metro (Roost Focus)</option>
              <option value="US-WA">Washington State (US-WA)</option>
              <option value="US-OR">Oregon State (US-OR)</option>
              <option value="gps">Current Location (GPS Nearby)</option>
              <option value="US">Nationwide Rare & Notable (US)</option>
              <optgroup label="All 50 US States">
                {US_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.code} - {st.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 pointer-events-none text-slate-400 z-10" />
          </div>

          {/* 2. Fast Nationwide Autocomplete Search Bar */}
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => {
                  onSearchFilterChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search bird or species (Crow, Swift, Falcon, Eagle)..."
                className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {(searchFilter || selectedSpecies) && (
                <button
                  onClick={() => {
                    onSearchFilterChange('');
                    onSelectSpecies(null);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Species Dropdown Menu */}
            {isDropdownOpen && filteredTaxonomy.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-750 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                <div className="p-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex justify-between">
                  <span>Species Matches</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Click to isolate on map</span>
                </div>
                {filteredTaxonomy.map((item) => (
                  <button
                    key={item.speciesCode}
                    onClick={() => {
                      onSelectSpecies(item);
                      onSearchFilterChange(item.comName);
                      setIsDropdownOpen(false);
                      onSetMode('species');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-100">{item.comName}</span>
                      <span className="text-slate-400 italic text-[11px] ml-1.5">{item.sciName}</span>
                    </div>
                    <span className="bg-slate-800 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {item.speciesCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Header Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 border border-blue-400/80 text-white font-bold text-xs rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Current Location (GPS Nearby - 30 miles / 50 km)"
          >
            <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Report Sighting</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-800/80 hover:bg-teal-700 border border-teal-500/50 text-teal-200 hover:text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            title="Regional Community Meetup & Field Chat"
          >
            <Users size={15} className="text-teal-300" />
            <span>Field Chat</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={onOpenAiWidget}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-purple-500/40 text-purple-300 font-semibold text-xs rounded-lg transition-colors"
          >
            <Sparkles size={15} className="text-purple-400" />
            <span>AI Intel</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Filter Chips */}
      <div className="w-full flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 text-xs no-scrollbar">
        <button
          onClick={() => onSetMode('recent')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors text-[11px] md:text-xs ${
            mode === 'recent'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
          }`}
        >
          <Compass size={13} />
          <span>Recent Sightings</span>
        </button>

        <button
          onClick={() => {
            if (!selectedSpecies) {
              const amecro = NATIONWIDE_TAXONOMY[0];
              onSelectSpecies(amecro);
              onSearchFilterChange(amecro.comName);
            }
            onSetMode('species');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors text-[11px] md:text-xs ${
            mode === 'species'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
          }`}
        >
          <Feather size={13} />
          <span>
            {selectedSpecies ? `Species: ${selectedSpecies.comName}` : 'Species Track'}
          </span>
        </button>

        <button
          onClick={() => onSetMode('notable')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors text-[11px] md:text-xs ${
            mode === 'notable'
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
          }`}
        >
          <AlertTriangle size={13} className={mode === 'notable' ? 'text-white' : 'text-pink-400'} />
          <span>Notable & Rare</span>
        </button>

        <button
          onClick={() => onSetMode('hotspots')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors text-[11px] md:text-xs ${
            mode === 'hotspots'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
          }`}
        >
          <MapPin size={13} />
          <span>eBird Hotspots</span>
        </button>

        {onToggleFilterBestNow && (
          <button
            onClick={onToggleFilterBestNow}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors text-[11px] md:text-xs ml-auto border ${
              filterBestNow
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900/90 text-amber-300/90 hover:bg-slate-800 border-amber-500/30'
            }`}
            title="Highlight species currently in their peak viewing window"
          >
            <Sparkles size={12} className={filterBestNow ? 'animate-spin' : 'text-amber-400'} />
            <span>Best Right Now</span>
          </button>
        )}
      </div>
    </header>
  );
};
