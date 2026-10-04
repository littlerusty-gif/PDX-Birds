import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RegionConfig, Hotspot } from '../types/bird';
import { ChatMessage, ChatChannel, MeetupProposal } from '../types/chat';
import { INITIAL_CHAT_CHANNELS, INITIAL_CHAT_MESSAGES } from '../data/mockChatData';
import { sanitizeMessageText } from '../utils/chatModeration';
import {
  MessageSquare,
  Users,
  Send,
  Calendar,
  MapPin,
  Flag,
  VolumeX,
  Volume2,
  X,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Shield,
  Clock,
  Pin,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface FieldChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: RegionConfig;
  nearbyHotspots?: Hotspot[];
  onPinMeetupToMap: (meetup: MeetupProposal) => void;
  onRequestDisclaimer: () => boolean; // returns true if disclaimer is already agreed
  onRequestHandle: () => string | null; // returns current handle or prompts
  homeRegion: string;
}

const STORAGE_KEY_MESSAGES = 'thebirdbook_field_chat_messages_v1';
const STORAGE_KEY_MUTED = 'thebirdbook_muted_handles_v1';
const STORAGE_KEY_FLAGGED = 'thebirdbook_flagged_messages_v1';
const POST_COOLDOWN_MS = 4000;

export const FieldChatDrawer: React.FC<FieldChatDrawerProps> = ({
  isOpen,
  onClose,
  currentRegion,
  nearbyHotspots = [],
  onPinMeetupToMap,
  onRequestDisclaimer,
  onRequestHandle,
  homeRegion,
}) => {
  // Messages state persisted in localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_CHAT_MESSAGES;
  });

  // Muted handles set
  const [mutedHandles, setMutedHandles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MUTED);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Flagged messages set
  const [flaggedIds, setFlaggedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FLAGGED);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Active channel
  const [activeChannelId, setActiveChannelId] = useState<string>('portland');
  const [messageInput, setMessageInput] = useState<string>('');
  const [isProposingMeetup, setIsProposingMeetup] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [lastPostTime, setLastPostTime] = useState<number>(0);

  // Meetup snippet form fields
  const [meetupLocation, setMeetupLocation] = useState<string>('');
  const [meetupDateTime, setMeetupDateTime] = useState<string>('');
  const [meetupSpecies, setMeetupSpecies] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize channel directly when top-bar map region changes
  useEffect(() => {
    const regCode = (currentRegion.regionCode || '').toUpperCase();
    if (regCode === 'US-WA' || currentRegion.id === 'state-us-wa') {
      setActiveChannelId('US-WA');
    } else if (regCode === 'US-OR' || currentRegion.id === 'state-us-or') {
      setActiveChannelId('US-OR');
    } else if (currentRegion.category === 'gps') {
      setActiveChannelId('gps');
    } else if (currentRegion.category === 'nationwide' || regCode === 'US') {
      setActiveChannelId('nationwide');
    } else {
      setActiveChannelId('portland');
    }
  }, [currentRegion]);

  // Persist messages to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Persist muted handles
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(mutedHandles));
    } catch {}
  }, [mutedHandles]);

  // Persist flagged ids
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FLAGGED, JSON.stringify(flaggedIds));
    } catch {}
  }, [flaggedIds]);

  // Rate-limit cooldown timer countdown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Scroll to bottom on new message or channel change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChannelId, isOpen]);

  // Dynamic channels list including real nearby eBird hotspots
  const channels = useMemo(() => {
    const list: ChatChannel[] = [...INITIAL_CHAT_CHANNELS];

    if (nearbyHotspots && nearbyHotspots.length > 0) {
      nearbyHotspots.slice(0, 4).forEach((h) => {
        const id = `hotspot-${h.locId}`;
        if (!list.some((c) => c.id === id)) {
          list.push({
            id,
            name: `#${h.locName.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 22)}-Meetups`,
            scopeType: 'hotspot',
            description: `Field walks and group sightings at ${h.locName}.`,
            memberCount: Math.floor(Math.random() * 60) + 20,
            lat: h.lat,
            lng: h.lng,
          });
        }
      });
    }

    return list;
  }, [nearbyHotspots]);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || channels[0];
  }, [channels, activeChannelId]);

  // Filter messages for current channel, excluding muted users
  const visibleMessages = useMemo(() => {
    return messages.filter((m) => {
      if (m.channelId !== activeChannelId) return false;
      if (mutedHandles.includes(m.handle.toLowerCase())) return false;
      return true;
    });
  }, [messages, activeChannelId, mutedHandles]);

  // Handle post message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Legal disclaimer check
    const isDisclaimerAgreed = onRequestDisclaimer();
    if (!isDisclaimerAgreed) return;

    // 2. Handle check
    const handle = onRequestHandle();
    if (!handle) return;

    // 3. Anti-spam 4-second rate limit
    const now = Date.now();
    const elapsed = now - lastPostTime;
    if (elapsed < POST_COOLDOWN_MS) {
      const waitSec = Math.ceil((POST_COOLDOWN_MS - elapsed) / 1000);
      setCooldownRemaining(waitSec);
      return;
    }

    const trimmed = messageInput.trim();
    if (!trimmed && !isProposingMeetup) return;

    // 4. Text & link sanitization
    const { sanitized } = sanitizeMessageText(trimmed);

    // 5. Build meetup proposal if attached
    let proposal: MeetupProposal | undefined = undefined;
    if (isProposingMeetup && meetupLocation.trim()) {
      proposal = {
        locationName: sanitizeMessageText(meetupLocation.trim()).sanitized,
        dateTime: sanitizeMessageText(meetupDateTime.trim() || 'Upcoming Weekend').sanitized,
        targetSpecies: sanitizeMessageText(meetupSpecies.trim() || 'Regional Waterfowl & Songbirds').sanitized,
        lat: activeChannel.lat || currentRegion.center[0],
        lng: activeChannel.lng || currentRegion.center[1],
      };
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      handle,
      homeRegion: homeRegion || 'OR-Metro',
      channelId: activeChannel.id,
      channelName: activeChannel.name,
      text: sanitized,
      timestamp: now,
      meetup: proposal,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
    setLastPostTime(now);
    setCooldownRemaining(4);

    // Reset meetup fields
    if (isProposingMeetup) {
      setIsProposingMeetup(false);
      setMeetupLocation('');
      setMeetupDateTime('');
      setMeetupSpecies('');
    }
  };

  // Flag/Report Message
  const handleFlagMessage = (id: string) => {
    setFlaggedIds((prev) => [...prev, id]);
    alert('Thank you. This message has been flagged for community safety review.');
  };

  // Mute / Block Handle
  const handleMuteHandle = (handleToMute: string) => {
    const lower = handleToMute.toLowerCase();
    if (confirm(`Block @${handleToMute}? You will no longer see messages from this handle on your feed.`)) {
      setMutedHandles((prev) => [...prev, lower]);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 md:w-[420px] bg-slate-950/95 backdrop-blur-md border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-100">Regional Field Chat</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400">Live birding coordination & meetups</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          title="Close Field Chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Channel Switcher Dropdown */}
      <div className="p-2.5 bg-slate-900/60 border-b border-slate-800">
        <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
          Active Chat Channel:
        </label>
        <div className="relative">
          <select
            value={activeChannelId}
            onChange={(e) => setActiveChannelId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-750 hover:border-slate-600 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none appearance-none pr-8 cursor-pointer shadow-sm"
          >
            <optgroup label="Current Region Meetups (Matches Active View)">
              {channels
                .filter((c) => c.scopeType === 'current_region')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.memberCount} birders)
                  </option>
                ))}
            </optgroup>
            <optgroup label="Local Hotspot Meetups (eBird Hotspots)">
              {channels
                .filter((c) => c.scopeType === 'hotspot')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Nationwide Sightings Exchange">
              {channels
                .filter((c) => c.scopeType === 'nationwide')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
        </div>
        <div className="text-[10px] text-slate-400 mt-1 truncate">{activeChannel.description}</div>
      </div>

      {/* Muted count banner (if any) */}
      {mutedHandles.length > 0 && (
        <div className="px-3 py-1 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>{mutedHandles.length} handle(s) muted locally</span>
          <button
            onClick={() => setMutedHandles([])}
            className="text-emerald-400 hover:underline"
          >
            Unmute All
          </button>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {visibleMessages.map((msg) => {
          const isFlagged = flaggedIds.includes(msg.id);
          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                msg.meetup
                  ? 'bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
              }`}
            >
              {/* Message Header: Handle badge + region tag + time */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-100 font-mono">@{msg.handle}</span>
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    [{msg.homeRegion}]
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>{timeStr}</span>
                  {/* Flag button */}
                  <button
                    onClick={() => handleFlagMessage(msg.id)}
                    className={`p-1 rounded hover:bg-slate-800 ${
                      isFlagged ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Report message"
                  >
                    <Flag size={11} />
                  </button>
                  {/* Mute handle button */}
                  <button
                    onClick={() => handleMuteHandle(msg.handle)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                    title={`Mute @${msg.handle}`}
                  >
                    <VolumeX size={11} />
                  </button>
                </div>
              </div>

              {/* Message Text */}
              {msg.text && (
                <p className="text-slate-200 leading-relaxed break-words mb-2">{msg.text}</p>
              )}

              {/* Styled Meetup Alert Card */}
              {msg.meetup && (
                <div className="mt-2 p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Sparkles size={11} />
                      <span>Meetup Proposal</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                      Open Coordination
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-start gap-1.5 text-slate-200 font-semibold">
                      <MapPin size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{msg.meetup.locationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar size={13} className="text-sky-400 shrink-0" />
                      <span>{msg.meetup.dateTime}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-amber-300">
                      <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>Targets: {msg.meetup.targetSpecies}</span>
                    </div>
                  </div>

                  {/* Pin to Map Action */}
                  <button
                    onClick={() => onPinMeetupToMap(msg.meetup!)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <Pin size={12} />
                    <span>Pin Meetup to Map</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {visibleMessages.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            <MessageSquare size={24} className="mx-auto mb-2 text-slate-600" />
            <p>No messages yet in {activeChannel.name}.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Be the first to share an excursion or local birding alert!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Propose Meetup Form Drawer (Expandable) */}
      {isProposingMeetup && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Propose Field Meetup</span>
            </span>
            <button
              onClick={() => setIsProposingMeetup(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-0.5">
              Public Location Name (Parks & Refuges only):
            </label>
            <input
              type="text"
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              placeholder="e.g. Oaks Bottom Trailhead, Nisqually Boardwalk"
              className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Date & Time:</label>
              <input
                type="text"
                value={meetupDateTime}
                onChange={(e) => setMeetupDateTime(e.target.value)}
                placeholder="e.g. Saturday 8:00 AM"
                className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Target Species:</label>
              <input
                type="text"
                value={meetupSpecies}
                onChange={(e) => setMeetupSpecies(e.target.value)}
                placeholder="e.g. Sandhill Cranes, Swifts"
                className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Composer Section */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between mb-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => setIsProposingMeetup(!isProposingMeetup)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
              isProposingMeetup
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <Calendar size={12} />
            <span>{isProposingMeetup ? 'Cancel Meetup Card' : 'Propose Meetup'}</span>
          </button>

          {cooldownRemaining > 0 && (
            <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1">
              <Clock size={11} />
              <span>Cooldown: {cooldownRemaining}s</span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={
              isProposingMeetup
                ? 'Add optional notes for your meetup...'
                : `Message ${activeChannel.name}...`
            }
            className="flex-1 bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={
              cooldownRemaining > 0 ||
              (!messageInput.trim() && (!isProposingMeetup || !meetupLocation.trim()))
            }
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
            title="Send Message"
          >
            <Send size={15} />
          </button>
        </div>

        <div className="text-[10px] text-slate-500 mt-1.5 flex items-center justify-between">
          <span>Anti-spam active (1 post / 4s). Daylight public parks only.</span>
        </div>
      </form>
    </aside>
  );
};
