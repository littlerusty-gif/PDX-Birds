import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  RefreshCw,
  Clock,
  Wind,
  CloudSun,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Compass,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { Observation } from '../types/bird';
import {
  SPECIES_FORECASTS,
  isSpeciesOptimalNow,
  assessViewingConditions,
  SpeciesForecast,
} from '../data/viewingForecast';

interface AiRoostWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  observations: Observation[];
  filterBestNow: boolean;
  onToggleFilterBestNow: () => void;
}

export const AiRoostWidget: React.FC<AiRoostWidgetProps> = ({
  isOpen,
  onClose,
  initialQuestion,
  observations,
  filterBestNow,
  onToggleFilterBestNow,
}) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'ask'>('forecast');
  const [question, setQuestion] = useState(initialQuestion || '');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Weather condition toggles to test Gorge wind & rain heuristics
  const [windMode, setWindMode] = useState<'calm' | 'gorge_east'>('calm');
  const [cloudMode, setCloudMode] = useState<'clear' | 'overcast'>('clear');

  const now = useMemo(() => new Date(), []);
  const currentTimeString = useMemo(() => {
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [now]);

  // Extract unique species from active feed
  const activeSpeciesList = useMemo(() => {
    const map = new Map<string, { count: number; name: string; sci: string }>();
    observations.forEach((obs) => {
      const code = obs.speciesCode.toLowerCase();
      const existing = map.get(code) || { count: 0, name: obs.comName, sci: obs.sciName };
      existing.count += obs.howMany || 1;
      map.set(code, existing);
    });

    const list: {
      code: string;
      name: string;
      sci: string;
      totalCount: number;
      forecast: SpeciesForecast;
      isNow: boolean;
    }[] = [];

    map.forEach((val, code) => {
      const forecast = SPECIES_FORECASTS[code] || {
        speciesCode: code,
        comName: val.name,
        category: 'songbird',
        optimalWindowBadge: 'Daytime (8:00 AM - 5:00 PM)',
        startHour: 8,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
        viewingTip: 'Active feeding in urban tree canopy and riverbanks.',
        bestLocations: ['Portland Metro Parks'],
      };
      const isNow = isSpeciesOptimalNow(code, now);
      list.push({
        code,
        name: val.name,
        sci: val.sci,
        totalCount: val.count,
        forecast,
        isNow,
      });
    });

    // Sort by currently active first
    return list.sort((a, b) => (b.isNow ? 1 : 0) - (a.isNow ? 1 : 0));
  }, [observations, now]);

  // Count active species right now
  const activeNowCount = activeSpeciesList.filter((s) => s.isNow).length;

  // Evaluate conditions rating
  const conditions = useMemo(() => {
    return assessViewingConditions('general', windMode, cloudMode, now);
  }, [windMode, cloudMode, now]);

  React.useEffect(() => {
    if (initialQuestion && isOpen) {
      setQuestion(initialQuestion);
      handleAsk(initialQuestion);
      setActiveTab('ask');
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    '🦅 What time do crows cross the Hawthorne Bridge tonight?',
    '💨 How do Columbia Gorge East winds affect downtown crow flyways?',
    '📍 When will the Vaux’s Swifts enter Chapman School chimney?',
    '📷 What are the best sunset viewing locations in South Park Blocks?',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/roost-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setSummary(data.summary || 'No summary returned.');
    } catch (err: any) {
      setSummary('Failed to contact Gemini AI Roost Intelligence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right text-slate-100">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2 text-purple-400">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 tracking-tight">AI Staging & Viewing Intel</h3>
            <p className="text-[10px] text-purple-300">Portland Flyway Dynamics & Optimal Viewing Forecast</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Tabs (Forecast vs Ask AI) */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'forecast'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye size={13} />
            <span>Viewing Forecast</span>
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeTab === 'ask'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot size={13} />
            <span>Ask Gemini AI</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: OPTIMAL VIEWING FORECAST ===================== */}
      {activeTab === 'forecast' && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
          {/* Live Conditions Assessment Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock size={12} className="text-emerald-400" />
                <span>Live Conditions Rating ({currentTimeString})</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${conditions.badgeBg}`}>
                {conditions.rating} ({conditions.score}/100)
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed mb-2.5">
              {conditions.summary}
            </p>

            {/* Environmental breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-xl border border-slate-850 mb-3">
              <div>
                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                  <CloudSun size={11} className="text-amber-400" /> Light Contrast
                </div>
                <div className="font-semibold text-slate-200 mt-0.5 truncate">{conditions.lightLevel}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Wind size={11} className="text-sky-400" /> Wind Turbulence
                </div>
                <div className="font-semibold text-slate-200 mt-0.5 truncate">
                  {windMode === 'calm' ? 'Calm West 6 mph' : 'East Gorge >12 mph'}
                </div>
              </div>
            </div>

            {/* Weather & Wind Condition Simulator Toggles */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Wind Scenario:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWindMode('calm')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      windMode === 'calm'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Calm / West (6 mph)
                  </button>
                  <button
                    onClick={() => setWindMode('gorge_east')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      windMode === 'gorge_east'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    East Gorge (&gt;12 mph)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Sky / Weather:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCloudMode('clear')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      cloudMode === 'clear'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Clear Skies
                  </button>
                  <button
                    onClick={() => setCloudMode('overcast')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      cloudMode === 'overcast'
                        ? 'bg-purple-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Cloudy / Rain
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== CORRIDOR INFLUX WARNINGS ===================== */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass size={12} className="text-sky-400" />
              <span>Corridor Influx Warnings & Advisories</span>
            </div>

            {/* Crow Gorge Wind Warning */}
            <div className={`p-3 rounded-xl border transition-all ${
              windMode === 'gorge_east'
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-200'
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className={windMode === 'gorge_east' ? 'text-amber-400' : 'text-sky-400'} />
                <h4 className="font-bold text-slate-100 text-xs">
                  Crow River Corridor Influx: {windMode === 'gorge_east' ? 'Strong East Wind Warning' : 'Calm River Flyways'}
                </h4>
              </div>
              <p className="text-[11px] leading-relaxed">
                {windMode === 'gorge_east'
                  ? 'Strong East wind (>12 mph): Low street-canyon flyways (Belmont/Hawthorne corridors). Crows hug urban facades and drop low to avoid bridge wind shear.'
                  : 'Calm/West wind: High-altitude bridge crossings (Hawthorne/Morrison). Thousands cross open Willamette air corridors at 200–300 ft before dropping into elms.'}
              </p>
            </div>

            {/* Chapman Swift Early Funnel Advisory */}
            <div className={`p-3 rounded-xl border transition-all ${
              cloudMode === 'overcast'
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Wind size={14} className={cloudMode === 'overcast' ? 'text-purple-400' : 'text-emerald-400'} />
                <h4 className="font-bold text-slate-100 text-xs">
                  Chapman Swifts: {cloudMode === 'overcast' ? 'Early Funnel Advisory' : 'Standard Sunset Schedule'}
                </h4>
              </div>
              <p className="text-[11px] leading-relaxed">
                {cloudMode === 'overcast'
                  ? 'Early Funnel Advisory: Heavy cloud cover and rain suppress evening insect swarms. Swifts funnel into the Chapman chimney 25–45 min ahead of schedule (~5:45 PM).'
                  : 'Normal schedule: Funnel vortex builds ~20 min before sunset (~6:25 PM), peaking with thousands of birds diving into the brick chimney.'}
              </p>
            </div>
          </div>

          {/* ===================== QUICK FILTER: BEST TO VIEW RIGHT NOW ===================== */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <Sparkles size={14} />
                <span>Best to View Right Now ({currentTimeString})</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {activeNowCount} species currently in peak viewing window
              </p>
            </div>

            <button
              onClick={onToggleFilterBestNow}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow ${
                filterBestNow
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
              }`}
            >
              <Filter size={12} />
              <span>{filterBestNow ? 'Filter Active' : 'Filter Feed'}</span>
            </button>
          </div>

          {/* ===================== SPECIES OPTIMAL WINDOW BADGES ===================== */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Active Feed Species Optimal Windows:</span>
              <span className="font-mono text-emerald-400 font-bold">{activeSpeciesList.length} Species</span>
            </div>

            {activeSpeciesList.map((item) => (
              <div
                key={item.code}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  item.isNow
                    ? 'bg-slate-900/95 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.isNow && (
                        <span className="bg-emerald-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                          PEAK NOW
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] italic text-slate-400">{item.sci}</p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {item.totalCount.toLocaleString()} birds
                  </span>
                </div>

                {/* Optimal Window Badge */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Optimal Window:</span>
                  <span className="bg-amber-950/70 border border-amber-800/50 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px]">
                    {item.forecast.optimalWindowBadge}
                  </span>
                </div>

                {/* Tip */}
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  {item.forecast.viewingTip}
                </p>

                {/* Locations */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-wrap pt-1 border-t border-slate-800">
                  <MapPin size={11} className="text-emerald-400 flex-shrink-0" />
                  <span>Best Spots: {item.forecast.bestLocations.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: ASK GEMINI AI ===================== */}
      {activeTab === 'ask' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Suggested Prompts */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Staging & Photography Queries:
            </div>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(prompt);
                    handleAsk(prompt);
                  }}
                  className="text-left text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2 rounded-lg text-slate-300 hover:text-purple-300 transition-colors flex items-center justify-between"
                >
                  <span>{prompt}</span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Response Display Box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <RefreshCw className="animate-spin text-purple-400" size={24} />
                <span>Analyzing roost timings and microclimate wind vectors...</span>
              </div>
            )}

            {!isLoading && summary && (
              <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-3.5 shadow-inner">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-2 pb-1 border-b border-slate-800">
                  <Bot size={14} />
                  <span>Portland Roost Field Brief</span>
                </div>
                <div className="text-slate-200 leading-relaxed whitespace-pre-line text-xs font-sans">
                  {summary}
                </div>
              </div>
            )}

            {!isLoading && !summary && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tap a suggested query above or type a custom question to generate flight staging intelligence for Portland.
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about dusk flight times, bridge vantage points..."
                className="flex-1 bg-slate-950 border border-slate-750 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
