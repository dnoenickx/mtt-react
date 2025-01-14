import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import { useMediaQuery } from '@mantine/hooks';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import { useData } from '@/components/DataProvider/DataProvider';

export const SEGMENTS_SOURCE_ID = 'segments_source';
export const SEGMENTS_HOVER_LAYER_ID = 'segments_hover_layer';
const SEGMENTS_SYMBOLOGY_LAYERS = {
  white: 'segments_symbology_white',
  solid: 'segments_symbology_solid',
  dashed: 'segments_symbology_dashed',
};
export const SEGMENTS_SYMBOLOGY_LAYER_IDS = Object.values(SEGMENTS_SYMBOLOGY_LAYERS);

const BEFORE_ID = 'pois';

export default function SegmentsLayer() {
  const isMobile = useMediaQuery('(min-width: 415px)');
  const { currentData } = useData();

  const styledSegments: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: Object.values(currentData.segments).map(({ id, geometry, state }) => ({
        id,
        type: 'Feature',
        geometry: geometry as GeoJSON.MultiLineString,
        properties: {
          state,
          weight: SEGMENT_STATES[state]?.weight,
          style: SEGMENT_STATES[state]?.style,
        },
      })),
    }),
    []
  );

  const HOVER_TARGET = 22;
  const HOVERED = 8;
  const HEAVY = 2.75;
  const MEDIUM = 2.5;
  const LIGHT = 2.25;

  const outline = (val: number) => val + 2;
  const multiplier = (val: number) => (isMobile ? val : val * 1.5);
  const dashed = (val: number) => val / 1.25;

  return (
    <Source id={SEGMENTS_SOURCE_ID} type="geojson" data={styledSegments}>
      <Layer
        id={SEGMENTS_HOVER_LAYER_ID}
        type="line"
        paint={{ 'line-width': HOVER_TARGET, 'line-opacity': 0 }}
      />
      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYERS.white}
        type="line"
        beforeId={BEFORE_ID}
        paint={{
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            outline(HOVERED),
            ['==', ['get', 'weight'], 'heavy'],
            outline(multiplier(HEAVY)),
            ['==', ['get', 'weight'], 'medium'],
            outline(multiplier(MEDIUM)),
            // else light
            outline(multiplier(LIGHT)),
          ],
          // @ts-ignore
          'line-color': '#ffffff',
        }}
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
      />
      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYERS.solid}
        type="line"
        beforeId={BEFORE_ID}
        paint={{
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            HOVERED,
            ['==', ['get', 'weight'], 'heavy'],
            multiplier(HEAVY),
            ['==', ['get', 'weight'], 'medium'],
            multiplier(MEDIUM),
            // else light
            multiplier(LIGHT),
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

      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYERS.dashed}
        type="line"
        beforeId={BEFORE_ID}
        paint={{
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            dashed(HOVERED),
            ['==', ['get', 'weight'], 'heavy'],
            dashed(multiplier(HEAVY)),
            ['==', ['get', 'weight'], 'medium'],
            dashed(multiplier(MEDIUM)),
            // else light
            dashed(multiplier(LIGHT)),
          ],
          'line-color': '#ffffff',
          'line-dasharray': ['literal', [1, 2.5]],
        }}
        filter={['==', ['get', 'style'], 'dashed']} // filter only dashed
        layout={{
          'line-join': 'round',
        }}
      />
    </Source>
  );
}
