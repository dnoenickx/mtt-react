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
  {
    id: 3,
    headline: 'Conceptual Designs',
    date: new Date(2022, 9, 15),
    datePrecision: 'month',
    description:
      'DCR hosted a listening sessions and presented conceptual designs for the 128 crossing.',
    icon: 'IconConfetti',
    segmentIds: [84],
    links: [
      {
        url: 'https://mass.streetsblog.org/2022/09/19/planning-underway-for-mass-central-rail-trail-link-over-i-95-in-waltham-weston',
        label: 'Mass Streets Blog',
      },
    ],
  },
  {
    id: 4,
    headline: 'Construction Funded',
    date: new Date(2023, 12, 20),
    datePrecision: 'month',
    description:
      '$2.4 million of ARPA funds dedicated to fast-track construction of the gap across Route 128',
    icon: 'IconConfetti',
    segmentIds: [84],
    links: [
      {
        url: 'https://mass.streetsblog.org/2023/12/21/gov-healey-adds-24-million-for-trail-projects-from-pandemic-relief-funds',
        label: 'Mass Streets Blog',
      },
    ],
  },
  {
    id: 5,
    headline: 'ROW Transferred to City',
    date: new Date(2023, 12, 20),
    datePrecision: 'month',
    description:
      'This section of rail bed was last used in 2000. Following a derailment that year, owner CSX filed to abandon it. After some administrative delays, the property was transferred to the city in December 2023.',
    icon: 'IconConfetti',
    segmentIds: [5417],
    links: [],
  },
  {
    id: 6,
    headline: '25% Design Started',
    date: new Date(2024, 4, 15),
    datePrecision: 'month',
    description:
      'A preliminary design will be unnecessary, and the project will go straight to 25% design. The project will be done in two sections: from the Sudbury town line to Frost Street, about 1.4 miles, and then from Frost Street to Rte. 30 (Pleasant Street), just short of Rte. 9 at Framingham Center. Framingham has contracted with BETA Group for design of the first section. Once Transportation Improvement Project (TIP) funds have been awarded, construction typically takes about two years.',
    icon: 'IconConfetti',
    segmentIds: [5417],
    links: [
      {
        url: 'https://brucefreemanrailtrail.org/wp-content/uploads/BFRT-News-Spring-2024.pdf',
        label: 'BFRT Spring 2024 Newsletter',
      },
    ],
  },
  {
    id: 7,
    headline: 'Expected Opening',
    date: new Date(2025, 6, 1),
    datePrecision: 'month',
    description: '',
    icon: 'IconConfetti',
    segmentIds: [8092],
    links: [],
  },
  {
    id: 8,
    headline: '25% Design Submitted',
    date: new Date(2022, 4, 20),
    datePrecision: 'month',
    description: '',
    icon: 'IconConfetti',
    segmentIds: [9750],
    links: [
      {
        url: 'https://www.mass.gov/doc/mcrt-wayland-to-sudbury-sub-station-presentation-2023-3-2/download',
        label: 'Presentation',
      },
    ],
  },
  {
    id: 9,
    headline: 'Construction Started',
    date: new Date(2024, 3, 26),
    datePrecision: 'month',
    description:
      'DCR authorized a $2.3 million contract to build 0.3 miles new segment from current Weston terminus to Jones Road.',
    icon: 'IconConfetti',
    segmentIds: [9964],
    links: [
      {
        url: 'https://mass.streetsblog.org/2024/04/10/dcr-starts-construction-on-waltham-weston-mass-central-trail-connection',
        label: 'Mass Streets Blog',
      },
    ],
  },
  {
    id: 1229,
    headline: 'Phase 1 Construction began',
    date: new Date(2022, 10, 24),
    datePrecision: 'day',
    description: '',
    icon: '',
    segmentIds: [5459],
    links: [
      {
        url: 'https://www.eversource.com/content/residential/about/transmission-distribution/projects/massachusetts-projects/sudbury-to-hudson-project',
        label: 'Eversource',
      },
    ],
  },
  {
    id: 6874,
    headline: 'Fitchburg Community Path Opens',
    date: new Date(2013, 9, 5),
    datePrecision: 'day',
    description: '',
    icon: '',
    segmentIds: [1254],
    links: [],
  },
  {
    id: 7326,
    headline: 'Phase 2 Construction Begins',
    date: new Date(2025, 2, 1),
    datePrecision: 'month',
    description:
      'DCR will complete the new gravel road with paving, safe road crossings, and the restoration of historical railroad artifacts.',
    icon: '',
    segmentIds: [5459],
    links: [],
  },
  {
    id: 8633,
    headline: 'Construction Begins',
    date: new Date(2027, 7, 1),
    datePrecision: 'day',
    description:
      'https://www.mass.gov/doc/mcrt-wayland-to-sudbury-sub-station-presentation-2023-3-2/download',
    icon: '',
    segmentIds: [9750],
    links: [],
  },
];
