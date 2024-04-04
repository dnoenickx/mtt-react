import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl';
import { trails } from './trails';
import { TrailStates } from '@/pages/TrailMap/TrailMap.config';
import { Hover } from '@/pages/TrailMap/TrailMap.page';

export interface TrailsProps {
  states: TrailStates;
  hover: Hover | undefined;
}

export default function TrailsLayer({ states, hover }: TrailsProps) {
  const filteredStates = Object.keys(states).filter((key) => states[key].visible);
  const filter = ['in', 'state', ...filteredStates];

  const hoveredId = hover && hover.layer === 'trails' ? hover.id : null;

  const colorMatchExpression: mapboxgl.Expression = useMemo(
    () => [
      'match',
      ['get', 'state'],
      ...filteredStates.reduce((acc, state) => {
        acc.push(state, states[state].color);
        return acc;
      }, [] as string[]),
      '#000000', // default color
    ],
    [states]
  );

  const paintExpression: mapboxgl.LinePaint = {
    'line-width': [
      'case',
      ['==', ['id'], hoveredId],
      6, // thicker when hovered
      3, // thinner otherwise
    ],
    'line-color': colorMatchExpression,
  };

  return (
    // @ts-ignore
    <Source type="geojson" data={trails}>
      <Layer id="trails" type="line" paint={paintExpression} filter={filter} />
    </Source>
  );
}