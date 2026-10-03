export interface SpeciesForecast {
  speciesCode: string;
  comName: string;
  category: 'crow' | 'swift' | 'raptor' | 'waterbird' | 'owl' | 'songbird';
  optimalWindowBadge: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  viewingTip: string;
  bestLocations: string[];
}

export const SPECIES_FORECASTS: Record<string, SpeciesForecast> = {
  amecro: {
    speciesCode: 'amecro',
    comName: 'American Crow',
    category: 'crow',
    optimalWindowBadge: '4:45 PM - 6:15 PM Dusk',
    startHour: 16,
    startMinute: 45,
    endHour: 18,
    endMinute: 30,
    viewingTip: 'Rooftop staging on Eastside, followed by massive convergence into South Park Blocks & Waterfront elms.',
    bestLocations: ['South Park Blocks', 'Tom McCall Waterfront Park', 'Hawthorne Bridge'],
  },
  comrav: {
    speciesCode: 'comrav',
    comName: 'Common Raven',
    category: 'crow',
    optimalWindowBadge: '10:00 AM - 3:00 PM Midday',
    startHour: 10,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    viewingTip: 'Vocal soaring flights riding ridge thermals above conifer forest margins and bridge towers.',
    bestLocations: ['Forest Park Ridgeline', 'Fremont Bridge', 'Mt. Tabor Summit'],
  },
  vauxsw: {
    speciesCode: 'vauxsw',
    comName: "Vaux's Swift",
    category: 'swift',
    optimalWindowBadge: 'Sunset -20 min (6:15 PM - 7:00 PM)',
    startHour: 18,
    startMinute: 15,
    endHour: 19,
    endMinute: 15,
    viewingTip: 'Thousands vortex in aerial funnel before plummeting into Chapman Elementary School chimney.',
    bestLocations: ['Chapman Elementary School Lawn'],
  },
  perfal: {
    speciesCode: 'perfal',
    comName: 'Peregrine Falcon',
    category: 'raptor',
    optimalWindowBadge: '10:30 AM - 2:00 PM Thermals',
    startHour: 10,
    startMinute: 30,
    endHour: 14,
    endMinute: 0,
    viewingTip: 'High-speed 200mph hunting stoops over Willamette bridges targeting flocking pigeons.',
    bestLocations: ['Fremont Bridge', 'Hawthorne Bridge', 'Steel Bridge'],
  },
  baleag: {
    speciesCode: 'baleag',
    comName: 'Bald Eagle',
    category: 'raptor',
    optimalWindowBadge: '10:30 AM - 2:00 PM Thermals',
    startHour: 10,
    startMinute: 30,
    endHour: 14,
    endMinute: 0,
    viewingTip: 'Soaring high thermals over river channel; perching on Ross Island cottonwood snags.',
    bestLocations: ['Ross Island', 'Sauvie Island Wildlife Area', 'Oaks Bottom'],
  },
  rethaw: {
    speciesCode: 'rethaw',
    comName: 'Red-tailed Hawk',
    category: 'raptor',
    optimalWindowBadge: '10:30 AM - 2:00 PM Thermals',
    startHour: 10,
    startMinute: 30,
    endHour: 14,
    endMinute: 0,
    viewingTip: 'Circling open sky over open hills and highway grassy medians; perching on light poles.',
    bestLocations: ['Mt. Tabor Park Summit', 'Forest Park', 'Sauvie Island'],
  },
  coohaw: {
    speciesCode: 'coohaw',
    comName: "Cooper's Hawk",
    category: 'raptor',
    optimalWindowBadge: '8:30 AM - 11:30 AM & 3:30 PM - 5:00 PM',
    startHour: 8,
    startMinute: 30,
    endHour: 17,
    endMinute: 0,
    viewingTip: 'Agile low-altitude stealth chases through residential garden canopy.',
    bestLocations: ['Crystal Springs Rhododendron Garden', 'South Park Blocks'],
  },
  osprey: {
    speciesCode: 'osprey',
    comName: 'Osprey',
    category: 'raptor',
    optimalWindowBadge: '10:30 AM - 2:30 PM Midday',
    startHour: 10,
    startMinute: 30,
    endHour: 14,
    endMinute: 30,
    viewingTip: 'Hovering 40 feet above river water before dramatic talon-first plunge dives for salmon and bass.',
    bestLocations: ['Sellwood Riverfront', 'Willamette River Bridges'],
  },
  grbher: {
    speciesCode: 'grbher',
    comName: 'Great Blue Heron',
    category: 'waterbird',
    optimalWindowBadge: '7:30 AM - 1:00 PM Morning / Midday',
    startHour: 7,
    startMinute: 30,
    endHour: 13,
    endMinute: 0,
    viewingTip: 'Statuesque stalking in marsh shallows and mudflats at low tide.',
    bestLocations: ['Oaks Bottom Wildlife Refuge', 'Crystal Springs', 'Smith & Bybee Lakes'],
  },
  greegr: {
    speciesCode: 'greegr',
    comName: 'Great Egret',
    category: 'waterbird',
    optimalWindowBadge: '8:00 AM - 1:30 PM Midday',
    startHour: 8,
    startMinute: 0,
    endHour: 13,
    endMinute: 30,
    viewingTip: 'Dazzling white plumage against dark water; stabbing minnows with yellow dagger bill.',
    bestLocations: ['Crystal Springs', 'Oaks Bottom', 'Sauvie Island'],
  },
  wooduc: {
    speciesCode: 'wooduc',
    comName: 'Wood Duck',
    category: 'waterbird',
    optimalWindowBadge: '8:00 AM - 12:30 PM Morning',
    startHour: 8,
    startMinute: 0,
    endHour: 12,
    endMinute: 30,
    viewingTip: 'Iridescent drakes paddling in calm sloughs under overhanging alder branches.',
    bestLocations: ['Crystal Springs Rhododendron Garden', 'Oaks Bottom'],
  },
  sancra: {
    speciesCode: 'sancra',
    comName: 'Sandhill Crane',
    category: 'waterbird',
    optimalWindowBadge: '9:00 AM - 3:00 PM Daytime',
    startHour: 9,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    viewingTip: 'Raucous bugling calls echoing across agricultural fields and wetlands.',
    bestLocations: ['Sauvie Island Wildlife Area', 'Ridgefield NWR'],
  },
  brdowl: {
    speciesCode: 'brdowl',
    comName: 'Barred Owl',
    category: 'owl',
    optimalWindowBadge: 'Dusk & Early Dawn (6:30 PM - 8:00 PM)',
    startHour: 18,
    startMinute: 30,
    endHour: 20,
    endMinute: 30,
    viewingTip: 'Perched motionless close to Douglas fir trunks; characteristic "who cooks for you" call.',
    bestLocations: ['Forest Park - Lower Macleay Trail', 'Tryon Creek State Natural Area'],
  },
  snoowl1: {
    speciesCode: 'snoowl1',
    comName: 'Snowy Owl',
    category: 'owl',
    optimalWindowBadge: '3:00 PM - 6:00 PM Late Afternoon',
    startHour: 15,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    viewingTip: 'Perched low on driftwood logs or navigation pilings scanning open sand bars.',
    bestLocations: ['Sauvie Island - Columbia River North Spit'],
  },
  annhum: {
    speciesCode: 'annhum',
    comName: "Anna's Hummingbird",
    category: 'songbird',
    optimalWindowBadge: '8:00 AM - 4:00 PM All Day',
    startHour: 8,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    viewingTip: 'Ruby-red gorgets gleaming in sunlight; high speed J-shaped territorial display dives.',
    bestLocations: ['Crystal Springs', 'Portland Japanese Garden', 'Urban Feeder Gardens'],
  },
};

