// Downloads the Protomaps basemap for greater New England into tiles/ma_region.pmtiles.
//
//   node scripts/downloadBasemap.mjs              # latest daily build
//   node scripts/downloadBasemap.mjs 20250610     # a specific build (YYYYMMDD)
//
// Requires the `pmtiles` CLI on PATH. Extraction only fetches the tiles inside the bbox, so it is
// far smaller than the ~140 GB planet build (~650 MB). The bbox/maxzoom match the archive
// currently in s3://tiles.masstrailtracker (bounds -74.56,40.94,-69.07,43.41; the source tops out at z15).
// To publish: aws s3 cp tiles/ma_region.pmtiles s3://tiles.masstrailtracker/ and invalidate
// /ma_region* on CloudFront distribution E2TKVP6COY0BOY.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const BBOX = '-74.563994,40.935011,-69.07083,43.405765';
const MAXZOOM = '15';
const OUT = 'tiles/ma_region.pmtiles';

async function latestBuild() {
  const res = await fetch('https://build-metadata.protomaps.dev/builds.json');
  if (!res.ok) throw new Error(`Could not list builds: ${res.status}`);
  const builds = await res.json();
  return builds.map((b) => b.key).sort().at(-1).replace('.pmtiles', '');
}

const build = process.argv[2] ?? (await latestBuild());
const source = `https://build.protomaps.com/${build}.pmtiles`;
console.log(`Extracting ${source} -> ${OUT}`);

mkdirSync('tiles', { recursive: true });
execFileSync('pmtiles', ['extract', source, OUT, `--bbox=${BBOX}`, `--maxzoom=${MAXZOOM}`], {
  stdio: 'inherit',
});
