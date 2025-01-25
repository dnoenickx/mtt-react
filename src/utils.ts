import { format, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { DatePrecision } from './types';

function adjustForTimezoneOffset(date: string) {
  const dt = new Date(date);
  return new Date(dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000);
}

export function formatDateString(date: string) {
  return format(adjustForTimezoneOffset(date), 'yyyy-MM-dd');
}

function getSeason(date: Date) {
  const month = date.getMonth() + 1;
  switch (true) {
    case month >= 3 && month <= 5:
      return 'Spring';
    case month >= 6 && month <= 8:
      return 'Summer';
    case month >= 9 && month <= 11:
      return 'Fall';
    default:
      return 'Winter';
  }
}

export function formatDateWithPrecision(date: string, precision: DatePrecision): string {
  const adjustedDate = adjustForTimezoneOffset(date);

  switch (precision) {
    case 'd':
      return format(startOfDay(adjustedDate), 'MMMM d, yyyy');
    case 'm':
      return format(startOfMonth(adjustedDate), 'MMMM yyyy');
    case 's':
      return `${getSeason(adjustedDate)} ${adjustedDate.getFullYear()}`;
    case 'y':
      return format(startOfYear(adjustedDate), 'yyyy');
    default:
      return adjustedDate.toDateString();
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

export const handleDownload = (
  fileName: string,
  data: string,
  appendDate: boolean = true
): void => {
  try {
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = appendDate
      ? `${fileName}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`
      : `${fileName}.json`;
    link.click();
  } catch (error) {
    console.error('Failed to download file:', error);
  }
};

export function toCapitalCase(str: string | undefined) {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
