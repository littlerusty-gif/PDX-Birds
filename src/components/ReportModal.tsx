import React, { useState } from 'react';
import { X, Navigation, Send, Feather } from 'lucide-react';
import { CrowRoostReport } from '../types/bird';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<CrowRoostReport, 'id' | 'timestamp'>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [species, setSpecies] = useState('American Crow');
  const [count, setCount] = useState('500');
  const [locationName, setLocationName] = useState('');
  const [direction, setDirection] = useState('SW toward Downtown');
  const [behavior, setBehavior] = useState('Mega-Roost');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !count) return;

    onSubmit({
      species,
      count: parseInt(count, 10) || 50,
      locationName: locationName.trim(),
      lat: 45.5152 + (Math.random() - 0.5) * 0.03,
      lng: -122.6784 + (Math.random() - 0.5) * 0.03,
      direction,
      behavior,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Feather size={16} />
            </div>
            <h2 className="font-bold text-sm tracking-tight">Community Crow Roost Spotter</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
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
              <label className="block text-slate-400 font-semibold mb-1">Estimated Count</label>
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
                <option value="Staging on Rooftops/Trees">Staging Flocks</option>
                <option value="High Flight Stream">River Corridor Stream</option>
                <option value="Ground Foraging">Ground Foraging</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Portland Location</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              placeholder="e.g. South Park Blocks, Hawthorne Bridge, Lloyd Center"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Navigation size={12} className="text-sky-400" />
              <span>Flight Transit Direction (Toward Downtown)</span>
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
            >
              <option value="SW toward Downtown">SW toward Downtown Core</option>
              <option value="West across Willamette">West across Willamette River</option>
              <option value="East toward Eastside Staging">East toward Eastside Staging</option>
              <option value="Circling Roost Canopy">Circling Roost Canopy</option>
              <option value="Settled Roosting">Settled Roosting</option>
              <option value="Northbound River Corridor">Northbound River Corridor</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Field Notes & Tree Perches</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
              placeholder="e.g. Birds perching in tall Dutch elms along SW Salmon, heavy calling at dusk."
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
              <span>Publish Roost Vector</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
