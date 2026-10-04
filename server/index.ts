import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MOCK_OBSERVATIONS, MOCK_NOTABLE, MOCK_HOTSPOTS } from '../src/data/mockPortlandData.ts';
import {
  NATIONWIDE_NOTABLE_OBSERVATIONS,
  WASHINGTON_HOTSPOT_OBSERVATIONS,
  generateStateMockObservations,
} from '../src/data/regions.ts';
import { CrowRoostReport, Observation } from '../src/types/bird.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const EBIRD_API_KEY = process.env.EBIRD_API_KEY || '1a33119d-b38b-4679-b0a5-bec8589c1430';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors());
app.use(express.json());

// In-memory community reports store
let communityReports: CrowRoostReport[] = [
  {
    id: "rep-1",
    species: "American Crow",
    count: 3500,
    locationName: "South Park Blocks",
    lat: 45.5140,
    lng: -122.6825,
    direction: "SW toward Downtown Core",
    behavior: "Mega-Roost",
    notes: "Flocks landing densely in elm trees along SW Salmon St. High vocal activity.",
    timestamp: Date.now() - 3600000
  },
  {
    id: "rep-2",
    species: "American Crow",
    count: 1200,
    locationName: "Hawthorne Bridge East End",
    lat: 45.5132,
    lng: -122.6685,
    direction: "West across Willamette",
    behavior: "High Flight Stream",
    notes: "Continuous eastside flight stream crossing the river at twilight.",
    timestamp: Date.now() - 1800000
  }
];

// Helper to fetch from eBird or fallback
async function fetchEBird(endpoint: string, fallbackData: any) {
  if (!EBIRD_API_KEY || EBIRD_API_KEY === 'x-ebirdapitoken' || EBIRD_API_KEY === 'DEFAULT_KEY') {
    return fallbackData;
  }

  try {
    const res = await fetch(`https://api.ebird.org/v2/${endpoint}`, {
      headers: {
        'x-ebirdapitoken': EBIRD_API_KEY,
      },
    });

    if (!res.ok) {
      console.warn(`eBird API responded with ${res.status}, using mock fallback.`);
      return fallbackData;
    }

    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : fallbackData;
  } catch (err) {
    console.error('eBird API network error, falling back:', err);
    return fallbackData;
  }
}

// Helper to determine best mock fallback for an eBird endpoint
function getFallbackForEndpoint(endpoint: string, query?: any): any {
  if (endpoint.includes('US-WA')) {
    return WASHINGTON_HOTSPOT_OBSERVATIONS;
  }
  if (endpoint.includes('notable')) {
    return NATIONWIDE_NOTABLE_OBSERVATIONS;
  }
  const stateMatch = endpoint.match(/obs\/(US-[A-Z]{2})\/recent/i);
  if (stateMatch && stateMatch[1]) {
    return generateStateMockObservations(stateMatch[1]);
  }
  if (endpoint.includes('geo')) {
    const lat = query?.lat ? parseFloat(query.lat) : 45.5152;
    const lng = query?.lng ? parseFloat(query.lng) : -122.6784;
    return MOCK_OBSERVATIONS.map((obs, idx) => ({
      ...obs,
      lat: Number((lat + (Math.sin(idx * 2) * 0.12)).toFixed(4)),
      lng: Number((lng + (Math.cos(idx * 2) * 0.12)).toFixed(4)),
    }));
  }
  if (endpoint.includes('hotspot')) {
    return MOCK_HOTSPOTS;
  }
  return MOCK_OBSERVATIONS;
}

// Primary eBird API Proxy Endpoint (/api/ebird and /api/birds)
app.get(['/api/ebird', '/api/birds'], async (req: Request, res: Response) => {
  const endpoint = (req.query.endpoint as string) || '';
  if (endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const fallback = getFallbackForEndpoint(cleanEndpoint, req.query);
    const data = await fetchEBird(cleanEndpoint, fallback);
    return res.json(data);
  }

  const speciesCode = req.query.species as string;
  const lat = req.query.lat || '45.5152';
  const lng = req.query.lng || '-122.6784';
  const dist = req.query.dist || '25';
  const back = req.query.back || '7';

  if (speciesCode) {
    const fallback = MOCK_OBSERVATIONS.filter(o => o.speciesCode.toLowerCase() === speciesCode.toLowerCase());
    const data = await fetchEBird(`data/obs/geo/recent/${speciesCode}?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}`, fallback);
    return res.json(data);
  }

  const data = await fetchEBird(`data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&sort=date`, MOCK_OBSERVATIONS);
  res.json(data);
});

// 1. Specific Species Recent Observations
app.get('/api/birds/recent/:speciesCode', async (req: Request, res: Response) => {
  const { speciesCode } = req.params;
  const lat = req.query.lat || '45.5152';
  const lng = req.query.lng || '-122.6784';
  const dist = req.query.dist || '35';
  const back = req.query.back || '14';

  const fallback = MOCK_OBSERVATIONS.filter(o => o.speciesCode.toLowerCase() === speciesCode.toLowerCase());
  const data = await fetchEBird(`data/obs/geo/recent/${speciesCode}?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}`, fallback);
  res.json(data);
});