// Check if species is in optimal window right now
export function isSpeciesOptimalNow(speciesCode: string, date: Date = new Date()): boolean {
  const forecast = SPECIES_FORECASTS[speciesCode.toLowerCase()];
  if (!forecast) return true;

  const currentMinuteOfDay = date.getHours() * 60 + date.getMinutes();
  const startMinuteOfDay = forecast.startHour * 60 + forecast.startMinute;
  const endMinuteOfDay = forecast.endHour * 60 + forecast.endMinute;

  if (startMinuteOfDay <= endMinuteOfDay) {
    return currentMinuteOfDay >= startMinuteOfDay && currentMinuteOfDay <= endMinuteOfDay;
  } else {
    // Overnight window (e.g. 20:00 to 05:00)
    return currentMinuteOfDay >= startMinuteOfDay || currentMinuteOfDay <= endMinuteOfDay;
  }
}

// Compute live viewing condition rating
export interface ConditionsAssessment {
  rating: 'Good' | 'Fair' | 'Poor';
  score: number; // 0-100
  lightLevel: string;
  windEffect: string;
  summary: string;
  color: string;
  badgeBg: string;
}

export function assessViewingConditions(
  targetCategory: 'crow' | 'swift' | 'raptor' | 'waterbird' | 'general' = 'general',
  windMode: 'calm' | 'gorge_east' = 'calm',
  cloudMode: 'clear' | 'overcast' = 'clear',
  date: Date = new Date()
): ConditionsAssessment {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeVal = hour * 60 + minute;

  // Daylight evaluation
  const isNight = hour < 6 || hour >= 20;
  const isDusk = timeVal >= 16 * 60 + 30 && timeVal <= 19 * 60 + 15;
  const isMidday = hour >= 10 && hour <= 15;

  let lightLevel = isNight
    ? 'Dark / Artificial Urban Lighting'
    : isDusk
    ? 'Golden Hour / Twilight Transition'
    : cloudMode === 'overcast'
    ? 'Diffused Overcast (4,500K)'
    : 'Bright Direct Daylight (5,500K)';

  let windEffect =
    windMode === 'calm'
      ? 'Calm West 6 mph: Stable laminar river boundary layer'
      : 'East Gorge Wind 18 mph: Heavy turbulence across bridges';

  let score = 75;

  if (targetCategory === 'crow') {
    if (isDusk) score += 20;
    else if (isMidday) score -= 15;
    if (windMode === 'gorge_east') score -= 10;
  } else if (targetCategory === 'raptor') {
    if (isMidday) score += 20;
    else if (isDusk || isNight) score -= 40;
    if (cloudMode === 'clear') score += 10;
  } else if (targetCategory === 'swift') {
    if (isDusk) score += 25;
    else score -= 30;
    if (cloudMode === 'overcast') score -= 15; // Swifts drop earlier
  } else {
    if (isMidday || isDusk) score += 10;
  }

  score = Math.max(20, Math.min(98, score));

  if (score >= 75) {
    return {
      rating: 'Good',
      score,
      lightLevel,
      windEffect,
      summary: 'Optimal contrast and active flight vectors across Portland airspace.',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    };
  } else if (score >= 50) {
    return {
      rating: 'Fair',
      score,
      lightLevel,
      windEffect,
      summary: 'Moderate visibility; expect pre-staging aggregations or sheltered flyways.',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    };
  } else {
    return {
      rating: 'Poor',
      score,
      lightLevel,
      windEffect,
      summary: 'Sub-optimal viewing window or adverse wind shear; birds hunkered in canopy.',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    };
  }
}
