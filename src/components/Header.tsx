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
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const [stateSearchText, setStateSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const regionMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (regionMenuRef.current && !regionMenuRef.current.contains(event.target as Node)) {
        setIsRegionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered US States for dropdown
  const filteredStates = useMemo(() => {
    const q = stateSearchText.toLowerCase().trim();
    if (!q) return US_STATES;
    return US_STATES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [stateSearchText]);

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
    if (region.category === 'regional') return <Compass size={14} className="text-teal-400" />;
    if (region.category === 'state') return <MapPin size={14} className="text-amber-400" />;
    return <Globe size={14} className="text-purple-400" />;
  };

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 px-3 md:px-4 py-2 md:py-2.5 z-30 fixed md:relative top-0 inset-x-0 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Title & Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Birdbook Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-md rounded-full bg-slate-900 border border-slate-750"
            />
            <div>
              <h1 className="font-extrabold text-sm md:text-lg tracking-tight flex items-center gap-1.5 md:gap-2">
                <span>Birdbook</span>
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-1.5 md:px-2 py-0.5 rounded border border-emerald-500/20">
                  USA eBird 2.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Nationwide Birding, Urban Flyways & Roost Tracker
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className="p-1.5 rounded-lg bg-sky-600/90 text-white border border-sky-500 active:scale-95"
              title="Use GPS Location"
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
              onClick={onOpenAiWidget}
              className="p-1.5 rounded-lg bg-purple-600 text-white"
              title="AI Roost Summary"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        {/* Center: Region Selector & Nationwide Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 md:max-w-2xl md:mx-3">
          
          {/* 1. Location / Region Selector Dropdown */}
          <div className="relative" ref={regionMenuRef}>
            <button
              onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-colors shadow-sm"
              title="Switch Region or State"
            >
              <span className="flex items-center gap-1.5 truncate max-w-[190px]">
                {getRegionIcon(currentRegion)}
                <span className="truncate">{currentRegion.name}</span>
              </span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Region Dropdown Menu */}
            {isRegionMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-80 max-w-[92vw] bg-slate-900 border border-slate-750 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-slate-800 bg-slate-950/70">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Coverage Scope
                  </div>
                  <div className="space-y-1">
                    {PRIMARY_REGIONS.map((reg) => (
                      <button
                        key={reg.id}
                        onClick={() => {
                          if (reg.category === 'gps') {
                            onLocateMe();
                          } else {
                            onSelectRegion(reg);
                          }
                          setIsRegionMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentRegion.id === reg.id
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {getRegionIcon(reg)}
                          <span>{reg.name}</span>
                        </span>
                        {reg.category === 'gps' && isLocating && (
                          <span className="text-[10px] text-sky-400 animate-pulse">Locating...</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Search Section */}
                <div className="p-2.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>US State Search</span>
                    <span className="text-[10px] text-slate-400">50 States + DC</span>
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
                    <input
                      type="text"
                      value={stateSearchText}
                      onChange={(e) => setStateSearchText(e.target.value)}
                      placeholder="Type state (e.g. CA, NY, TX, Florida)..."
                      className="w-full bg-slate-950 border border-slate-750 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                    {filteredStates.map((st) => (
                      <button
                        key={st.code}
                        onClick={() => {
                          const stateRegion: RegionConfig = {
                            id: `state-${st.code.toLowerCase()}`,
                            name: `${st.name} (${st.code})`,
                            category: 'state',
                            regionCode: st.code,
                            center: st.center,
                            zoom: st.zoom,
                            description: `Live observations from ${st.name}.`,
                            endpoint: `data/obs/${st.code}/recent?back=7`,
                          };
                          onSelectRegion(stateRegion);
                          setIsRegionMenuOpen(false);
                          setStateSearchText('');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          currentRegion.regionCode === st.code
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <span>{st.name}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {st.code}
                        </span>
                      </button>
                    ))}
                    {filteredStates.length === 0 && (
                      <div className="text-center py-3 text-xs text-slate-400">No states match search</div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
            title="Center on my GPS coordinates (30-mile radius)"
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
            onClick={onOpenAiWidget}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-purple-500/40 text-purple-300 font-semibold text-xs rounded-lg transition-colors"
          >
            <Sparkles size={15} className="text-purple-400" />
            <span>AI Intel</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Filter Chips */}
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 text-xs no-scrollbar">
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

        {/* Quick Filter: Best to View Right Now */}
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
