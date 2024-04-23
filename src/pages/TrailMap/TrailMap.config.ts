import { ColorValueHex, SegmentState } from '@/types';

export type SegmentStates = {
  // [key in SegmentState]: {
  [key: string]: {
    label: string;
    description?: string;
    color: ColorValueHex;
    weight: 'heavy' | 'medium' | 'light';
    style: 'solid' | 'dashed';
    visible: boolean;
  };
};

export const SEGMENT_STATES: SegmentStates = {
  paved: {
    label: 'Paved',
    color: '#4D6A63',
    weight: 'heavy',
    style: 'solid',
    visible: true,
  },
  stoneDust: {
    label: 'Stone Dust',
    description: 'Compact gravel surface, often ADA accessible',
    color: '#5C9969',
    weight: 'heavy',
    style: 'solid',
    visible: true,
  },
  unimproved: {
    label: 'Unimproved',
    description: 'Narrow or bumpy trail not suitable for all users or uses',
    color: '#4D9DE0',
    weight: 'medium',
    style: 'solid',
    visible: true,
  },
  onRoad: {
    label: 'On Road',
    description: 'Road routes connecting trails (varying levels of comfort)',
    color: '#31588c',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
  construction: {
    label: 'Under Construciton',
    color: '#F39B53',
    weight: 'medium',
    style: 'solid',
    visible: true,
  },
  design: {
    label: 'In Design',
    color: '#702963',
    weight: 'medium',
    style: 'solid',
    visible: true,
  },
  proposed: {
    label: 'Proposed',
    color: '#565656',
    weight: 'light',
    style: 'dashed',
    visible: true,
  },
};

// BASE MAPS ///////////////////////////////////////////////

export interface BaseMap {
  value: string;
  label: string;
  description: '';
}

export const BASE_MAPS: BaseMap[] = [
  {
    value: 'default',
    label: 'Default',
    description: '',
  },
  {
    value: 'sattellite',
    label: 'Sattellite',
    description: '',
  },
  {
    value: 'outdoors',
    label: 'Outdoors',
    description: '',
  },
];
