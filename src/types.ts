import { MultiLineString, LineString } from 'geojson';

export type Trail = {
  id: number;
  slug: string;
  name: string;
  description: string;
};

export type SegmentState =
  | 'paved'
  | 'stoneDust'
  | 'unimproved'
  | 'onRoad'
  | 'construction'
  | 'design'
  | 'proposed';

export type Segment = {
  id: number;
  name: string;
  description: string;
  state: SegmentState;
  trailIds: number[];
  geometry: MultiLineString | LineString;
};

export type Newsflash = {
  id: number;
  headline: string;
  date: Date;
  datePrecision: DatePrecision;
  description: string;
  icon: string;
  segmentIds: number[];
  links: Link[];
};

export type DatePrecision = 'day' | 'month' | 'year';

export type Link = {
  url: string;
  label: string;
};

/** Construct a type with the properties of T where those in type K are optional. */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/**
 * A type for tracking original and new objects of type T.
 *
 * Setting an id to undefined within `new` represents that the value should be
 * deleted from the original list.
 */
export type Tracker<T> = {
  original: { [id: number]: T };
  new: { [id: number]: T | undefined };
};

export type ColorValueHex = `#${string}`;
