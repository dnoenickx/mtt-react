import React from 'react';
import { MapLayerMouseEvent, MapRef, MapGeoJSONFeature } from 'react-map-gl/maplibre';
import { DataDrivenPropertyValueSpecification } from '@maplibre/maplibre-gl-style-spec';

interface updateHoverParams {
  mapRef: React.RefObject<MapRef>;
  e: MapLayerMouseEvent;
  source: string;
  layers: string[];
  hoveredId: React.MutableRefObject<number | undefined>;
  defaultCursor?: string;
  hoverCursor?: string;
}

export function updateHover({
  mapRef,
  e,
  source,
  layers,
  hoveredId,
  defaultCursor = 'grab',
  hoverCursor = 'pointer',
}: updateHoverParams): MapGeoJSONFeature[] {
  const map = mapRef.current;
  if (!map) return [];

  const features = map.queryRenderedFeatures(e.point, { layers });

  const prev = hoveredId.current;
  const current = features.length > 0 ? Number(features[0].id) : undefined;

  const beganHover = prev === undefined && current !== undefined;
  const endedHover = prev !== undefined && current === undefined;
  const changedHoveredObject = prev !== undefined && current !== undefined && current !== prev;

  if (endedHover || changedHoveredObject) {
    map.setFeatureState({ source, id: prev }, { hover: false });
    if (endedHover) {
      hoveredId.current = undefined;
      map.getCanvas().style.cursor = defaultCursor;
    }
  }

  if (beganHover || changedHoveredObject) {
    map.setFeatureState({ source, id: current }, { hover: true });
    hoveredId.current = current;
    map.getCanvas().style.cursor = hoverCursor;
  }

  return features;
}

export const ifHovered = <T>(
  hoverValue: T,
  defaultValue: T
): DataDrivenPropertyValueSpecification<T> =>
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    hoverValue,
    defaultValue,
  ] as DataDrivenPropertyValueSpecification<T>;

export const featuresByLayer = (e: MapLayerMouseEvent): Record<string, GeoJSON.Feature[]> => {
  if (!e.features) {
    return {};
  }

  const groupedFeatures = e.features.reduce(
    (acc, feature) => {
      const layerId = feature.layer.id;
      acc[layerId] = acc[layerId] || [];
      acc[layerId].push(feature);
      return acc;
    },
    {} as Record<string, GeoJSON.Feature[]>
  );

  return groupedFeatures;
};
