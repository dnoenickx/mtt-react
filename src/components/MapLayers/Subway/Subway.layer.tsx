import React, { RefObject, useRef } from 'react';
import { Layer, Source, MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import { updateHover } from '@/mapUtils';
import { LayerHook } from '@/pages/TrailMap/context/MapContext';
import { featureCollection } from '@turf/turf';
import { useSubwayData } from './useSubwayData';

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

// Layer IDs for Subway
const SUBWAY_LINES_SOURCE = 'subway_lines_source';
const SUBWAY_STATIONS_SOURCE = 'subway_stations_source';
const SUBWAY_LINES_LAYER = 'subway_lines_layer';
const SUBWAY_STATIONS_LAYER = 'subway_stations_layer';
const SUBWAY_STATIONS_HOVER_LAYER = 'subway_stations_hover_layer';

interface SubwayLayerProps {
  mapRef: RefObject<MapRef>;
  visible?: boolean;
}

export function useSubwayLayer({ mapRef, visible = true }: SubwayLayerProps): LayerHook {
  const hoveredStationId = useRef<number | undefined>(undefined);
  const visibility = visible ? 'visible' : 'none';

  const { data } = useSubwayData(visible);
  const stations = data?.stations ?? featureCollection([]);
  const lines = data?.lines ?? featureCollection([]);

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    updateHover({
      mapRef,
      e,
      source: SUBWAY_STATIONS_SOURCE,
      layers: [SUBWAY_STATIONS_HOVER_LAYER],
      hoveredId: hoveredStationId,
      defaultCursor: '',
      hoverCursor: 'pointer',
    });
  };

  const render = () => (
    <>
      <Source id={SUBWAY_LINES_SOURCE} type="geojson" data={lines}>
        <Layer
          id={SUBWAY_LINES_LAYER}
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            // @ts-ignore
            'line-color': colorMatch,
          }}
        />
      </Source>

      <Source id={SUBWAY_STATIONS_SOURCE} type="geojson" data={stations}>
        <Layer
          id={SUBWAY_STATIONS_LAYER}
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
          id={SUBWAY_STATIONS_HOVER_LAYER}
          type="circle"
          layout={{ visibility }}
          paint={{ 'circle-radius': 5, 'circle-opacity': 0 }}
        />
      </Source>
    </>
  );

  return {
    handleMouseMove,
    interactiveLayerIds: [SUBWAY_STATIONS_HOVER_LAYER],
    render,
  };
}
