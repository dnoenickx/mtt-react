import { ColorValueHex } from '@/types';

export type SegmentStates = {
  // [key in SegmentState]: {
  [key: string]: {
    label: string;
    description: string;
    color: ColorValueHex;
    weight: 'heavy' | 'medium' | 'light';
    style: 'solid' | 'dashed';
    visible: boolean;
  };
};

export const SEGMENT_STATES: SegmentStates = {
  paved: {
    label: 'Paved',
    description: 'Paved with asphalt or concrete.',
    color: '#4D6A63',
    weight: 'heavy',
    style: 'solid',
    visible: true,
  },
  stoneDust: {
    label: 'Stone Dust',
    description: 'Compact gravel surface, often ADA accessible.',
    color: '#5C9969',
    weight: 'heavy',
    style: 'solid',
    visible: true,
  },
  unimproved: {
    label: 'Protected + Unimproved',
    description:
      'A publically-owned or privately-protected (i.e. land trust) corridor where a trail could be built. In some cases there is an unimproved path that can be used for hiking or mountain biking, but in others there is no trail at all. See segment descriptions for more information.',
    color: '#4D9DE0',
    weight: 'medium',
    style: 'solid',
    visible: true,
  },
  onRoad: {
    label: 'On Road',
    description:
      'Suggested routes between trails. Conditions vary. See segment descriptions for more information.',
    color: '#31588c',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
  construction: {
    label: 'Under Construction',
    description: 'Currently under construction.',
    color: '#F39B53',
    weight: 'medium',
    style: 'solid',
    visible: true,
  },
  design: {
    label: 'In Design',
    description:
      'Currently or recently in a stage of design. Trails with years-old preliminary desings may instead be marked as proposed.',
    color: '#901c7b',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
  proposed: {
    label: 'Proposed',
    description:
      'Concept for a future trail with minimal official progress toward its implementation. Routes are rough ideas, and so they may pass through private land.',
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
