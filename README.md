# Mass Trail Tracker

A map application for viewing existing and planned trails across the Commonwealth.


## Getting Started

1. Clone this repo

2. [Install yarn](https://classic.yarnpkg.com/en/docs/install) if you don't already have it. I use yarn instead of npm.

3. Install dependencies: `yarn install`

4. Setup local server for serving map tiles:

    1. The pmtiles CLI tool is a single binary you can download at [GitHub Releases](https://github.com/protomaps/go-pmtiles/releases). You'll want to make sure that is moved to the correct location for your system; on my Mac that is `/usr/local/bin/pmtiles`

    2. You can find daily basemap builds at [maps.protomaps.com/builds](maps.protomaps.com/builds). Just copy the name of the most recent one.

    3. Update the url in this command to have the most recent build, and run the command to download the a subset of the world covering greater New England
    
    `pmtiles extract https://build.protomaps.com/20250610.pmtiles ma_region.pmtiles --box=-74.563994,40.935011,-69.07083,43.405765 --maxzoom=17`

    4. When the download is complete, serve the tiles `pmtiles serve . --cors=\* --public-url=http://localhost:8080`

5. Create your own `.env` file. See `.env.example` for the values you need.

6. Start the app `yarn run dev`

## Build and dev scripts

- `dev` – start development server
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
