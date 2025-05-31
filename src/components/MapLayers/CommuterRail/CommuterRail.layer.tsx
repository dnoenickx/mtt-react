import React from 'react';
import { featureCollection } from '@turf/turf';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { useCommuterRailData } from './useCommuterRailData';
import { useLayerVisibility } from '@/pages/TrailMap/context/LayerVisibilityContext';

const COMMUTER_RAIL_LINES_SOURCE = 'commuter_rail_lines_source';
const COMMUTER_RAIL_STATIONS_SOURCE = 'commuter_rail_stations_source';

const COMMUTER_RAIL_STATIONS_LAYER = 'commuter_rail_stations_layer';
const COMMUTER_RAIL_LINES_LAYER = 'commuter_rail_lines_layer';
export const COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER = 'commuter_rail_stations_interactive_layer';


export const COMMUTER_RAIL_LAYER_TO_SOURCE = {
  [COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER]: COMMUTER_RAIL_STATIONS_SOURCE,
  // [COMMUTER_RAIL_LINES_LAYER]: COMMUTER_RAIL_LINES_SOURCE,
};

interface CommuterRailLayerProps {
  mapRef: React.RefObject<MapRef>;
}

export function CommuterRailLayer({ mapRef }: CommuterRailLayerProps) {
  const { isLayerVisible } = useLayerVisibility();
  const visible = isLayerVisible('commuterRail');
  const visibility = visible ? 'visible' : 'none';

  const { data } = useCommuterRailData(visible);
  const stations = data?.stations ?? featureCollection([]);
  const lines = data?.lines ?? featureCollection([]);

  return (
    <>
      <Source id={COMMUTER_RAIL_LINES_SOURCE} type="geojson" data={lines}>
        <Layer
          id={COMMUTER_RAIL_LINES_LAYER}
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            'line-color': '#B3439E',
          }}
        />
      </Source>

      <Source id={COMMUTER_RAIL_STATIONS_SOURCE} type="geojson" data={stations}>
        <Layer
          id={COMMUTER_RAIL_STATIONS_LAYER}
          type="circle"
          layout={{ visibility }}
          paint={{
            'circle-radius': 2.75,
            'circle-color': '#B3439E',
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
        <Layer
          id={COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER}
          type="circle"
          layout={{ visibility }}
          paint={{ 'circle-radius': 5, 'circle-opacity': 0 }}
        />
      </Source>
    </>
  );
}
