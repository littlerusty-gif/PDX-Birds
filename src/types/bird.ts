export interface Observation {
  id: string;
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany: number;
  lat: number;
  lng: number;
  obsReviewed: boolean;
  subId: string;
  direction?: string;
  isCrowRoost?: boolean;
  notes?: string;
  originStagingArea?: string;
  flightHeadingDeg?: number;
  trajectoryCoords?: [number, number][];
}

export interface Hotspot {
  locId: string;
  locName: string;
  lat: number;
  lng: number;
  numSpeciesAllTime: number;
  latestObsDt?: string;
}

export interface TaxonomyItem {
  comName: string;
  sciName: string;
  speciesCode: string;
  category?: string;
  familyComName?: string;
}

export interface CrowRoostReport {
  id: string;
  species: string;
  count: number;
  locationName: string;
  lat: number;
  lng: number;
  direction: string;
  behavior: string;
  notes: string;
  timestamp: number;
  originStagingArea?: string;
  flightHeadingDeg?: number;
}

export interface FlightCorridor {
  id: string;
  name: string;
  corridorName: string;
  timeWindow: string;
  heading: string;
  headingDeg: number;
  estFlockSize: number;
  description: string;
  coordinates: [number, number][];
  color: string;
}

export type ViewMode = 'species' | 'recent' | 'notable' | 'hotspots' | 'routes';

export type RegionCategory = 'gps' | 'metro' | 'regional' | 'state' | 'nationwide';

export interface RegionConfig {
  id: string;
  name: string;
  category: RegionCategory;
  regionCode?: string; // e.g. "US-OR", "US-WA", "US"
  center: [number, number];
  zoom: number;
  description: string;
  endpoint?: string;
  lat?: number;
  lng?: number;
  distMiles?: number;
  bounds?: [[number, number], [number, number]];
}

