# Mass Trail Tracker

A map application for viewing existing and planned trails across the Commonwealth.


## Getting Started

1. Clone this repo

2. [Install yarn](https://classic.yarnpkg.com/en/docs/install) if you don't already have it. I use yarn instead of npm.

3. Install dependencies: `yarn install`

4. Get the map tiles. `yarn dev` serves everything in `tiles/` on `localhost:8080` for you, but the files are gitignored, so you need to generate them once:

    1. Install the pmtiles CLI, a single binary from [GitHub Releases](https://github.com/protomaps/go-pmtiles/releases); on my Mac it lives at `/usr/local/bin/pmtiles`. The speed humps script also needs [tippecanoe](https://github.com/felt/tippecanoe).

    2. `yarn tiles:download` extracts the greater New England basemap (~650 MB) to `tiles/ma_region.pmtiles` from the latest Protomaps daily build. Pass a build date to pin one: `yarn tiles:download 20250610`.

    3. `yarn tiles:speed-humps` snapshots Boston's speed hump layers to `tiles/speed-humps.pmtiles`.

    Production copies of both live in `s3://tiles.masstrailtracker/` (see the script headers for publishing).

5. Create your own `.env` file. See `.env.example` for the values you need.

6. Start the app and tile server together with `yarn dev` (`yarn dev:app` runs Vite alone)

## Build and dev scripts

- `dev` – start the tile server (`tiles/` on :8080) and the Vite dev server
- `dev:app` – start only the Vite dev server
- `build` – build production version of the app
- `preview` – locally preview production build

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `prettier:check` – checks files with Prettier
- `vitest` – runs vitest tests
- `vitest:watch` – starts vitest watch
- `test` – runs `vitest`, `prettier:check`, `lint` and `typecheck` scripts

### Other scripts

- ~~`storybook` – starts storybook dev server~~
- ~~`storybook:build` – build production storybook bundle to `storybook-static`~~
- `prettier:write` – formats all files with Prettier

## Helpful commands

```

aws s3 ls | grep mtt-backend-prod

aws s3 cp --recursive s3://<bucket>/edits/ scripts/diffs/

aws s3 rm --recursive s3://<bucket>/edits/


```