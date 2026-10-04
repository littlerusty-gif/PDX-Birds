import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  // CORS Headers for seamless cross-origin and client requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-ebirdapitoken'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const EBIRD_API_KEY = process.env.EBIRD_API_KEY || '1a33119d-b38b-4679-b0a5-bec8589c1430';
  
  let endpoint = (req.query?.endpoint as string) || '';
  if (!endpoint) {
    const region = (req.query?.region as string) || (req.query?.regionCode as string) || '';
    if (region) {
      endpoint = `data/obs/${region}/recent/notable?detail=full&back=7`;
    } else {
      const species = (req.query?.species as string) || '';
      const lat = req.query?.lat || '47.5';
      const lng = req.query?.lng || '-120.5';
      const dist = req.query?.dist || '50';
      const back = req.query?.back || '7';

      if (species) {
        endpoint = `data/obs/geo/recent/${species}?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}`;
      } else {
        endpoint = `data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&sort=date`;
      }
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
