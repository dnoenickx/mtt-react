import { LngLatBoundsLike } from 'react-map-gl/maplibre';
import { bbox, feature, featureCollection } from '@turf/turf';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
import TOWN_BOUNDING_BOXES from './town_bbox.json';
import { MappedOriginal } from '@/types';
import { createSlug } from '@/utils';

export interface InitialBounds {
  bounds: LngLatBoundsLike;
  fitBoundsOptions: {
    padding: number;
  };
}

/**
 * Extracts comma-separated values from a URL search parameter
 */
function getParamValues(searchParams: URLSearchParams, paramName: string): string[] {
  return (searchParams.get(paramName) || '').split(',').filter(Boolean); // Remove empty strings
}

/**
 * Formats a bounding box into the format expected by react-map-gl
 */
function formatBounds(bounds: BBox2d, padding: number = 50): InitialBounds {
  return {
    bounds: [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ] as LngLatBoundsLike,
    fitBoundsOptions: {
      padding,
    },
  };
}

/**
 * Gets bounds for specified towns
 */
function getTownBounds(searchParams: URLSearchParams): InitialBounds | undefined {
  const townNames = getParamValues(searchParams, 'town');
  if (!townNames.length) return undefined;

  const mergedBounds: BBox2d = townNames
    .filter((name): name is keyof typeof TOWN_BOUNDING_BOXES => name in TOWN_BOUNDING_BOXES)
    .reduce(
      (bounds, name) => {
        const townBbox = TOWN_BOUNDING_BOXES[name];
        return [
          Math.min(bounds[0], townBbox[0]),
          Math.min(bounds[1], townBbox[1]),
          Math.max(bounds[2], townBbox[2]),
          Math.max(bounds[3], townBbox[3]),
        ];
      },
      [Infinity, Infinity, -Infinity, -Infinity]
    );

  if (mergedBounds[0] !== Infinity) {
    return formatBounds(mergedBounds);
  }

  return undefined;
}

/**
 * Gets trail IDs from trail names in search parameters
 */
export function getTrailIds(searchParams: URLSearchParams, currentData: MappedOriginal): number[] {
  const trailNames = getParamValues(searchParams, 'trail');
  if (!trailNames.length) return [];

  return Object.values(currentData.trails)
    .filter(
      (trail) =>
        trailNames.includes(createSlug(trail.name)) ||
        (trail.slug && trailNames.includes(trail.slug))
    )
    .map((trail) => trail.id);
}

/**
 * Gets segment IDs from search parameters
 */
export function getSegmentIds(searchParams: URLSearchParams): number[] {
  return getParamValues(searchParams, 'segment').map(Number);
}

/**
 * Gets bounds for segments and trails
 */
function getSegmentBounds(
  segmentIds: number[],
  trailIds: number[],
  currentData: MappedOriginal
): InitialBounds | undefined {
  if (!segmentIds.length && !trailIds.length) return undefined;

  // Find segments that match the criteria
  const segments = Object.values(currentData.segments).filter(
    (segment) =>
      segmentIds.includes(segment.id) || segment.trails.some((id) => trailIds.includes(id))
  );

  if (!segments.length) return undefined;

  // Calculate the map bounds
  const features = segments.map((segment) => feature(segment.geometry));
  return formatBounds(bbox(featureCollection(features)) as BBox2d);
}

/**
 * Main function to get initial bounds based on URL parameters
 */
export function getInitialBounds(
  searchParams: URLSearchParams,
  currentData: MappedOriginal
): InitialBounds | undefined {
  // Check town bounds first
  const townBounds = getTownBounds(searchParams);
  if (townBounds) return townBounds;

  // Get trail and segment IDs
  const trailIds = getTrailIds(searchParams, currentData);
  const segmentIds = getSegmentIds(searchParams);

  // Get bounds for segments and trails
  return getSegmentBounds(segmentIds, trailIds, currentData);
}
