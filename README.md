# Birdbook (Portland eBird 2.0)

A high-contrast, modern dark field-guide web application for tracking Portland bird sightings, urban flyway migrations, and winter crow mega-roosts.

## Features

- **Interactive Leaflet Map**: Centered on Portland (45.5152, -122.6784) with CartoDB Dark Matter tiles. Graduated markers color-coded by flock size (soft teal, bright amber, deep orange) with vivid crimson animated pulse markers for mega-roosts (>250 birds) and directional transit vectors.
- **eBird API 2.0 Integration**:
  - Specific Species Query (`/api/birds/recent/:speciesCode`)
  - All Recent Observations (`/api/birds/recent`)
  - Notable & Rare Bird Feed (`/api/birds/notable`)
  - Official Hotspot Explorer (`/api/birds/hotspots`)
- **Fast Taxonomy Search**: Instant client-side search across Pacific Northwest species codes (`amecro`, `vauxsw`, `perfal`, `rethaw`, etc.).
- **Community Spotter Modal**: Allows birders to submit live flock observations and flight directions.
- **Gemini AI Roost Intelligence**: On-demand flight staging analysis and viewing tips.
- **Graceful Fallbacks**: Seamless fallback to realistic Portland birding data if API keys are absent or rate-limited.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Leaflet / React-Leaflet, Lucide Icons
- **Backend Proxy**: Express, Vite middleware
- **Dev Server**: Vite running on port 3000 (`0.0.0.0`)
