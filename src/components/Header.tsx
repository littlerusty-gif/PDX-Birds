import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, TaxonomyItem } from '../types/bird';
import { PNW_TAXONOMY } from '../data/mockPortlandData';
import { Search, Compass, AlertTriangle, MapPin, Feather, Sparkles, Plus, X, List } from 'lucide-react';

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTaxonomy = searchTerm.trim().length >= 1
    ? PNW_TAXONOMY.filter(item =>
        item.comName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sciName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.speciesCode.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-slate-100 px-3 md:px-4 py-2 md:py-2.5 z-30 fixed md:relative top-0 inset-x-0 shadow-lg">
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
                  PDX eBird
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Portland Urban Flyway & Winter Crow Mega-Roosts
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
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

        {/* Fast Autocomplete Search Bar - Stacked over map on mobile */}
        <div className="relative flex-1 max-w-full md:max-w-md md:mx-4 w-full" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search species (e.g. Crow, Swift, Falcon, Eagle)..."
              className="w-full bg-slate-900/90 border border-slate-750 focus:border-emerald-500 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {(searchTerm || selectedSpecies) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  onSelectSpecies(null);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && filteredTaxonomy.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-750 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                Pacific Northwest Taxonomy Matches
              </div>
              {filteredTaxonomy.map((item) => (
                <button
                  key={item.speciesCode}
                  onClick={() => {
                    onSelectSpecies(item);
                    setSearchTerm(item.comName);
                    setIsDropdownOpen(false);
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

        {/* Header Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Report Roost</span>
          </button>

          <button
            onClick={onOpenAiWidget}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-purple-500/40 text-purple-300 font-semibold text-xs rounded-lg transition-colors"
          >
            <Sparkles size={15} className="text-purple-400" />
            <span>AI Staging Intel</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Filter Chips - Stacked over map */}
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
          <span>All Recent</span>
        </button>

        <button
          onClick={() => {
            if (!selectedSpecies) {
              const amecro = PNW_TAXONOMY[0];
              onSelectSpecies(amecro);
              setSearchTerm(amecro.comName);
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
          <span>Hotspots</span>
        </button>

        {onToggleFilterBestNow && (
          <button
            onClick={onToggleFilterBestNow}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold whitespace-nowrap transition-all text-[11px] md:text-xs ml-auto border ${
              filterBestNow
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/90 text-amber-300 hover:bg-slate-800 border-amber-500/40'
            }`}
            title="Filter species whose peak viewing window matches current local time"
          >
            <Sparkles size={13} className={filterBestNow ? 'fill-current animate-pulse' : ''} />
            <span>Best to View Right Now</span>
          </button>
        )}
      </div>
    </header>
  );
};

