import React, { useMemo } from 'react';
import { FeatureCollection, MultiLineString } from '@turf/turf';
import { Layer, Source } from 'react-map-gl/maplibre';
import { useMediaQuery } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import { useData } from '@/components/DataProvider/DataProvider';
import { createSlug } from '@/utils';
import { useMantineColorScheme } from '@mantine/core';

export const SEGMENTS_SOURCE_ID = 'segments_source';
export const SEGMENTS_HOVER_LAYER_ID = 'segments_hover_layer';
const SEGMENTS_SYMBOLOGY_LAYERS = {
  highlight2: 'segments_symbology_highlight_2',
  highlight1: 'segments_symbology_highlight_1',
  white: 'segments_symbology_white',
  solid: 'segments_symbology_solid',
  dashed: 'segments_symbology_dashed',
};
export const SEGMENTS_SYMBOLOGY_LAYER_IDS = Object.values(SEGMENTS_SYMBOLOGY_LAYERS);

const BEFORE_ID = 'pois';

export default function SegmentsLayer() {
  const isMobile = useMediaQuery('(min-width: 415px)');
  const { currentData } = useData();
  const { colorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [searchParams] = useSearchParams();

  const segmentParam = searchParams.get('segment');
  const segmentIds = segmentParam ? segmentParam.split(',').map((id) => Number(id)) : [];

  const trailNames = (searchParams.get('trail') ?? '').split(',');
  const trailIds = Object.values(currentData.trails)
    .filter(
      (trail) =>
        trailNames.includes(createSlug(trail.name)) ||
        (trail.slug && trailNames.includes(trail.slug))
    )
    .map(({ id }) => id);

  // Constants for line widths
  const HOVER_TARGET = 22;
  const HOVERED = 6;
  const HEAVY = 2.75;
  const MEDIUM = 2.5;
  const LIGHT = 2.25;

  const outline = (val: number) => (isDarkMode ? val + 0.5 : val + 2);
  const multiplier = (val: number) => (isMobile ? val : val * 1.5);
  const dashed = (val: number) => val / 1.25;

  const styledSegments: FeatureCollection<MultiLineString> = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: Object.values(currentData.segments).map(({ id, geometry, state, trails }) => {
        // Determine the base width value
        const weights = { heavy: HEAVY, medium: MEDIUM, light: LIGHT };
        const baseWidth = multiplier(weights[SEGMENT_STATES[state]?.weight] || LIGHT);
        const isDashed = SEGMENT_STATES[state]?.style === 'dashed';
        const isHighlighted =
          segmentIds.includes(id) || trails.some((trailId) => trailIds.includes(trailId));

        const properties = {
          state,
          // Pre-calculated widths
          baseWidth,
          outlineWidth: outline(baseWidth),
          // Hover state widths
          hoverWidth: HOVERED,
          hoverOutlineWidth: outline(HOVERED),
          // Original color from segment state
          color: SEGMENT_STATES[state]?.color || '#ff0000',
          // Optional dash widths
          ...(isDashed
            ? { hoverDashedWidth: dashed(HOVERED), dashedWidth: dashed(baseWidth) }
            : {}),
          // Optional highlight
          ...(isHighlighted ? { highlight: true } : {}),
        };

        return {
          id,
          type: 'Feature',
          geometry,
          properties,
        };
      }),
    }),
    [isMobile, currentData.segments, isDarkMode]
  );

  return (
    <Source id={SEGMENTS_SOURCE_ID} type="geojson" data={styledSegments}>
      <Layer
        id={SEGMENTS_HOVER_LAYER_ID}
        type="line"
        paint={{ 'line-width': HOVER_TARGET, 'line-opacity': 0 }}
      />
      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYERS.highlight2}
        type="line"
        beforeId={BEFORE_ID}
        filter={['==', ['get', 'highlight'], true]}
        paint={{
          'line-width': 12,
          'line-color': isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 0, 0.4)',
          'line-opacity': 0.4,
        }}
        layout={{
          'line-join': 'bevel',
          'line-cap': 'round',
        }}
      />
      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYERS.highlight1}
        type="line"
        beforeId={BEFORE_ID}
        filter={['==', ['get', 'highlight'], true]}
        paint={{
          'line-width': 8,
          'line-color': isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 0, 0.3)',
          'line-opacity': 0.4,
        }}
        layout={{
          'line-join': 'bevel',
          'line-cap': 'round',
        }}
      />

      <Layer
        id={SEGMENTS_SYMBOLOGY_LAYERS.white}
        type="line"
        beforeId={BEFORE_ID}
        paint={{
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            ['get', 'hoverOutlineWidth'],
            ['get', 'outlineWidth'],
          ],
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
            ['get', 'hoverWidth'],
            ['get', 'baseWidth'],
          ],
          'line-color': ['get', 'color'],
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
            ['get', 'hoverDashedWidth'],
            ['get', 'dashedWidth'],
          ],
          'line-color': '#ffffff',
          'line-dasharray': ['literal', [1, 2.5]],
        }}
        filter={['has', 'dashedWidth']}
        layout={{
          'line-join': 'round',
        }}
      />
    </Source>
  );
}
