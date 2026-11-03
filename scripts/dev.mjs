// `yarn dev`: serves ./tiles on :8080 (basemap + speed humps) alongside the Vite dev server.
// Requires the `pmtiles` CLI on PATH. Use `yarn dev:app` to run Vite alone.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!existsSync('tiles/ma_region.pmtiles')) {
  console.error('tiles/ma_region.pmtiles is missing. Run `yarn tiles:download` first.');
  process.exit(1);
}

const run = (cmd, args) => spawn(cmd, args, { stdio: 'inherit' });
const tiles = run('pmtiles', [
  'serve',
  'tiles',
  '--cors=*',
  '--public-url=http://localhost:8080',
  '--port=8080',
]);
const vite = run('yarn', ['run', 'dev:app']);

const stop = () => {
  tiles.kill();
  vite.kill();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
tiles.on('exit', (code) => {
  if (code) console.error(`pmtiles serve exited (${code}); is port 8080 already in use?`);
  vite.kill();
});
vite.on('exit', (code) => {
  tiles.kill();
  process.exit(code ?? 0);
});
