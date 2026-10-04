import { ChatMessage, ChatChannel } from '../types/chat';

export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [
  // Current Region Channels
  {
    id: 'portland',
    name: '#Portland-Metro',
    scopeType: 'current_region',
    description: 'Urban roosts, Chapman chimney swifts, Oaks Bottom, and Willamette flyways.',
    memberCount: 342,
    lat: 45.5152,
    lng: -122.6784,
  },
  {
    id: 'US-WA',
    name: '#Washington-State',
    scopeType: 'current_region',
    description: 'Puget Sound, Nisqually, Skagit snow geese, and Cascades field reports.',
    memberCount: 285,
    lat: 47.5000,
    lng: -120.5000,
  },
  {
    id: 'US-OR',
    name: '#Oregon-State',
    scopeType: 'current_region',
    description: 'Willamette Valley, coastal headlands, Cascades, and High Desert birding.',
    memberCount: 218,
    lat: 43.8041,
    lng: -120.5542,
  },
  {
    id: 'gps',
    name: '#GPS-Local-Radius',
    scopeType: 'current_region',
    description: 'Local birders within a 30-mile radius of your live coordinates.',
    memberCount: 54,
  },

  // Hotspot Meetup Channels
  {
    id: 'hotspot-ridgefield',
    name: '#Ridgefield-NWR-Meetups',
    scopeType: 'hotspot',
    description: 'River S Unit auto tour & Carty Unit trail walks for sandhill cranes and waterfowl.',
    memberCount: 165,
    lat: 45.8194,
    lng: -122.7661,
  },
  {
    id: 'hotspot-whitaker',
    name: '#Whitaker-Ponds-Meetups',
    scopeType: 'hotspot',
    description: 'East Columbia wetland walks, wood ducks, green herons, and warbler waves.',
    memberCount: 92,
    lat: 45.5780,
    lng: -122.6510,
  },
  {
    id: 'hotspot-sauvie',
    name: '#Sauvie-Island-Meetups',
    scopeType: 'hotspot',
    description: 'Raptor wintering grounds, snow geese, and Columbia River viewing blinds.',
    memberCount: 210,
    lat: 45.7120,
    lng: -122.7950,
  },

  // Nationwide Sightings Exchange
  {
    id: 'nationwide',
    name: '#US-Nationwide',
    scopeType: 'nationwide',
    description: 'National rare bird alerts, irruptive species alerts, and interstate migration tracking.',
    memberCount: 890,
    lat: 39.8283,
    lng: -98.5795,
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // Portland Metro
  {
    id: 'msg-pdx-1',
    handle: 'PeregrinePete',
    homeRegion: 'OR-Metro',
    channelId: 'portland',
    channelName: '#Portland-Metro',
    text: 'Twilight crow murmuration is starting to form over the Hawthorne Bridge early tonight! Seeing streams from SE Powell.',
    timestamp: Date.now() - 1000 * 60 * 42,
  },
  {
    id: 'msg-pdx-2',
    handle: 'CedarWaxwing99',
    homeRegion: 'OR-Metro',
    channelId: 'portland',
    channelName: '#Portland-Metro',
    text: 'Proposed meetup for anyone wanting to scan the south bluff and trails together tomorrow morning!',
    timestamp: Date.now() - 1000 * 60 * 25,
    meetup: {
      locationName: 'Oaks Bottom Wildlife Refuge - North Trailhead',
      dateTime: 'Saturday 8:00 AM',
      targetSpecies: 'Virginia Rail, Green Heron, Bald Eagle',
      lat: 45.4740,
      lng: -122.6460,
    },
  },
  {
    id: 'msg-pdx-3',
    handle: 'SwiftWatcher',
    homeRegion: 'OR-Metro',
    channelId: 'portland',
    channelName: '#Portland-Metro',
    text: 'Chapman elementary chimney has good staging flocks circling near dusk. Bring a thermos and lawn chairs!',
    timestamp: Date.now() - 1000 * 60 * 10,
  },

  // Washington State
  {
    id: 'msg-wa-1',
    handle: 'NisquallyBirder',
    homeRegion: 'US-WA',
    channelId: 'US-WA',
    channelName: '#Washington-State',
    text: 'High tide at Nisqually estuary boardwalk this afternoon brought in over a thousand Dunlin right up to the railing!',
    timestamp: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 'msg-wa-2',
    handle: 'SkagitHarrier',
    homeRegion: 'US-WA',
    channelId: 'US-WA',
    channelName: '#Washington-State',
    text: 'Snow goose flock on Fir Island is estimated at 8,500+. Let us do a dawn excursion before the fog burns off.',
    timestamp: Date.now() - 1000 * 60 * 30,
    meetup: {
      locationName: 'Skagit Wildlife Area - Fir Island Farm Reserve',
      dateTime: 'Sunday 7:30 AM',
      targetSpecies: 'Snow Goose, Short-eared Owl, Rough-legged Hawk',
      lat: 48.3582,
      lng: -122.4214,
    },
  },
  {
    id: 'msg-wa-3',
    handle: 'PugetSounder',
    homeRegion: 'US-WA',
    channelId: 'US-WA',
    channelName: '#Washington-State',
    text: 'Rhinoceros Auklets actively feeding along the rip tide line off West Point Lighthouse at Discovery Park right now.',
    timestamp: Date.now() - 1000 * 60 * 15,
  },

  // Oregon State
  {
    id: 'msg-or-1',
    handle: 'CascadeOsprey',
    homeRegion: 'US-OR',
    channelId: 'US-OR',
    channelName: '#Oregon-State',
    text: 'Sauvie Island crane congregation is peak right now on the viewing platforms. Over 600 counted this morning.',
    timestamp: Date.now() - 1000 * 60 * 65,
    meetup: {
      locationName: 'Sauvie Island Wildlife Area - Coon Point Viewing Platform',
      dateTime: 'Saturday 9:00 AM',
      targetSpecies: 'Sandhill Crane, Tundra Swan, Northern Pintail',
      lat: 45.7120,
      lng: -122.7950,
    },
  },

  // Hotspot: Ridgefield
  {
    id: 'msg-ridgefield-1',
    handle: 'CraneSpotter',
    homeRegion: 'US-WA',
    channelId: 'hotspot-ridgefield',
    channelName: '#Ridgefield-NWR-Meetups',
    text: 'Morning light on the River S unit auto tour is unbeatable. Meet at the entrance gate before 8 AM for the best waterfowl flights.',
    timestamp: Date.now() - 1000 * 60 * 50,
    meetup: {
      locationName: 'Ridgefield NWR - River S Unit Entrance',
      dateTime: 'Saturday 7:45 AM',
      targetSpecies: 'Sandhill Crane, American Bittern, Marsh Wren',
      lat: 45.8194,
      lng: -122.7661,
    },
  },

  // Nationwide
  {
    id: 'msg-us-1',
    handle: 'PelagicScout',
    homeRegion: 'US-Nationwide',
    channelId: 'nationwide',
    channelName: '#US-Nationwide',
    text: 'Rare California Condor tagged pairs sighted soaring along Pinnacles high peaks. Keep an eye out if you are visiting central CA!',
    timestamp: Date.now() - 1000 * 60 * 180,
  },
  {
    id: 'msg-us-2',
    handle: 'ArcticVagrant',
    homeRegion: 'US-Nationwide',
    channelId: 'nationwide',
    channelName: '#US-Nationwide',
    text: 'First early Snowy Owl of the season confirmed on Plum Island dunes, Massachusetts. Incredible sighting.',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
];
