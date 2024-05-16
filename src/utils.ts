import { MultiLineString, Position, multiLineString } from '@turf/turf';
import { format, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { DatePrecision, Newsflash, Segment, Trail } from './types';

export function formatDate(date: Date, precision: DatePrecision) {
  switch (precision) {
    case 'day':
      return format(startOfDay(date), 'MMMM d, yyyy');
    case 'month':
      return format(startOfMonth(date), 'MMMM yyyy');
    case 'year':
      return format(startOfYear(date), 'yyyy');
    default:
      return date.toDateString();
  }
}

export function generateRandomId(existing: number[]): number {
  const min = 1;
  const max = 9999;

  let randomNumber: number;
  do {
    randomNumber = Math.floor(min + Math.random() * (max - min + 1));
  } while (existing.includes(randomNumber));

  return randomNumber;
}

export function filterObject(obj: any, keys: string[]): any {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
}

export function normalizeMultiLineString(geoJSONString: string): MultiLineString {
  const geoJSONObject = JSON.parse(geoJSONString);

  const lines: Position[][] = [];

  const processInput = (data: any) => {
    if (Array.isArray(data)) {
      data.forEach((item) => processInput(item));
    } else if (typeof data === 'object' && data !== null) {
      if (data.type === 'LineString') {
        lines.push(data.coordinates);
      } else if (data.type === 'MultiLineString') {
        data.coordinates.forEach((line: number[][]) => lines.push(line));
      } else if (data.type === 'Feature') {
        processInput(data.geometry);
      } else if (data.type === 'FeatureCollection') {
        data.features.forEach((feature: any) => processInput(feature));
      } else {
        throw new SyntaxError("Invalid value for key 'type' in GeoJSON.");
      }
    }
  };

  processInput(geoJSONObject);
  return multiLineString(lines).geometry;
}

export function getItem(key: string, location = localStorage, value = {}) {
  function replaceNullWithUndefined(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        value === null ? undefined : replaceNullWithUndefined(value),
      ])
    );
  }

  return replaceNullWithUndefined(JSON.parse(location.getItem(key) ?? JSON.stringify(value)));
}

export function createMapping(list: any[], key: string) {
  if (!list.every((obj) => key in obj)) {
    throw new Error(`Key '${key}' does not exist in any of the objects.`);
  }

  return list.reduce((map, obj) => ({ ...map, [obj[key]]: obj }), {});
}

function deepEqual(a: any, b: any): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((element, index) => deepEqual(element, b[index]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.keys(a).every((key) => deepEqual(a[key], b[key]));
  }
  return a === b;
}

export function simpleDiff(oldVal: any, newVal: any) {
  const diff: any = {};

  Object.entries(newVal).forEach(([key, val]) => {
    if (!(key in oldVal) || !deepEqual(val, oldVal[key])) {
      // If newVal[key] is an object and oldVal[key] is also an object,
      // recursively call simpleDiff to compare them
      if (typeof val === 'object' && typeof oldVal[key] === 'object' && !Array.isArray(val)) {
        diff[key] = simpleDiff(oldVal[key], val);
      } else {
        diff[key] = val;
      }
    }
  });

  Object.keys(oldVal).forEach((key) => {
    if (!(key in newVal)) {
      diff[key] = undefined;
    }
  });

  return diff;
}

interface submitChangesParams {
  trails?: { [id: number]: Trail | undefined };
  segments?: { [id: number]: Segment | undefined };
  newsflashes?: { [id: number]: Newsflash | undefined };
}

export function submitChanges({ trails, segments, newsflashes }: submitChangesParams) {
  const user_id = localStorage.getItem('user_id') ?? crypto.randomUUID();
  localStorage.setItem('user_id', user_id);

  const url = 'https://elzjlaxywew5ucecydqyfrkb440irert.lambda-url.us-east-1.on.aws/';
  const data: any = {
    user: user_id,
    trails,
    segments,
    newsflashes,
  };

  // Omit properties that are undefined
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  return (
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((val) => {
        localStorage.setItem('last_submitted', new Date().toISOString());
        return val.status;
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err))
  );
}
