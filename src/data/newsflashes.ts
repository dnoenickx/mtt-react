import { Newsflash } from '@/types';

export const newsflashes: Newsflash[] = [
  {
    id: 1,
    headline: 'CPX Announced',
    date: new Date(2014, 4, 1),
    datePrecision: 'month',
    description:
      'State officials announced 1.9-mile, $39 million extension of the Community Path as part of the Green Line Extension project',
    icon: 'IconConfetti',
    segmentIds: [9130, 5215, 6654],
    links: [
      {
        url: 'https://www.bostonglobe.com/metro/2014/04/30/somerville-bike-path-extended-along-green-line/RmkOE91u4vRbI1K3scJlJI/story.html',
        label: 'Boston Globe',
      },
    ],
  },
  {
    id: 2,
    headline: 'CPX Opened',
    date: new Date(2023, 6, 10),
    datePrecision: 'day',
    description:
      'Extension opened from Cambridge Crossing to Lowell Street. The section by Gilman Square green line station opened a few months later.',
    icon: 'IconConfetti',
    segmentIds: [9130, 5215, 6654],
    links: [
      {
        url: 'https://mass.streetsblog.org/2023/06/09/somervilles-community-path-extension-opens-saturday',
        label: 'Mass Streets Blog',
      },
    ],
  },
];
