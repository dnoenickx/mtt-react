import { MultiLineString } from 'geojson';

export type SegmentState =
  | 'paved'
  | 'stoneDust'
  | 'unimproved'
  | 'onRoad'
  | 'construction'
  | 'design'
  | 'proposed';

export type DatePrecision = 'd' | 'm' | 's' | 'y';

// Main types within app ///////////////////////////////////////////////////

export type Trail = {
  id: number;
  name: string;
  slug: string;
  description: string;
  links: Link[];
};

export type Segment = {
  id: number;
  name: string;
  description: string;
  state: SegmentState;
  geometry: MultiLineString;
  trails: Trail[];
  events: TrailEvent[];
  links: Link[];
};

export type Link = {
  url: string;
  text: string;
};

export type TrailEvent = {
  id: number;
  headline: string;
  date: string;
  date_precision: DatePrecision;
  description: string;
  links: Link[];
};

// Raw types for loading/exporting  ///////////////////////////////////////////////////

export type RawTrail = Trail;

export type RawTrailEvent = TrailEvent;

export type RawSegment = {
  id: number;
  name: string;
  description: string;
  state: SegmentState;
  geometry: MultiLineString;
  trails: number[];
  events: number[];
  links: Link[];
};

// Groupings of above components  ///////////////////////////////////////////////////

export type MappedKeys = keyof MappedChanges;

export type MappedChanges = {
  trails: { [id: number]: DeletableWithId<RawTrail> };
  segments: { [id: number]: DeletableWithId<RawSegment> };
  trailEvents: { [id: number]: DeletableWithId<RawTrailEvent> };
};

export type ChangesImport = MappedChanges & {
  lastModified: Date;
};

export type MappedOriginal = {
  trails: { [id: number]: RawTrail };
  segments: { [id: number]: RawSegment };
  trailEvents: { [id: number]: RawTrailEvent };
};

export type RawOriginal = {
  trails: RawTrail[];
  segments: RawSegment[];
  trailEvents: RawTrailEvent[];
  lastUpdated: string;
};

// helpers  ///////////////////////////////////////////////////

export type DeletableWithId<T> = Partial<T> & { id: number; deleted?: boolean };

/** Construct a type with the properties of T where those in type K are optional. */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type ColorValueHex = `#${string}`;
