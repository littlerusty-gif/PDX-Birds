import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const EBIRD_API_KEY = process.env.EBIRD_API_KEY || '1a33119d-b38b-4679-b0a5-bec8589c1430';
  
  let endpoint = (req.query?.endpoint as string) || '';
  if (!endpoint) {
    const species = (req.query?.species as string) || '';
    const lat = req.query?.lat || '45.5152';
    const lng = req.query?.lng || '-122.6784';
    const dist = req.query?.dist || '50';
    const back = req.query?.back || '7';

    if (species) {
      endpoint = `data/obs/geo/recent/${species}?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}`;
    } else {
      endpoint = `data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&sort=date`;
    }
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  try {
    const ebirdRes = await fetch(`https://api.ebird.org/v2/${cleanEndpoint}`, {
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
