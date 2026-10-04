import React, { useState } from 'react';
import { User, Check, X, Shield, MapPin } from 'lucide-react';
import { validateHandle } from '../utils/chatModeration';
import { US_STATES } from '../data/regions';

interface HandleModalProps {
  isOpen: boolean;
  currentHandle?: string;
  currentHomeRegion?: string;
  onSave: (handle: string, homeRegion: string) => void;
  onClose: () => void;
}

export const HandleModal: React.FC<HandleModalProps> = ({
  isOpen,
  currentHandle = '',
  currentHomeRegion = 'OR-Metro',
  onSave,
  onClose,
}) => {
  const [handle, setHandle] = useState(currentHandle);
  const [homeRegion, setHomeRegion] = useState(currentHomeRegion);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateHandle(handle);
    if (!result.valid) {
      setError(result.error || 'Invalid handle.');
      return;
    }

    onSave(handle.trim(), homeRegion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">
                Choose Your Field Handle
              </h3>
              <p className="text-[11px] text-slate-400">
                Your permanent identity on regional meetup boards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Field Handle <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono font-bold">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value.replace(/\s+/g, ''));
                  setError(null);
                }}
                placeholder="e.g. PeregrinePete, Osprey_99"
                maxLength={20}
                className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-2 text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              3–20 characters. Letters, numbers, and underscores only.
            </p>
            {error && <p className="text-red-400 text-[11px] mt-1 font-semibold">{error}</p>}
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Primary Home Region
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <MapPin size={13} />
              </span>
              <select
                value={homeRegion}
                onChange={(e) => setHomeRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-2 text-slate-100 text-xs focus:outline-none"
              >
                <option value="OR-Metro">OR-Metro (Portland / Willamette)</option>
                <option value="US-WA">US-WA (Washington State)</option>
                <option value="US-OR">US-OR (Oregon State)</option>
                <option value="US-CA">US-CA (California)</option>
                <option value="US-Nationwide">US-Nationwide (Roaming Birder)</option>
                <optgroup label="Other US States">
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} ({s.name})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Appears on your field badge: <strong>@{handle || 'handle'} [{homeRegion}]</strong>
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <Shield size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Saved securely to your browser storage. No password required for field postings.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Check size={14} />
              <span>Save Handle & Continue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
