import { ColorValueHex } from '@/types';

export type SegmentStates = {
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
    color: '#35827C',
    weight: 'heavy',
    style: 'solid',
    visible: true,
  },
  stoneDust: {
    label: 'Stone Dust',
    description: 'Compact gravel surface, often ADA accessible.',
    color: '#45C476',
    weight: 'heavy',
    style: 'solid',
    visible: true,
  },
  onRoad: {
    label: 'On Road',
    description:
      'Suggested routes between trails. Conditions vary. See segment descriptions for more information.',
    color: '#EB5160',
    weight: 'light',
    style: 'solid',
    visible: true,
  },
  unimproved: {
    label: 'Protected/Unimproved',
    description:
      'A publicly-owned or privately-protected (i.e. land trust) corridor where a trail could be built. In some cases there is an unimproved path that can be used for hiking or mountain biking, but in others there is no trail at all. See segment descriptions for more information.',
    color: '#52A0E0',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
  construction: {
    label: 'Under Construction',
    description: 'Currently under construction.',
    color: '#F39B53',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
  design: {
    label: 'In Design',
    description:
      'Currently or recently in a stage of design. Trails with years-old preliminary desings may instead be marked as proposed.',
    color: '#8F3865',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
  proposed: {
    label: 'Proposed',
    description:
      'Concept for a future trail with minimal official progress toward its implementation. Routes are rough ideas, and so they may pass through private land.',
    color: '#565656',
    weight: 'medium',
    style: 'dashed',
    visible: true,
  },
};
