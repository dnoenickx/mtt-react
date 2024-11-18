import { MultiLineString, LineString } from 'geojson';

export type Trail = {
  id: number;
  slug: string;
  name: string;
  description: string;
  links: Link[];
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
  trails: Trail[];
  events: TrailEvent[];
  name: string;
  description: string;
  state: SegmentState;
  geometry?: MultiLineString | LineString;
  links: Link[];
};

export type TrailEvent = {
  id: number;
  headline: string;
  date: Date;
  date_precision: DatePrecision;
  description: string;
  icon?: string;
  links: Link[];
};

export type DatePrecision = 'd' | 'm' | 'y';

export type Link = {
  id: number;
  url: string;
  text: string;
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
