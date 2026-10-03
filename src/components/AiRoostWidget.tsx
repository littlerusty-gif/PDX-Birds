import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, RefreshCw } from 'lucide-react';

interface AiRoostWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export const AiRoostWidget: React.FC<AiRoostWidgetProps> = ({ isOpen, onClose, initialQuestion }) => {
  const [question, setQuestion] = useState(initialQuestion || '');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (initialQuestion && isOpen) {
      setQuestion(initialQuestion);
      handleAsk(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    "🦅 When do crows settle at South Park Blocks tonight?",
    "🌉 Best bridge to watch Willamette crow flyovers?",
    "📷 Camera settings for Chapman School swifts?",
    "🌲 Where are the Barred Owls in Forest Park?"
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2 text-purple-400">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">AI Roost Intelligence</h3>
            <p className="text-[10px] text-purple-300">Gemini Pacific Flyway & Roost Specialist</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X size={18} />
        </button>
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/40">
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
              className="text-left text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2 rounded-lg text-slate-300 hover:text-purple-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Response Display Box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <RefreshCw className="animate-spin text-purple-400" size={24} />
            <span>Analyzing flock telemetry & dusk lighting...</span>
          </div>
        )}

        {!isLoading && summary && (
          <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3.5 shadow-inner">
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
            Tap a query above or enter a question to generate flight staging intelligence for Portland.
          </div>
        )}
      </div>

      {/* Input */}
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
            placeholder="Ask about roost times, vantage points..."
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
  );
};
