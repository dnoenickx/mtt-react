export type ColorValueHex = `#${string}`;

export type Segment = {
  name: string;
  description: string;
  state: State;
  surface: Surface;
  trails: RelatedTrail[];
  events: SegmentEvent[];
};

type Surface = 'Paved' | 'Stone Dust';

type State = 'Open' | 'Under Construction' | 'In Design' | 'Proposed';

export type RelatedTrail = {
  name: string;
  description: string;
  url: string;
};

export type Link = {
  url: string;
  label: string;
};

export type DatePrecision = 'day' | 'month' | 'year';

export type SegmentEvent = {
  title: string;
  date: Date;
  datePrecision: DatePrecision;
  description: string;
  icon: string;
  links: Link[];
};
