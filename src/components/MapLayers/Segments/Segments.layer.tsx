import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl';
import { featureCollection } from '@turf/turf';
import { useMediaQuery } from '@mantine/hooks';
import { SegmentStates } from '@/pages/TrailMap/TrailMap.config';
import { Hover } from '@/pages/TrailMap/TrailMap.page';
import { SegmentState } from '@/types';
import data from '../../../data.json';

export const segmentsLayerId = 'segments';

export interface SegmentsLayerProps {
  states: SegmentStates;
  hover: Hover | undefined;
}

export default function SegmentsLayer({ states, hover }: SegmentsLayerProps) {
  const multiplier = useMediaQuery('(min-width: 415px)') ? 1 : 1.5;

  const segments: GeoJSON.FeatureCollection<GeoJSON.Geometry> = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: data.segments.map(({ id, geometry, state }) => ({
        id,
        type: 'Feature',
        geometry: geometry as GeoJSON.MultiLineString,
        properties: {
          state,
        },
      })),
    }),
    [data]
  );

  const styledSegments = useMemo(
    () =>
      featureCollection(
        segments.features.map((feature) => {
          const { properties } = feature;
          if (properties) {
            return {
              ...feature,
              properties: {
                ...properties,
                weight: states[properties.state].weight,
                style: states[properties.state].style,
              },
            };
          }
          return feature;
        })
      ),
    [segments, states]
  );

  const visibleStates = Object.entries(states)
    .filter(([, value]) => value.visible)
    .map(([key]) => key as SegmentState);

  const hoveredId = hover && hover.layer === segmentsLayerId ? hover.id : null;

  const colorMatchExpression: mapboxgl.Expression = useMemo(
    () => [
      'match',
      ['get', 'state'],
      ...visibleStates.reduce((acc, state) => {
        acc.push(state, states[state].color);
        return acc;
      }, [] as string[]),
      '#ff0000', // default color
    ],
    [states]
  );

  const paintExpression: mapboxgl.LinePaint = {
    'line-width': [
      'case',
      // thicker when hovered
      ['==', ['id'], hoveredId],
      6,
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
    'line-dasharray': [
      'match',
      ['get', 'style'],
      // dashed
      'dashed',
      ['literal', [3, 1.5]],
      // solid
      ['literal', [1, 0]],
    ],
    'line-color': colorMatchExpression,
  };

  return (
    <Source type="geojson" data={styledSegments}>
      <Layer
        id={segmentsLayerId}
        type="line"
        paint={{ 'line-width': 30, 'line-opacity': 0 }}
        filter={['in', 'state', ...visibleStates]}
      />
      <Layer
        id={`${segmentsLayerId}_symbology`}
        type="line"
        paint={paintExpression}
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
        filter={['in', 'state', ...visibleStates]}
      />
    </Source>
  );
}
