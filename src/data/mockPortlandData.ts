import { Observation, Hotspot, TaxonomyItem, FlightCorridor } from '../types/bird';

export const PNW_TAXONOMY: TaxonomyItem[] = [
  { comName: "American Crow", sciName: "Corvus brachyrhynchos", speciesCode: "amecro", familyComName: "Crows & Jays" },
  { comName: "Common Raven", sciName: "Corvus corax", speciesCode: "comrav", familyComName: "Crows & Jays" },
  { comName: "Vaux's Swift", sciName: "Chaetura vauxi", speciesCode: "vauxsw", familyComName: "Swifts" },
  { comName: "Peregrine Falcon", sciName: "Falco peregrinus", speciesCode: "perfal", familyComName: "Falcons" },
  { comName: "Red-tailed Hawk", sciName: "Buteo jamaicensis", speciesCode: "rethaw", familyComName: "Hawks & Eagles" },
  { comName: "Bald Eagle", sciName: "Haliaeetus leucocephalus", speciesCode: "baleag", familyComName: "Hawks & Eagles" },
  { comName: "Cooper's Hawk", sciName: "Accipiter cooperii", speciesCode: "coohaw", familyComName: "Hawks & Eagles" },
  { comName: "Osprey", sciName: "Pandion haliaetus", speciesCode: "osprey", familyComName: "Ospreys" },
  { comName: "Great Blue Heron", sciName: "Ardea herodias", speciesCode: "grbher", familyComName: "Herons" },
  { comName: "Great Egret", sciName: "Ardea alba", speciesCode: "greegr", familyComName: "Herons" },
  { comName: "Wood Duck", sciName: "Aix sponsa", speciesCode: "wooduc", familyComName: "Ducks & Geese" },
  { comName: "Mallard", sciName: "Anas platyrhynchos", speciesCode: "mallar3", familyComName: "Ducks & Geese" },
  { comName: "Cackling Goose", sciName: "Branta hutchinsii", speciesCode: "cackgo", familyComName: "Ducks & Geese" },
  { comName: "Sandhill Crane", sciName: "Antigone canadensis", speciesCode: "sancra", familyComName: "Cranes" },
  { comName: "Barred Owl", sciName: "Strix varia", speciesCode: "brdowl", familyComName: "Owls" },
  { comName: "Anna's Hummingbird", sciName: "Calypte anna", speciesCode: "annhum", familyComName: "Hummingbirds" },
  { comName: "Rufous Hummingbird", sciName: "Selasphorus rufus", speciesCode: "rufhum", familyComName: "Hummingbirds" },
  { comName: "Western Tanager", sciName: "Piranga ludoviciana", speciesCode: "westan", familyComName: "Cardinals & Tanagers" },
  { comName: "Cedar Waxwing", sciName: "Bombycilla cedrorum", speciesCode: "cedwax", familyComName: "Waxwings" },
  { comName: "Varied Thrush", sciName: "Ixoreus naevius", speciesCode: "varthr", familyComName: "Thrushes" },
  { comName: "Snowy Owl", sciName: "Bubo scandiacus", speciesCode: "snoowl1", familyComName: "Owls" }
];

