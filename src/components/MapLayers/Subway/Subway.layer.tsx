import React, { useEffect } from 'react';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { featureCollection } from '@turf/turf';
import { useSubwayData } from './useSubwayData';
import { useLayerVisibility } from '@/pages/TrailMap/context/LayerVisibilityContext';
import { DataDrivenPropertyValueSpecification } from 'maplibre-gl';

const colorMatch: DataDrivenPropertyValueSpecification<string> = [
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
  const { isLayerVisible, registerToggle } = useLayerVisibility();

  const visible = isLayerVisible('subway');
  const visibility = visible ? 'visible' : 'none';

  const { data } = useSubwayData(visible);
  const stations = data?.stations ?? featureCollection([]);
  const lines = data?.lines ?? featureCollection([]);

  useEffect(() => {
    // register toggle with context
    registerToggle({
      id: 'subway',
      label: 'Subway',
      visible,
      layerIds: ['subway_lines_layer', 'subway_stations_layer'],
    });
  }, []);

  return (
    <>
      <Source id="subway_lines_source" type="geojson" data={lines}>
        <Layer
          id="subway_lines_layer"
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            'line-color': colorMatch,
          }}
        />
      </Source>

      <Source id="subway_stations_source" type="geojson" data={stations}>
        <Layer
          id="subway_stations_layer"
          type="circle"
          layout={{ visibility }}
          paint={{
            'circle-radius': 2.75,
            'circle-color': colorMatch,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
      </Source>
    </>
  );
}
