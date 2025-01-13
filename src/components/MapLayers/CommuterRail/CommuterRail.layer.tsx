import { Layer, Source } from 'react-map-gl/maplibre';
import { lines, stations } from './CommuterRail';

const COMMUTER_RAIL_LINES_SOURCE = 'commuter_rail_lines_source';
const COMMUTER_RAIL_STATIONS_SOURCE = 'commuter_rail_stations_source';
export const COMMUTER_RAIL_SOURCE_IDS = [COMMUTER_RAIL_LINES_SOURCE, COMMUTER_RAIL_STATIONS_SOURCE];

const COMMUTER_RAIL_LINES_LAYER = 'commuter_rail_lines_layer';
const COMMUTER_RAIL_STATIONS_LAYER = 'commuter_rail_stations_layer';
export const COMMUTER_RAIL_LAYER_IDS = [COMMUTER_RAIL_LINES_LAYER, COMMUTER_RAIL_STATIONS_LAYER];

export default function CommuterRailLayer() {
  return (
    <>
      {/*
      // @ts-ignore */}
      <Source id={COMMUTER_RAIL_LINES_SOURCE} type="geojson" data={lines}>
        <Layer
          id={COMMUTER_RAIL_LINES_LAYER}
          type="line"
          layout={{ visibility: 'none' }}
          paint={{
            'line-width': 1.5,
            'line-color': '#B3439E',
          }}
        />
      </Source>
      {/*
      // @ts-ignore */}
      <Source id={COMMUTER_RAIL_STATIONS_SOURCE} type="geojson" data={stations}>
        <Layer
          id={COMMUTER_RAIL_STATIONS_LAYER}
          type="circle"
          layout={{ visibility: 'none' }}
          paint={{
            'circle-radius': 2.75,
            'circle-color': '#B3439E',
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
      </Source>
    </>
  );
}