export const FLIGHT_CORRIDORS: FlightCorridor[] = [
  {
    id: "corridor-eastside",
    name: "East Multnomah / Lloyd Staging",
    corridorName: "Eastside Corridor",
    timeWindow: "4:45 PM - 5:30 PM",
    heading: "Heading SW",
    headingDeg: 225,
    estFlockSize: 6200,
    description: "Flocks aggregate on Lloyd Center roofs and Sullivan's Gulch trees before cutting southwest across the Willamette toward Hawthorne Bridge, Waterfront Park, and South Park Blocks.",
    color: "#38bdf8", // Sky blue
    coordinates: [
      [45.5322, -122.6534], // Lloyd Center
      [45.5225, -122.6610], // Central Eastside / Burnside
      [45.5132, -122.6685], // Hawthorne Bridge
      [45.5150, -122.6730], // Waterfront Park
      [45.5186, -122.6816], // South Park Blocks
    ],
  },
  {
    id: "corridor-southeast",
    name: "Southeast / Powell Corridor",
    corridorName: "Powell & Mt. Tabor Flyway",
    timeWindow: "5:15 PM - 6:00 PM",
    heading: "Heading NW",
    headingDeg: 315,
    estFlockSize: 4800,
    description: "Crows foraging near Mt. Tabor and Powell Park converge along SE Division and Powell Blvd, banking northwest over Hawthorne Bridge into Waterfront Park and South Park Blocks.",
    color: "#fb923c", // Vibrant orange
    coordinates: [
      [45.5115, -122.5950], // Mt. Tabor Staging
      [45.5040, -122.6280], // SE Powell & 33rd
      [45.5085, -122.6560], // Ladd's Addition / Central Eastside
      [45.5132, -122.6685], // Hawthorne Bridge East Pier
      [45.5150, -122.6730], // Waterfront Park
      [45.5186, -122.6816], // South Park Blocks
    ],
  },
  {
    id: "corridor-river-south",
    name: "Northbound River Flyway",
    corridorName: "South Willamette Corridor",
    timeWindow: "5:00 PM - 5:45 PM",
    heading: "Heading North along River",
    headingDeg: 350,
    estFlockSize: 3400,
    description: "Flocks from Oaks Bottom Wildlife Refuge and Sellwood follow the calm water thermals north under Ross Island and Marquam bridges toward central bridges.",
    color: "#a855f7", // Purple
    coordinates: [
      [45.4850, -122.6550], // Oaks Bottom
      [45.5010, -122.6630], // Ross Island Bridge
      [45.5080, -122.6700], // Marquam Bridge
      [45.5132, -122.6685], // Central Bridge zone
      [45.5150, -122.6730], // Waterfront Park
    ],
  },
  {
    id: "corridor-river-north",
    name: "Southbound River Flyway",
    corridorName: "North Willamette Corridor",
    timeWindow: "4:30 PM - 5:15 PM",
    heading: "Heading South along River",
    headingDeg: 165,
    estFlockSize: 3100,
    description: "Flocks from Sauvie Island, St. Johns, and Swan Island follow the river south past the Fremont and Steel bridges toward the central bridges.",
    color: "#34d399", // Emerald
    coordinates: [
      [45.5580, -122.7100], // Swan Island Basin
      [45.5390, -122.6850], // Fremont Bridge
      [45.5280, -122.6740], // Steel Bridge
      [45.5165, -122.6730], // Waterfront Park
      [45.5140, -122.6825], // South Park Blocks
    ],
  },
  {
    id: "corridor-convergence",
    name: "Final Roost Convergence",
    corridorName: "Downtown Canopy Settlement",
    timeWindow: "Dusk / Sunset (5:45 PM - 6:30 PM)",
    heading: "Radial descent into Canopy",
    headingDeg: 270,
    estFlockSize: 15000,
    description: "South Park Blocks & Waterfront canopy settling by dusk: massive convergence settling into the Dutch elms and tall deciduous street trees.",
    color: "#ef4444", // Crimson
    coordinates: [
      [45.5165, -122.6730], // Waterfront Park
      [45.5155, -122.6780], // SW Yamhill & 4th
      [45.5140, -122.6825], // South Park Blocks Mega-Roost
    ],
  }
];

