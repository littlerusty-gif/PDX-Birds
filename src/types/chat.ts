export interface MeetupProposal {
  locationName: string;
  dateTime: string;
  targetSpecies: string;
  lat?: number;
  lng?: number;
}

export interface ChatMessage {
  id: string;
  handle: string;
  homeRegion: string;
  channelId: string; // e.g. "portland", "US-WA", "US-OR", "nationwide", or hotspot locId
  channelName: string;
  text: string;
  timestamp: number;
  meetup?: MeetupProposal;
  isFlagged?: boolean;
}

export type ChannelScopeType = 'current_region' | 'hotspot' | 'nationwide';

export interface ChatChannel {
  id: string;
  name: string;
  scopeType: ChannelScopeType;
  description: string;
  memberCount?: number;
  lat?: number;
  lng?: number;
}
