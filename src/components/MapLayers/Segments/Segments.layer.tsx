import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl';
import { Feature, feature, featureCollection, Properties } from '@turf/turf';
import { Geometry } from 'geojson';
import { useMediaQuery } from '@mantine/hooks';
import { SegmentStates } from '@/pages/TrailMap/TrailMap.config';
import { Hover } from '@/pages/TrailMap/TrailMap.page';
import { SegmentState } from '@/types';
import { useData } from '@/data/DataContext';

export const segmentsLayerId = 'segments';

export interface SegmentsLayerProps {
  states: SegmentStates;
  hover: Hover | undefined;
}

export default function SegmentsLayer({ states, hover }: SegmentsLayerProps) {
  const { segments } = useData();

  const multiplier = useMediaQuery('(min-width: 415px)') ? 1 : 1.5;

  const segmentGeoJson = useMemo(
    () =>
      featureCollection(
        segments.reduce(
          (features, segment) => {
            if (segment) {
              features.push(
                feature(
                  segment.geometry,
                  {
                    state: segment.state,
                    weight: states[segment.state].weight,
                    style: states[segment.state].style,
                  },
                  {
                    id: segment.id,
                  }
                )
              );
            }
            return features;
          },
          [] as Feature<Geometry, Properties>[]
        )
      ),
    [segments]
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
      ['literal', [3, 1]],
      // solid
      ['literal', [1, 0]],
    ],
    'line-color': colorMatchExpression,
  };

  return (
    <Source type="geojson" data={segmentGeoJson}>
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
