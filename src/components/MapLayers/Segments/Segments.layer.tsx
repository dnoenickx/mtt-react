import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl';
import { SegmentStates } from '@/pages/TrailMap/TrailMap.config';
import { Hover } from '@/pages/TrailMap/TrailMap.page';
import { SegmentState } from '@/types';
import { Feature, feature, featureCollection, Properties } from '@turf/turf';
import { useData } from '@/data/DataContext';
import { Geometry } from 'geojson';

export const segmentsLayerName = 'segments';

export interface SegmentsLayerProps {
  states: SegmentStates;
  hover: Hover | undefined;
}

export default function SegmentsLayer({ states, hover }: SegmentsLayerProps) {
  const { segments } = useData();

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
    .filter(([key, value]) => value.visible)
    .map(([key]) => key as SegmentState);

  const hoveredId = hover && hover.layer === segmentsLayerName ? hover.id : null;

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
      2.5,
      // medium thickness
      ['==', ['get', 'weight'], 'medium'],
      2.25,
      // light thickness
      ['==', ['get', 'weight'], 'light'],
      1.5,
      // thinner otherwise
      1,
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
        id={segmentsLayerName}
        type="line"
        paint={paintExpression}
        filter={['in', 'state', ...visibleStates]}
      />
    </Source>
  );
}