export const MOCK_OBSERVATIONS: Observation[] = [
  {
    id: "obs-1",
    speciesCode: "amecro",
    comName: "American Crow",
    sciName: "Corvus brachyrhynchos",
    locId: "L901001",
    locName: "South Park Blocks (Downtown Mega-Roost)",
    obsDt: "2026-10-02 18:45",
    howMany: 8500,
    lat: 45.5140,
    lng: -122.6825,
    obsReviewed: true,
    subId: "S14298102",
    direction: "Roosting (Elms & Maples)",
    isCrowRoost: true,
    originStagingArea: "Convergence: Eastside & River Corridors",
    flightHeadingDeg: 270,
    trajectoryCoords: [
      [45.5165, -122.6730],
      [45.5155, -122.6780],
      [45.5140, -122.6825]
    ],
    notes: "Historic winter mega-roost canopy filled with vocalizations. Estimated 8,500 birds settling in tall downtown deciduous trees."
  },
  {
    id: "obs-2",
    speciesCode: "amecro",
    comName: "American Crow",
    sciName: "Corvus brachyrhynchos",
    locId: "L901002",
    locName: "Tom McCall Waterfront Park (Morrison to Hawthorne)",
    obsDt: "2026-10-02 18:15",
    howMany: 12000,
    lat: 45.5165,
    lng: -122.6730,
    obsReviewed: true,
    subId: "S14298103",
    direction: "SW toward Downtown Core",
    isCrowRoost: true,
    originStagingArea: "Hawthorne Bridge & Eastside Pier",
    flightHeadingDeg: 235,
    trajectoryCoords: [
      [45.5322, -122.6534], // Lloyd Center
      [45.5132, -122.6685], // Hawthorne Bridge
      [45.5150, -122.6730], // Waterfront Park
    ],
    notes: "Huge evening river corridor flight stream crossing the Willamette River into downtown staging trees."
  },
  {
    id: "obs-3",
    speciesCode: "amecro",
    comName: "American Crow",
    sciName: "Corvus brachyrhynchos",
    locId: "L901003",
    locName: "Lloyd Center Rooftop Staging Zone",
    obsDt: "2026-10-02 17:30",
    howMany: 2400,
    lat: 45.5320,
    lng: -122.6540,
    obsReviewed: true,
    subId: "S14298104",
    direction: "SW toward Bridges",
    isCrowRoost: true,
    originStagingArea: "East Multnomah / Gateway Staging",
    flightHeadingDeg: 225,
    trajectoryCoords: [
      [45.5385, -122.6320],
      [45.5320, -122.6540]
    ],
    notes: "Eastside pre-roost staging aggregation before crossing the river into downtown roost sites."
  },
  {
    id: "obs-4",
    speciesCode: "amecro",
    comName: "American Crow",
    sciName: "Corvus brachyrhynchos",
    locId: "L901004",
    locName: "Hawthorne Bridge East Pier Flight Corridor",
    obsDt: "2026-10-02 18:00",
    howMany: 3800,
    lat: 45.5132,
    lng: -122.6685,
    obsReviewed: true,
    subId: "S14298105",
    direction: "West across Willamette",
    isCrowRoost: true,
    originStagingArea: "Southeast / Powell Corridor",
    flightHeadingDeg: 270,
    trajectoryCoords: [
      [45.5085, -122.6450],
      [45.5132, -122.6685],
      [45.5150, -122.6730]
    ],
    notes: "Continuous stream of crows flying low over river water into the city core."
  },
  {
    id: "obs-5",
    speciesCode: "vauxsw",
    comName: "Vaux's Swift",
    sciName: "Chaetura vauxi",
    locId: "L120045",
    locName: "Chapman Elementary School Chimney",
    obsDt: "2026-10-02 19:10",
    howMany: 4200,
    lat: 45.5342,
    lng: -122.7125,
    obsReviewed: true,
    subId: "S14298106",
    direction: "Circling Funnel",
    isCrowRoost: false,
    notes: "Spectacular swirling funnel vortex spiraling down into the historic school brick chimney at twilight."
  },
  {
    id: "obs-6",
    speciesCode: "perfal",
    comName: "Peregrine Falcon",
    sciName: "Falco peregrinus",
    locId: "L200192",
    locName: "Fremont Bridge Arch",
    obsDt: "2026-10-02 16:20",
    howMany: 2,
    lat: 45.5385,
    lng: -122.6842,
    obsReviewed: true,
    subId: "S14298107",
    direction: "Eastbound hunting dive",
    notes: "Pair perched on bridge steel structure scanning for incoming waterfowl and starlings."
  },
  {
    id: "obs-7",
    speciesCode: "baleag",
    comName: "Bald Eagle",
    sciName: "Haliaeetus leucocephalus",
    locId: "L300182",
    locName: "Oaks Bottom Wildlife Refuge - North Lagoon",
    obsDt: "2026-10-02 11:30",
    howMany: 3,
    lat: 45.4795,
    lng: -122.6540,
    obsReviewed: true,
    subId: "S14298108",
    direction: "Perched",
    notes: "Adult and two juveniles perched in tall cottonwood tree overlooking the lagoon."
  },
  {
    id: "obs-8",
    speciesCode: "grbher",
    comName: "Great Blue Heron",
    sciName: "Ardea herodias",
    locId: "L400293",
    locName: "Crystal Springs Rhododendron Garden",
    obsDt: "2026-10-02 14:15",
    howMany: 7,
    lat: 45.4790,
    lng: -122.6345,
    obsReviewed: true,
    subId: "S14298109",
    direction: "Foraging in spring ponds",
    notes: "Several herons stalking trout in the clear spring waters."
  },
  {
    id: "obs-9",
    speciesCode: "sancra",
    comName: "Sandhill Crane",
    sciName: "Antigone canadensis",
    locId: "L500391",
    locName: "Sauvie Island - Renton Rd Agricultural Fields",
    obsDt: "2026-10-02 09:40",
    howMany: 65,
    lat: 45.7150,
    lng: -122.8120,
    obsReviewed: true,
    subId: "S14298111",
    direction: "North flyway banking",
    notes: "Bugling family groups foraging in corn stubble with Mount St. Helens visible in distance."
  }
];

