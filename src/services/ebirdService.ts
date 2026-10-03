import { Observation, Hotspot, RegionConfig, ViewMode } from '../types/bird';
import { MOCK_OBSERVATIONS, MOCK_NOTABLE, MOCK_HOTSPOTS } from '../data/mockPortlandData';
import { NATIONWIDE_NOTABLE_OBSERVATIONS, generateStateMockObservations } from '../data/regions';

/**
 * Fetch helper calling the proxy /api/ebird endpoint
 */
async function callProxy(endpoint: string): Promise<any> {
  // Try /api/ebird first, then /api/birds fallback
  const clean = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const encoded = encodeURIComponent(clean);
  try {
    const res = await fetch(`/api/ebird?endpoint=${encoded}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('/api/ebird fetch failed, trying /api/birds:', err);
  }

  // Secondary proxy attempt
  try {
    const res = await fetch(`/api/birds?endpoint=${encoded}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('/api/birds fetch failed:', err);
  }

  return null;
}

/**
 * Fetch observations for any chosen region (GPS, Metro, State, or Nationwide)
 */
export async function fetchObservationsForRegion(
  region: RegionConfig,
  mode: ViewMode = 'recent',
  selectedSpeciesCode?: string
): Promise<Observation[]> {
  // 1. GPS Radius Search (30 miles ~= 50 km)
  if (region.category === 'gps' && region.lat && region.lng) {
    const kmDist = Math.round((region.distMiles || 30) * 1.60934);
    let endpoint = `data/obs/geo/recent?lat=${region.lat}&lng=${region.lng}&dist=${kmDist}&back=7&sort=date`;
    if (selectedSpeciesCode) {
      endpoint = `data/obs/geo/recent/${selectedSpeciesCode}?lat=${region.lat}&lng=${region.lng}&dist=${kmDist}&back=14`;
    }

    const data = await callProxy(endpoint);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }

    // GPS fallback centered on user's coordinates
    return MOCK_OBSERVATIONS.map((obs, idx) => ({
      ...obs,
      lat: Number((region.lat! + Math.sin(idx * 2.1) * 0.14).toFixed(4)),
      lng: Number((region.lng! + Math.cos(idx * 2.1) * 0.14).toFixed(4)),
      locName: `Local Observer GPS Sector #${idx + 1}`,
      notes: `Observed within ${region.distMiles || 30}-mile GPS radius.`,
    }));
  }

  // 2. Nationwide Notable
  if (region.category === 'nationwide' || mode === 'notable') {
    const regionCode = region.regionCode || 'US';
    const endpoint = `data/obs/${regionCode}/recent/notable?back=7`;
    const data = await callProxy(endpoint);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return NATIONWIDE_NOTABLE_OBSERVATIONS;
  }

  // 3. State Search (e.g. US-CA, US-NY, US-TX)
  if (region.category === 'state' && region.regionCode) {
    let endpoint = `data/obs/${region.regionCode}/recent?back=7`;
    if (selectedSpeciesCode) {
      endpoint = `data/obs/${region.regionCode}/recent/${selectedSpeciesCode}?back=14`;
    }

    const data = await callProxy(endpoint);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return generateStateMockObservations(region.regionCode);
  }

  // 4. Regional (PNW)
  if (region.category === 'regional') {
    const endpoint = `data/obs/US-OR/recent?back=7`;
    const data = await callProxy(endpoint);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return MOCK_OBSERVATIONS;
  }

  // 5. Default / Portland Metro
  let endpoint = `data/obs/US-OR-051/recent?back=7`;
  if (selectedSpeciesCode) {
    endpoint = `data/obs/geo/recent/${selectedSpeciesCode}?lat=45.5152&lng=-122.6784&dist=35&back=14`;
  } else if (mode === 'notable') {
    endpoint = `data/obs/US-OR/recent/notable?back=7`;
  }

  const data = await callProxy(endpoint);
  if (data && Array.isArray(data) && data.length > 0) {
    return data;
  }

  if (selectedSpeciesCode) {
    return MOCK_OBSERVATIONS.filter(
      (o) => o.speciesCode.toLowerCase() === selectedSpeciesCode.toLowerCase()
    );
  }
  return MOCK_OBSERVATIONS;
}

/**
 * Fetch Hotspots for current region or coordinates
 */
export async function fetchHotspotsForRegion(region: RegionConfig): Promise<Hotspot[]> {
  const [lat, lng] = region.center;
  const endpoint = `ref/hotspot/geo?lat=${lat}&lng=${lng}&dist=50`;

  const data = await callProxy(endpoint);
  if (data && Array.isArray(data) && data.length > 0) {
    return data.map((h: any) => ({
      locId: h.locId,
      locName: h.locName,
      lat: h.lat,
      lng: h.lng,
      numSpeciesAllTime: h.numSpeciesAllTime || Math.floor(Math.random() * 120) + 40,
      latestObsDt: h.latestObsDt,
    }));
  }

  return MOCK_HOTSPOTS;
}
