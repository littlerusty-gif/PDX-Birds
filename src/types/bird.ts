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
}

export type ViewMode = 'species' | 'recent' | 'notable' | 'hotspots';