export const MOCK_NOTABLE: Observation[] = [
  {
    id: "not-1",
    speciesCode: "snoowl1",
    comName: "Snowy Owl",
    sciName: "Bubo scandiacus",
    locId: "L99001",
    locName: "Sauvie Island - Columbia River North Spit",
    obsDt: "2026-10-02 15:45",
    howMany: 1,
    lat: 45.7480,
    lng: -122.7950,
    obsReviewed: true,
    subId: "S14299901",
    direction: "Perched on driftwood",
    notes: "RARE IRRUPTIVE VAGRANT! Female resting on high driftwood log overlooking the Columbia river channel."
  },
  {
    id: "not-2",
    speciesCode: "norgos",
    comName: "Northern Goshawk",
    sciName: "Accipiter gentilis",
    locId: "L99002",
    locName: "Forest Park - Wildwood Trail Mile 14",
    obsDt: "2026-10-02 09:10",
    howMany: 1,
    lat: 45.5680,
    lng: -122.7550,
    obsReviewed: true,
    subId: "S14299902",
    direction: "Low rapid flight through Douglas firs",
    notes: "CONFIRMED NOTABLE! Adult accipiter hunting ruffed grouse in dense conifer canopy."
  }
];

export const MOCK_HOTSPOTS: Hotspot[] = [
  { locId: "L120045", locName: "Chapman Elementary School (Swifts)", lat: 45.5342, lng: -122.7125, numSpeciesAllTime: 62 },
  { locId: "L901001", locName: "South Park Blocks (Downtown Crow Roost)", lat: 45.5140, lng: -122.6825, numSpeciesAllTime: 84 },
  { locId: "L901002", locName: "Tom McCall Waterfront Park", lat: 45.5165, lng: -122.6730, numSpeciesAllTime: 115 },
  { locId: "L300182", locName: "Oaks Bottom Wildlife Refuge", lat: 45.4795, lng: -122.6540, numSpeciesAllTime: 182 },
  { locId: "L400293", locName: "Crystal Springs Rhododendron Garden", lat: 45.4790, lng: -122.6345, numSpeciesAllTime: 142 },
  { locId: "L700219", locName: "Mount Tabor Park Summit", lat: 45.5120, lng: -122.5950, numSpeciesAllTime: 138 },
  { locId: "L500391", locName: "Sauvie Island Wildlife Area", lat: 45.7150, lng: -122.8120, numSpeciesAllTime: 275 },
  { locId: "L600129", locName: "Forest Park - Lower Macleay Trail", lat: 45.5360, lng: -122.7155, numSpeciesAllTime: 96 }
];
