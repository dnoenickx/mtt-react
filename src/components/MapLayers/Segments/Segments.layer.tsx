import React, { useEffect, useMemo } from 'react';
import { feature, featureCollection } from '@turf/turf';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { useMediaQuery } from '@mantine/hooks';
import { useMantineColorScheme } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/components/DataProvider/DataProvider';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import {
  getSegmentIds,
  getTrailIds,
} from '@/pages/TrailMap/components/TrailMapComponent/utils/initialBounds';
import { useLayerManager } from '@/pages/TrailMap/context/LayerManagerContext';

const SEGMENTS_SOURCE_ID = 'segments_source';

export const SEGMENTS_INTERACTIVE_LAYER_ID = 'segments_interactive_layer';

const SEGMENTS_SYMBOLOGY_LAYERS = {
  highlight2: 'segments_symbology_highlight_2',
  highlight1: 'segments_symbology_highlight_1',
  white: 'segments_symbology_white',
  solid: 'segments_symbology_solid',
  dashed: 'segments_symbology_dashed',
} as const;

export const SEGMENTS_SYMBOLOGY_LAYER_IDS = Object.values(SEGMENTS_SYMBOLOGY_LAYERS);

/**
 * Updates the filter for segment layers based on the visible states
 * @param map The MapLibre map instance
 * @param visibleStates Array of state names that should be visible
 */
export const updateSegmentFilters = (map: maplibregl.Map, visibleStates: string[]) => {
  if (!map) return;

  // Check if all required layers exist
  if (!SEGMENTS_SYMBOLOGY_LAYER_IDS.every((layerId) => map.getLayer(layerId))) {
    return;
  }

  // If no states are selected, hide all segments
  if (visibleStates.length === 0) {
    const hideAllFilter: any = ['==', ['get', 'state'], ''];
    SEGMENTS_SYMBOLOGY_LAYER_IDS.forEach((layerId) => {
      map.setFilter(layerId, hideAllFilter);
    });
    map.setFilter(SEGMENTS_INTERACTIVE_LAYER_ID, hideAllFilter);
    return;
  }

  // Create the state filter expression
  const stateFilter: any = ['match', ['get', 'state'], visibleStates, true, false];

  SEGMENTS_SYMBOLOGY_LAYER_IDS.forEach((layerId) => {
    if (layerId === 'segments_symbology_dashed') {
      // Filter for dashed segments that match the visible states
      const dashedFilter: any = ['all', ['has', 'dashedWidth'], stateFilter];
      map.setFilter(layerId, dashedFilter);
    } else if (layerId.startsWith('segments_symbology_highlight')) {
      // Filter for highlighted segments that match the visible states
      const highlightFilter: any = ['all', ['==', ['get', 'highlight'], true], stateFilter];
      map.setFilter(layerId, highlightFilter);
    } else {
      // Basic state filter for other layers
      map.setFilter(layerId, stateFilter);
    }
  });

  // Also update the interactive layer
  map.setFilter(SEGMENTS_INTERACTIVE_LAYER_ID, stateFilter);
};

const BEFORE_ID = 'pois';

interface SegmentsLayerProps {
  mapRef: React.RefObject<MapRef>;
  opacity?: number;
  excludeId?: number;
  interactive?: boolean;
  onSegmentClick?: (id: string) => void;
}

export function SegmentsLayer({
  mapRef,
  opacity = 1,
  excludeId,
  interactive = true,
  onSegmentClick,
}: SegmentsLayerProps) {
  const layerManager = interactive ? useLayerManager() : undefined;
  const isMobile = useMediaQuery('(min-width: 415px)');
  const [searchParams] = useSearchParams();
  const { currentData } = useData();
  const { colorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Constants for line widths
  const HOVER_TARGET = 22;
  const HOVERED = 6;
  const HEAVY = 2.75;
  const MEDIUM = 2.5;
  const LIGHT = 2.25;

  const styledSegments = useMemo(() => {
    const outline = (val: number) => (isDarkMode ? val + 0.5 : val + 2);
    const multiplier = (val: number) => (isMobile ? val : val * 1.5);
    const dashed = (val: number) => val / 1.25;

    const segmentIds = getSegmentIds(searchParams);
    const trailIds = getTrailIds(searchParams, currentData);

    const features = Object.values(currentData.segments)
      .filter((segment) => excludeId === undefined || segment.id !== excludeId)
      .map(({ id, geometry, state, trails }) => {
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

        return feature(geometry, properties, { id });
      });

    return featureCollection(features);
  }, [isMobile, currentData.segments, isDarkMode, excludeId]);

  useEffect(() => {
    if (!interactive || !layerManager) return;
    // register hover handler with context
    layerManager.registerHoverHandler(SEGMENTS_INTERACTIVE_LAYER_ID, (e, featureId, isEntering) => {
      if (!mapRef.current || !featureId) {
        return;
      }
      const map = mapRef.current.getMap();

      if (isEntering) {
        // Set hover
        map.setFeatureState({ source: SEGMENTS_SOURCE_ID, id: featureId }, { hover: true });
        map.getCanvas().style.cursor = 'pointer';
      } else {
        // Clear hover
        map.setFeatureState({ source: SEGMENTS_SOURCE_ID, id: featureId }, { hover: false });
        map.getCanvas().style.cursor = 'grab';
      }
    });

    layerManager.registerClickHandler(SEGMENTS_INTERACTIVE_LAYER_ID, (e) => {
      const featureId = e.features?.[0].id as number;
      onSegmentClick?.(featureId.toString());
    });
  }, []);

  return (
    <Source id={SEGMENTS_SOURCE_ID} type="geojson" data={styledSegments}>
      <Layer
        id={SEGMENTS_INTERACTIVE_LAYER_ID}
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
          'line-opacity': 0.4 * opacity,
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
          'line-opacity': 0.4 * opacity,
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
          'line-opacity': opacity,
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
          'line-opacity': opacity,
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
          'line-opacity': opacity,
        }}
        filter={['has', 'dashedWidth']}
        layout={{
          'line-join': 'round',
        }}
      />
    </Source>
  );
}