// 2. All Recent Local Observations
app.get('/api/birds/recent', async (req: Request, res: Response) => {
  const lat = req.query.lat || '45.5152';
  const lng = req.query.lng || '-122.6784';
  const dist = req.query.dist || '25';
  const back = req.query.back || '7';

  const data = await fetchEBird(`data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&sort=date`, MOCK_OBSERVATIONS);
  
  // Attach community reports as observations
  const communityAsObs: Observation[] = communityReports.map(rep => ({
    id: `comm-${rep.id}`,
    speciesCode: 'amecro',
    comName: `${rep.species} (Community Spotter)`,
    sciName: 'Corvus brachyrhynchos',
    locId: 'COMM_PDX',
    locName: rep.locationName,
    obsDt: new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    howMany: rep.count,
    lat: rep.lat,
    lng: rep.lng,
    obsReviewed: true,
    subId: 'COMMUNITY',
    direction: rep.direction,
    originStagingArea: rep.originStagingArea,
    flightHeadingDeg: rep.flightHeadingDeg,
    isCrowRoost: rep.count >= 250,
    notes: `${rep.behavior}: ${rep.notes}`
  }));

  res.json([...communityAsObs, ...data]);
});

// 3. Notable & Rare Sightings (Multnomah County: US-OR-051)
app.get('/api/birds/notable', async (_req: Request, res: Response) => {
  const data = await fetchEBird('data/obs/US-OR-051/recent/notable?detail=full', MOCK_NOTABLE);
  res.json(data);
});

// 4. Hotspot Explorer
app.get('/api/birds/hotspots', async (req: Request, res: Response) => {
  const lat = req.query.lat || '45.5152';
  const lng = req.query.lng || '-122.6784';
  const dist = req.query.dist || '25';

  const data = await fetchEBird(`ref/hotspot/geo?lat=${lat}&lng=${lng}&dist=${dist}&fmt=json`, MOCK_HOTSPOTS);
  res.json(data);
});

// 5. Community Roost Reports (Get & Post)
app.get('/api/birds/reports', (_req: Request, res: Response) => {
  res.json(communityReports);
});

app.post('/api/birds/reports', (req: Request, res: Response) => {
  const { species, count, locationName, lat, lng, direction, behavior, notes, originStagingArea, flightHeadingDeg } = req.body;
  if (!locationName || !count) {
    return res.status(400).json({ error: 'Location and flock count required' });
  }

  const newReport: CrowRoostReport = {
    id: `rep-${Date.now()}`,
    species: species || 'American Crow',
    count: Number(count),
    locationName: String(locationName),
    lat: Number(lat) || (45.5152 + (Math.random() - 0.5) * 0.03),
    lng: Number(lng) || (-122.6784 + (Math.random() - 0.5) * 0.03),
    direction: direction || 'SW toward Downtown',
    behavior: behavior || 'Mega-Roost',
    notes: notes || '',
    originStagingArea: originStagingArea || 'East Multnomah / Lloyd Staging',
    flightHeadingDeg: Number(flightHeadingDeg) || 225,
    timestamp: Date.now()
  };

  communityReports.unshift(newReport);
  res.status(201).json(newReport);
});

// 6. AI Roost Summary (Gemini Powered)
app.post('/api/ai/roost-summary', async (req: Request, res: Response) => {
  const { question } = req.body;
  const prompt = question || "Provide a concise Portland winter crow mega-roost staging summary, flight arrival times, and best viewing spots along the Willamette River.";

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return res.json({
      summary: `**Portland Crow Mega-Roost Brief (Autumn/Winter):**\n\n• **Peak Timing:** Staging starts ~5:00 PM; mega-roost dense settling between 5:45 PM – 6:30 PM.\n• **Prime Vantage:** South Park Blocks (SW Salmon & Park) under Dutch elms, and Tom McCall Waterfront Park between Hawthorne & Morrison bridges.\n• **Flock Behavior:** Up to 15,000 crows stream across the Willamette River from Eastside staging zones, swirling in vortex formations before roosting.\n• **Viewing Tip:** Bring an umbrella or hat if standing directly under canopy perches!`,
      model: 'cached-field-guide'
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [{
          text: `You are the Portland Ornithologist & Crow Mega-Roost specialist for PDX Bird & Crow Tracker. Provide concise, high-contrast, informative answers formatted with bullet points and bold key locations (South Park Blocks, Waterfront Park, Chapman School, Willamette bridges).`
        }]
      }
    };

    const gRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!gRes.ok) {
      throw new Error(`Gemini API HTTP ${gRes.status}`);
    }

    const gData = await gRes.json();
    const reply = gData?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate summary.";
    res.json({ summary: reply, model: 'gemini-2.5-flash' });
  } catch (err: any) {
    res.json({
      summary: `**Portland Crow Staging Intelligence:** Crows are actively staging east of the river near Lloyd Center and streaming west across the Hawthorne Bridge into South Park Blocks elms. Peak activity from 5:15 PM to dusk.`,
      error: err.message
    });
  }
});

// Serve Vite in development or static dist in production
async function startServer() {
  const distPath = path.resolve('dist');
  if (fs.existsSync(path.join(distPath, 'index.html')) && process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦅 PDX Bird & Crow Tracker running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
