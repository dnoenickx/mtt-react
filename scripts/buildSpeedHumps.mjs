// Snapshots the City of Boston speed hump layers into a single PMTiles archive.
//
//   node scripts/buildSpeedHumps.mjs
//
// Requires `tippecanoe` and `pmtiles` on PATH. Output: tiles/speed-humps.pmtiles (gitignored).
// To publish: aws s3 cp tiles/speed-humps.pmtiles s3://tiles.masstrailtracker/ then invalidate /speed-humps* on CloudFront distribution E2TKVP6COY0BOY.
// Re-run whenever you want a fresher snapshot (the locations layer grows as humps are built).
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://services.arcgis.com/sFnw0xNflSi8J0uh/arcgis/rest/services';
const SOURCES = {
  eligibility: {
    url: `${BASE}/Speed_Hump_Eligibility_20232205/FeatureServer/0`,
    // Only what the popup / styling needs; the raw layer has ~90 columns.
    fields: [
      'STREETNAME',
      'PopupLong',
      'k_sphmp2',
      'k_Boston',
      'k_MBTAbus',
      'k_BNRD',
      'k_3Lanes',
      'k_alleys',
      'k_totlanes',
      'SPEED_LIM',
      'AADT',
      'LENGTH_FT',
    ],
  },
  humps: {
    url: `${BASE}/Speed_Hump_Locations_2_view/FeatureServer/0`,
    fields: ['Name', 'Zone'],
  },
};

async function fetchAll({ url, fields }) {
  const features = [];
  for (let offset = 0; ; offset += 2000) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: fields.join(','),
      outSR: '4326',
      f: 'geojson',
      orderByFields: 'OBJECTID',
      resultOffset: String(offset),
      resultRecordCount: '2000',
    });
    const res = await fetch(`${url}/query?${params}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const json = await res.json();
    if (json.error) throw new Error(JSON.stringify(json.error));
    features.push(...json.features);
    if (json.features.length < 2000) break;
  }
  return features;
}

async function fetchLastUpdated({ url }) {
  const res = await fetch(`${url}?f=json`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const { editingInfo } = await res.json();
  const ms = editingInfo?.dataLastEditDate ?? editingInfo?.lastEditDate;
  return ms ? new Date(ms).toISOString() : null;
}

const meta = { accessedAt: new Date().toISOString() };
const dir = mkdtempSync(join(tmpdir(), 'speed-humps-'));
try {
  const files = [];
  for (const [name, src] of Object.entries(SOURCES)) {
    const features = await fetchAll(src);
    for (const f of features) {
      // ArcGIS pads empty strings with a single space.
      for (const [k, v] of Object.entries(f.properties)) {
        if (typeof v === 'string') f.properties[k] = v.trim();
      }
    }
    meta[name] = { lastUpdated: await fetchLastUpdated(src), features: features.length };
    console.log(`${name}: ${features.length} features, last updated ${meta[name].lastUpdated}`);
    const file = join(dir, `${name}.geojson`);
    writeFileSync(file, JSON.stringify({ type: 'FeatureCollection', features }));
    files.push(`--named-layer=${name}:${file}`);
  }

  // Read by the page to show provenance in the legend.
  writeFileSync('src/pages/SpeedHumps/speedHumps.meta.json', `${JSON.stringify(meta, null, 2)}\n`);

  const out = 'tiles/speed-humps.pmtiles';
  mkdirSync('tiles', { recursive: true });
  execFileSync(
    'tippecanoe',
    [
      '-o', out,
      '--force',
      '--no-tile-size-limit',      // keep every street; Boston is small enough
      '--maximum-zoom=16',
      '--minimum-zoom=9',
      '--simplification=4',
      '--no-feature-limit',
      '--drop-rate=1',             // never thin points at low zooms; show every hump
      ...files,
    ],
    { stdio: 'inherit' }
  );
  execFileSync('pmtiles', ['verify', out], { stdio: 'inherit' });
  console.log(`${out}: ${(statSync(out).size / 1e6).toFixed(2)} MB`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
