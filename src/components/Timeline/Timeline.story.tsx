import { Timeline as TimelineComponent } from './Timeline';

const exampleSegmentEvents = [
  {
    title: 'Expected Completion',
    date: new Date(2024, 1, 1),
    datePrecision: 'day',
    description: 'Orignally planned for June 2023.',
    icon: 'IconConfetti',
    links: [],
  },
  {
    title: 'Construction Started',
    date: new Date(2022, 7, 1),
    datePrecision: 'day',
    description:
      'The City of Waltham has awarded the Waltham Wayside Trail construction project to E.T. & L Corp. ',
    icon: 'IconBulldozer',
    links: [],
  },
  {
    title: 'Plans Released',
    date: new Date(2021, 7, 1),
    datePrecision: 'day',
    description: '',
    icon: 'IconRuler',
    links: [
      {
        label: 'View Plans',
        url: 'https://www.city.waltham.ma.us/sites/g/files/vyhlif6861/f/uploads/extracted_plans_for_project_page.pdf',
      },
    ],
  },
  {
    title: 'DCR Leases Right of Way',
    date: new Date(2011, 1, 1),
    datePrecision: 'day',
    description:
      'The DCR executed a lease with the MBTA for 23 miles of the former railroad corridor from Waltham to Berlin for the purpose of designing and developing a multi-use rail trail in partnership with the local municipalities.',
    icon: 'IconLicense',
    links: [],
  },
];


export default {
  title: 'SegmentDetailsPanel',
};

export const BasicTimeline = () => <TimelineComponent events={exampleSegmentEvents} />;