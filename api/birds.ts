import type { Request, Response } from 'express';

// Vercel Serverless Function handler for /api/birds
export default async function handler(req: Request, res: Response) {
  const EBIRD_API_KEY = process.env.EBIRD_API_KEY || '';
  
  const endpoint = (req.query?.endpoint as string) || '';
  const species = (req.query?.species as string) || '';
  const lat = req.query?.lat || '45.5152';
  const lng = req.query?.lng || '-122.6784';
  const dist = req.query?.dist || '25';
  const back = req.query?.back || '7';

  let path = 'data/obs/geo/recent';
  if (endpoint) {
    path = endpoint;
  } else if (species) {
    path = `data/obs/geo/recent/${species}?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}`;
  } else {
    path = `data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&sort=date`;
  }

  if (!EBIRD_API_KEY || EBIRD_API_KEY === 'x-ebirdapitoken' || EBIRD_API_KEY === 'DEFAULT_KEY') {
    return res.status(200).json({
      message: 'eBird proxy active (no token configured or fallback mode)',
      status: 'mock_fallback'
    });
  }

  try {
    const ebirdRes = await fetch(`https://api.ebird.org/v2/${path}`, {
      headers: {
        'x-ebirdapitoken': EBIRD_API_KEY,
      },
    });

    if (!ebirdRes.ok) {
      return res.status(ebirdRes.status).json({ error: `eBird responded with ${ebirdRes.status}` });
    }

    const data = await ebirdRes.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to proxy eBird API' });
  }
}
