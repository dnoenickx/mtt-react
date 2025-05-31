import React from 'react';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { featureCollection } from '@turf/turf';
import { useSubwayData } from './useSubwayData';
import { useLayerVisibility } from '@/pages/TrailMap/context/LayerVisibilityContext';

export const SUBWAY_IDS = {
  sources: {
    lines: 'subway_lines_source',
    stations: 'subway_stations_source',
  },
  layers: {
    lines: 'subway_lines_layer',
    stations: 'subway_stations_layer',
    hover: 'subway_stations_interactive_layer',
  },
};


export const SUBWAY_LAYER_TO_SOURCE = {
  [SUBWAY_IDS.layers.hover]: SUBWAY_IDS.sources.stations,
};

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
  // other
  '#ccc',
];

interface SubwayLayerProps {
  mapRef: React.RefObject<MapRef>;
}

export function SubwayLayer({ mapRef }: SubwayLayerProps) {
  const { isLayerVisible } = useLayerVisibility();
  const visible = isLayerVisible('subway');
  const visibility = visible ? 'visible' : 'none';

  const { data } = useSubwayData(visible);
  const stations = data?.stations ?? featureCollection([]);
  const lines = data?.lines ?? featureCollection([]);

  return (
    <>
      <Source id={SUBWAY_IDS.sources.lines} type="geojson" data={lines}>
        <Layer
          id={SUBWAY_IDS.layers.lines}
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            // @ts-ignore
            'line-color': colorMatch,
          }}
        />
      </Source>

      <Source id={SUBWAY_IDS.sources.stations} type="geojson" data={stations}>
        <Layer
          id={SUBWAY_IDS.layers.stations}
          type="circle"
          layout={{ visibility }}
          paint={{
            'circle-radius': 2.75,
            // @ts-ignore
            'circle-color': colorMatch,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
        <Layer
          id={SUBWAY_IDS.layers.hover}
          type="circle"
          layout={{ visibility }}
          paint={{ 'circle-radius': 5, 'circle-opacity': 0 }}
        />
      </Source>
    </>
  );
}
