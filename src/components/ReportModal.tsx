import React, { useState } from 'react';
import { X, Navigation, Send, Feather, Compass, MapPin } from 'lucide-react';
import { CrowRoostReport } from '../types/bird';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<CrowRoostReport, 'id' | 'timestamp'>) => void;
}

const ORIGIN_PRESETS = [
  'East Multnomah / Lloyd Staging',
  'Southeast / Powell Corridor (Mt. Tabor)',
  'Oaks Bottom / Sellwood River Flyway',
  'Swan Island / North Willamette Flyway',
  'Forest Park / West Hills Ridge',
  'Gresham / Outer Eastside Staging',
  'Custom Origin',
];

const HEADING_PRESETS = [
  { label: 'SW', deg: 225, desc: 'Toward Downtown Core' },
  { label: 'W', deg: 270, desc: 'River Crossing' },
  { label: 'NW', deg: 315, desc: 'From SE / Powell' },
  { label: 'S', deg: 180, desc: 'Southbound River Flyway' },
  { label: 'N', deg: 0, desc: 'Northbound River Flyway' },
  { label: 'SE', deg: 135, desc: 'Eastside Staging' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [species, setSpecies] = useState('American Crow');
  const [count, setCount] = useState('500');
  const [locationName, setLocationName] = useState('');
  const [originStagingArea, setOriginStagingArea] = useState('East Multnomah / Lloyd Staging');
  const [customOrigin, setCustomOrigin] = useState('');
  const [flightHeadingDeg, setFlightHeadingDeg] = useState<number>(225);
  const [direction, setDirection] = useState('SW toward Downtown Core');
  const [behavior, setBehavior] = useState('Mega-Roost');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleHeadingSelect = (deg: number, desc: string, label: string) => {
    setFlightHeadingDeg(deg);
    setDirection(`${label} (${deg}°) ${desc}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !count) return;

    const resolvedOrigin = originStagingArea === 'Custom Origin' && customOrigin.trim()
      ? customOrigin.trim()
      : originStagingArea;

    onSubmit({
      species,
      count: parseInt(count, 10) || 50,
      locationName: locationName.trim(),
      lat: 45.5152 + (Math.random() - 0.5) * 0.03,
      lng: -122.6784 + (Math.random() - 0.5) * 0.03,
      direction: direction || `Heading ${flightHeadingDeg}°`,
      behavior,
      notes: notes.trim(),
      originStagingArea: resolvedOrigin,
      flightHeadingDeg,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Feather size={17} />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">Report Roost & Flight Vector</h2>
              <p className="text-[11px] text-slate-400">Map inbound flock trajectories into Portland roosts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Target Species</label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              placeholder="e.g. American Crow, Vaux's Swift"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Estimated Flock Size</label>
              <input
                type="number"
                min="1"
                max="50000"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
                placeholder="500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Behavior Mode</label>
              <select
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              >
                <option value="Mega-Roost">Mega-Roost (&gt;250 birds)</option>
                <option value="Staging Flocks">Staging Flocks (Rooftops / Trees)</option>
                <option value="River Corridor Stream">River Corridor Flight Stream</option>
                <option value="Ground Foraging">Ground Foraging</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-emerald-400" />
              <span>Sighting Destination Pin Location</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              placeholder="e.g. South Park Blocks, Hawthorne Bridge, Tom McCall Waterfront"
              required
            />
          </div>

          {/* Origin Staging Area Input */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <label className="block text-sky-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={13} />
              <span>Origin Staging Area (Where They Came From)</span>
            </label>
            <select
              value={originStagingArea}
              onChange={(e) => setOriginStagingArea(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none text-xs"
            >
              {ORIGIN_PRESETS.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>

            {originStagingArea === 'Custom Origin' && (
              <input
                type="text"
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none text-xs"
                placeholder="Specify staging neighborhood, park, or roof zone..."
                required
              />
            )}
          </div>

          {/* Flight Heading (Degrees/Cardinal) Input */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={13} />
                <span>Flight Heading (Degrees / Cardinal)</span>
              </label>
              <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded">
                {flightHeadingDeg}° Heading
              </span>
            </div>

            {/* Quick Cardinal Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {HEADING_PRESETS.map((p) => {
                const isActive = Math.abs(flightHeadingDeg - p.deg) < 15;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleHeadingSelect(p.deg, p.desc, p.label)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-left flex items-center justify-between border ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">{p.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{p.deg}°</span>
                  </button>
                );
              })}
            </div>

            {/* Degree Slider with Dynamic Compass Arrow */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="0"
                max="359"
                value={flightHeadingDeg}
                onChange={(e) => {
                  const deg = parseInt(e.target.value, 10);
                  setFlightHeadingDeg(deg);
                  setDirection(`Heading ${deg}° inbound`);
                }}
                className="flex-1 accent-amber-500"
              />
              <div
                style={{ transform: `rotate(${flightHeadingDeg}deg)` }}
                className="w-7 h-7 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400 transition-transform shadow"
                title={`Heading: ${flightHeadingDeg}°`}
              >
                ▲
              </div>
            </div>
            <div className="text-[10px] text-slate-400 italic">
              A back-traced animated trajectory line will be drawn pointing toward your sighting pin.
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Field Notes & Perch Details</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              placeholder="e.g. Birds perching in tall Dutch elms, heavy calling at dusk, moving low over river."
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Send size={13} />
              <span>Publish Roost Vector & Trajectory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
