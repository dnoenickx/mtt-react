import { Layer, Source } from 'react-map-gl/maplibre';
import { lines, stations } from './Subway';

const colorMatch = [
  'match',
  ['get', 'LINE'],
  'RED',
  '#F5403B',
  'GREEN',
  '#2C975F',
  'ORANGE',
  '#F79517',
  'BLUE',
  '#2A68CA',
  /* other */ '#ccc',
];

const SUBWAY_LINES_SOURCE = 'subway_lines_source';
const SUBWAY_STATIONS_SOURCE = 'subway_stations_source';
export const SUBWAY_SOURCE_IDS = [SUBWAY_LINES_SOURCE, SUBWAY_STATIONS_SOURCE];

const SUBWAY_LINES_LAYER = 'subway_lines_layer';
const SUBWAY_STATIONS_LAYER = 'subway_stations_layer';
export const SUBWAY_LAYER_IDS = [SUBWAY_LINES_LAYER, SUBWAY_STATIONS_LAYER];

export default function Subway() {
  return (
    <>
      {/*
      // @ts-ignore */}
      <Source id={SUBWAY_LINES_SOURCE} type="geojson" data={lines}>
        <Layer
          id={SUBWAY_LINES_LAYER}
          type="line"
          layout={{ visibility: 'none' }}
          paint={{
            'line-width': 1.5,
            // @ts-ignore
            'line-color': colorMatch,
          }}
        />
      </Source>
      {/*
      // @ts-ignore */}
      <Source id={SUBWAY_STATIONS_SOURCE} type="geojson" data={stations}>
        <Layer
          id={SUBWAY_STATIONS_LAYER}
          type="circle"
          layout={{ visibility: 'none' }}
          paint={{
            'circle-radius': 2.75,
            // @ts-ignore
            'circle-color': colorMatch,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
      </Source>
    </>
  );
}
