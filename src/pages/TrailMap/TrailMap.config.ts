import { ColorValueHex } from "@/types";


export type TrailStates = {
  [key: string]: {
    label: string;
    color: ColorValueHex;
    visible: boolean;
  };
};

export const TRAIL_STATES: TrailStates = {
  paved: {
    label: 'Paved',
    color: '#658679',
    visible: true,
  },
  stoneDust: {
    label: 'Stone Dust',
    color: '#84B479',
    visible: true,
  },
  construction: {
    label: 'Under Construciton',
    color: '#F4A362',
    visible: true,
  },
  design: {
    label: 'In Design',
    color: '#702963',
    visible: true,
  },
  proposed: {
    label: 'Proposed',
    color: '#565656',
    visible: true,
  },
};

// BASE MAPS ///////////////////////////////////////////////

export interface BaseMap {
  value: string;
  label: string;
}

export const BASE_MAPS: BaseMap[] = [
  {
    value: 'default',
    label: 'Default',
  },
  {
    value: 'sattellite',
    label: 'Sattellite',
  },
  {
    value: 'outdoors',
    label: 'Outdoors',
  },
];
