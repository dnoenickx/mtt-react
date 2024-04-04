import { Segment } from '@/types';
import SegmentEditPanel from './SegmentEditPanel';

export default {
  title: 'SegmentEditPanel',
};

const initData: Segment = {
  name: 'Community Path Extension',
  description:
    'The Community Path extension was completed in June 2023 as part of the Green Line Extension Project. This section connects the previous terminus near Magoun Square to Cambridge Crossing, passing Somerville High School and City Hall.',
  state: 'Open',
  surface: 'Paved',
  trails: [
    {
      name: 'Somerville Community Path',
      description:
        'The Somerville Community Path is a paved rail trail in Somerville, Massachusetts, running 3.2 miles from Massachusetts Avenue to East Cambridge via Davis Square. The first portion opened in 1985 along part of the former Fitchburg Cutoff rail line. Extensions opened in 1994 and 2015.',
      url: '/somerville-community-path',
    },
    {
      name: 'Mass Central Rail Trail',
      description:
        'The Mass Central Rail Trail is a partially completed rail trail between Northampton, Massachusetts and Boston along the former right-of-way of the Massachusetts Central Railroad. It currently has 59 miles open, and 94.5 miles are open or protected for trail development.',
      url: '/mass-central-rail-trail',
    },
  ],
  events: [
    {
      title: 'Trail Opened',
      date: new Date('2023-07-10'),
      datePrecision: 'day',
      description:
        'Trail opened with expection of School-Medford street, which opened a few months later.',
      icon: 'IconConfetti',
      links: [
        {
          label: 'Mass Streets Blog',
          url: 'https://mass.streetsblog.org/2023/06/09/somervilles-community-path-extension-opens-saturday',
        },
      ],
    },
    {
      title: 'CPX Announced',
      date: new Date('2014-04-01'),
      datePrecision: 'month',
      description:
        'In April 2014, state officials announced that a 1.9-mile, $39 million extension of the Community Path to East Cambridge would be built as part of the Green Line Extension (GLX) project',
      icon: 'IconConfetti',
      links: [
        {
          label: 'Boston Globe',
          url: 'https://www.bostonglobe.com/metro/2014/04/30/somerville-bike-path-extended-along-green-line/RmkOE91u4vRbI1K3scJlJI/story.html',
        },
      ],
    },
  ],
};

export const Usage = () => <SegmentEditPanel initialData={initData} />;
