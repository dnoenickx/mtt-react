import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import { useMediaQuery } from '@mantine/hooks';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import DATA from '../../../data.json';

export const SEGMENTS_SOURCE_ID = 'segments_source';
export const SEGMENTS_SYMBOLOGY_LAYER_ID = 'segments_symbology_layer';
export const SEGMENTS_HOVER_LAYER_ID = 'segments_hover_layer';

export default function SegmentsLayer() {
  const multiplier = useMediaQuery('(min-width: 415px)') ? 1 : 1.5;

  const styledSegments: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: DATA.segments.map(({ id, geometry, state }) => ({
        id,
        type: 'Feature',
        geometry: geometry as GeoJSON.MultiLineString,
        properties: {
          state,
          weight: SEGMENT_STATES[state]?.weight,
          style: SEGMENT_STATES[state]?.style,
        },
      })),
    };
  }, []);

  return (
    <Source id={SEGMENTS_SOURCE_ID} type="geojson" data={styledSegments}>
      <Layer
        id={SEGMENTS_HOVER_LAYER_ID}
        type="line"
        paint={{ 'line-width': 25, 'line-opacity': 0 }}
      />
      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYER_ID}
        type="line"
        paint={{
          'line-width': [
            'case',
            // thicker when hovered
            ['boolean', ['feature-state', 'hover'], false],
            10,
            // heavy thickness
            ['==', ['get', 'weight'], 'heavy'],
            2.5 * multiplier,
            // medium thickness
            ['==', ['get', 'weight'], 'medium'],
            2.25 * multiplier,
            // light thickness
            ['==', ['get', 'weight'], 'light'],
            1.5 * multiplier,
            // thinner otherwise
            1 * multiplier,
          ],
          // @ts-ignore
          'line-color': [
            'match',
            ['get', 'state'],
            ...Object.entries(SEGMENT_STATES).flatMap(([state, { color }]) => [state, color]),
            '#ff0000', // default color
          ],
        }}
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
      />
    </Source>
  );
}
