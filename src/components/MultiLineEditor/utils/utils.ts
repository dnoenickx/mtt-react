import { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import {
  FeatureCollection,
  Position,
  LineString,
  Feature,
  MultiLineString,
  lineString,
  GeometryCollection,
} from '@turf/turf';

// Generate a unique numeric ID
export function generateUniqueId(): number {
  return Math.floor(Math.random() * 1000000000);
}

export const getMousePoint = (e: MapLayerMouseEvent): Position => [e.lngLat.lng, e.lngLat.lat];

export function convertToLines(geojson: FeatureCollection): Feature<LineString>[] {
  const lineStrings = geojson.features.filter(
    (feature): feature is Feature<LineString> => feature.geometry?.type === 'LineString'
  );

  const multiLineStrings = geojson.features
    .filter(
      (feature): feature is Feature<MultiLineString> => feature.geometry?.type === 'MultiLineString'
    )
    .flatMap((multiFeature) =>
      multiFeature.geometry.coordinates.map((coords) => lineString(coords))
    );

  const geometryCollections = geojson.features
    .filter(
      (feature): feature is Feature<GeometryCollection> =>
        feature.geometry?.type === 'GeometryCollection'
    )
    .flatMap((collectionFeature) =>
      collectionFeature.geometry.geometries
        .filter(
          (geom): geom is LineString | MultiLineString =>
            geom.type === 'LineString' || geom.type === 'MultiLineString'
        )
        .flatMap((geom) =>
          geom.type === 'LineString'
            ? lineString(geom.coordinates)
            : geom.coordinates.map((coords) => lineString(coords))
        )
    );

  const combined = [...lineStrings, ...multiLineStrings, ...geometryCollections];
  combined.forEach((feature) => {
    feature.id = feature.id ?? generateUniqueId();
  });

  return combined;
}
