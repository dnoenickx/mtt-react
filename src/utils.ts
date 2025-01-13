import { format, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { DatePrecision } from './types';

export function formatDate(date: Date, precision: DatePrecision) {
  switch (precision) {
    case 'd':
      return format(startOfDay(date), 'MMMM d, yyyy');
    case 'm':
      return format(startOfMonth(date), 'MMMM yyyy');
    case 'y':
      return format(startOfYear(date), 'yyyy');
    default:
      return date.toDateString();
  }
}

export const sortById = <T extends { id: number }>(items: Record<number, T>): T[] =>
  Object.values(items).sort((a, b) => a.id - b.id);

export function createMapping(list: any[], key: string = 'id') {
  if (!list.every((obj) => key in obj)) {
    throw new Error(`Key '${key}' does not exist in any of the objects.`);
  }

  return Object.fromEntries(list.map((item) => [item[key], item]));
}

export function deepEqual(a: any, b: any): boolean {
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
