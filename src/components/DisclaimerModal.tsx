import React from 'react';
import { ShieldAlert, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAgree, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 to-slate-900 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Community Safety Agreement
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
              Field Meetup & Outdoor Excursion Disclaimer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Disclaimer Text */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-200 font-semibold text-[11px] leading-relaxed">
            The Bird Book is an open coordination board and does not organize, sponsor, supervise,
            or vet in-person gatherings or trail excursions. Any birding excursion or in-person meetup is
            undertaken <span className="underline font-bold uppercase">ENTIRELY AT YOUR OWN RISK</span>.
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-200 text-xs">You agree to:</div>
            <ul className="space-y-2 text-slate-300 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>
                  <strong>Meet exclusively in daylight</strong> at recognized public parks, nature reserves, or wildlife refuges.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>
                  <strong>Never share private residential addresses</strong>, personal phone numbers, or financial details.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>
                  <strong>Exercise standard outdoor safety</strong>, trail awareness, wildlife distance protocols, and personal judgment.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            By clicking <strong className="text-slate-200">"I Agree & Enter Chat"</strong>, you explicitly
            release and hold harmless The Bird Book and its operators from any claims, disputes, injuries,
            damages, or liabilities arising from online communications or offline meetups.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAgree}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <CheckCircle size={14} />
            <span>I Agree & Enter Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
