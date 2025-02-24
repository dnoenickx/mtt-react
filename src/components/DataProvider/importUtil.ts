import { DeletableWithId, Link, MappedChanges, RawSegment, RawTrail, RawTrailEvent } from '@/types';
import { createMapping } from '@/utils';

type Trail = DeletableWithId<RawTrail>;
type Segment = DeletableWithId<RawSegment>;
type TrailEvent = DeletableWithId<RawTrailEvent>;

const isObjectOfType = <T>(
  obj: any,
  check: (value: any) => boolean
): obj is { [key: number]: T } => {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.entries(obj).every(([key, value]) => !Number.isNaN(Number(key)) && check(value));
};

const isValidCoordinate = (coord: any): boolean =>
  Array.isArray(coord) && coord.length === 2 && coord.every((n) => typeof n === 'number');

const isMultiLineString = (geometry: any): boolean =>
  typeof geometry === 'object' &&
  geometry !== null &&
  geometry.type === 'MultiLineString' &&
  Array.isArray(geometry.coordinates) &&
  geometry.coordinates.every((line: any) => Array.isArray(line) && line.every(isValidCoordinate));

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !Number.isNaN(date.getTime());
};

const isLink = (value: any): value is Link =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.url === 'string' &&
  typeof value.text === 'string';

const isTrail = (value: any): value is Trail =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.id === 'number' &&
  typeof value.name === 'string' &&
  typeof value.description === 'string' &&
  Array.isArray(value.links) &&
  value.links.every(isLink) &&
  (value.deleted === undefined || typeof value.deleted === 'boolean');

const isSegment = (value: any): value is Segment =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.id === 'number' &&
  (value.name === undefined || typeof value.name === 'string') &&
  (value.description === undefined || typeof value.description === 'string') &&
  (value.state === undefined ||
    ['paved', 'stoneDust', 'unimproved', 'onRoad', 'construction', 'design', 'proposed'].includes(
      value.state
    )) &&
  (value.geometry === undefined || isMultiLineString(value.geometry)) &&
  (value.trails === undefined ||
    (Array.isArray(value.trails) && value.trails.every((id: any) => typeof id === 'number'))) &&
  (value.events === undefined ||
    (Array.isArray(value.events) && value.events.every((id: any) => typeof id === 'number'))) &&
  (value.links === undefined || (Array.isArray(value.links) && value.links.every(isLink))) &&
  (value.deleted === undefined || typeof value.deleted === 'boolean');

const isTrailEvent = (value: any): value is TrailEvent =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.id === 'number' &&
  typeof value.headline === 'string' &&
  typeof value.date === 'string' &&
  isValidDate(value.date) &&
  ['d', 'm', 'y'].includes(value.date_precision) &&
  typeof value.description === 'string' &&
  Array.isArray(value.links) &&
  value.links.every(isLink) &&
  (value.deleted === undefined || typeof value.deleted === 'boolean');

export const importChanges = (
  value: string
): (MappedChanges & { lastModified: Date }) | undefined => {
  try {
    const data: any = JSON.parse(value);

    /* eslint-disable no-console */
    if (typeof data !== 'object' || data === null) {
      console.error('Invalid data: must be an object');
      return undefined;
    }

    if (typeof data.lastModified !== 'string' || !isValidDate(data.lastModified)) {
      console.error('Invalid lastModified:', data.lastModified);
      return undefined;
    }

    if (!isObjectOfType<Trail>(data.trails, isTrail)) {
      console.error('Invalid trails:', data.trails);
      return undefined;
    }

    if (!isObjectOfType<Segment>(data.segments, isSegment)) {
      console.error('Invalid segments:', data.segments);
      return undefined;
    }

    if (!isObjectOfType<TrailEvent>(data.trailEvents, isTrailEvent)) {
      console.error('Invalid trailEvents:', data.trailEvents);
      return undefined;
    }
    /* eslint-enable no-console */

    return {
      lastModified: new Date(data.lastModified),
      trails: createMapping(data.trails),
      segments: createMapping(data.segments),
      trailEvents: createMapping(data.trailEvents),
    };
  } catch {
    return undefined;
  }
};
