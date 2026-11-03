// Served next to the basemap: same tile host as VITE_TILE_URL (…/ma_region.json), different archive.
// In prod that's the CloudFront -> Lambda -> s3://tiles.masstrailtracker setup; in dev, `pmtiles serve`
// from a directory containing speed-humps.pmtiles.
export const SPEED_HUMPS_TILEJSON_URL = String(import.meta.env.VITE_TILE_URL).replace(
  /[^/]+$/,
  'speed-humps.json'
);

/** Properties on the `eligibility` vector-tile layer (see scripts/buildSpeedHumps.mjs). */
export interface RoadProps {
  STREETNAME: string;
  PopupLong: string;
  k_sphmp2: string;
  k_Boston: 'Yes' | 'No';
  k_MBTAbus: 'Yes' | 'No';
  k_BNRD: 'Yes' | 'No';
  k_3Lanes: 'Yes' | 'No';
  k_alleys: 'Yes' | 'No';
  k_totlanes: number;
  SPEED_LIM: number;
  AADT: number;
  LENGTH_FT: number;
}

/** Properties on the `humps` vector-tile layer. */
export interface HumpProps {
  Name: string;
  Zone: string;
}

export interface StatusCategory {
  id: string;
  label: string;
  /** Raw `PopupLong` values that belong to this category. */
  values: string[];
  color: string;
  /** Draw order: higher is on top. */
  rank: number;
}

// Ordered from least to most "interesting" so the legend reads top-down.
export const STATUS_CATEGORIES: StatusCategory[] = [
  {
    id: 'installed',
    label: 'Humps installed',
    values: [
      'Speed humps installed',
      'Speed humps installed; additional planned with Better Bike Lane project',
    ],
    color: '#2e9e5b',
    rank: 6,
  },
  {
    id: 'in-progress',
    label: 'In review / design',
    values: ['In progress'],
    color: '#f26b21',
    rank: 5,
  },
  {
    id: 'planned',
    label: 'Promised 2024–2026',
    values: ['Planned for 2024-2026', 'Speed humps planned with Better Bike Lane project'],
    color: '#f2b134',
    rank: 4,
  },
  {
    id: 'future',
    label: 'Eligible, future phase',
    values: ['Eligible for a future phase'],
    color: '#3b8be0',
    rank: 3,
  },
  {
    id: 'evaluated',
    label: 'Evaluated, none recommended',
    values: ['Evaluated, no speed humps recommended'],
    color: '#8e6bbf',
    rank: 2,
  },
  {
    id: 'ineligible',
    label: 'Not eligible',
    values: ['Not eligible'],
    color: '#707070',
    rank: 1,
  },
];

export const HUMP_COLOR = '#d81b60';

/** Why a street failed the screening criteria, derived from the boolean flags. */
export function ineligibilityReasons(p: RoadProps): string[] {
  const reasons: string[] = [];
  if (p.k_Boston === 'No') reasons.push('Not a City of Boston street');
  if (p.k_MBTAbus === 'Yes') reasons.push('MBTA bus route');
  if (p.k_BNRD === 'Yes') reasons.push('BNRD road');
  if (p.k_3Lanes === 'Yes') reasons.push('3 or more lanes');
  if (p.k_alleys === 'Yes') reasons.push('Alley');
  if (reasons.length === 0) reasons.push('Outside defined zones');
  return reasons;
}

export function categoryFor(popupLong: string): StatusCategory | undefined {
  return STATUS_CATEGORIES.find((c) => c.values.includes(popupLong));
}
