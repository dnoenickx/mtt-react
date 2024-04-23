import React from 'react';
import { SegmentDetailsPanel } from './SegmentDetailsPanel';

export default {
  title: 'Segment Details',
  component: SegmentDetailsPanel,
  argTypes: { editing: { control: 'boolean' } },
  parameters: {
    mockData: [
      {
        url: 'http://127.0.0.1:5000/segment/99',
        method: 'GET',
        status: 200,
        response: {
          name: 'Yellow Brick Road',
          description:
            'Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads. Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads. Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads.',
          state: 'Paved',
          surface: 'paved',
          trails: [
            {
              name: 'Apples',
              description:
                'Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads.',
              url: '/apples',
            },
            {
              name: 'Bananas',
              description:
                'Naturally sweet and potassium-rich fruit. Bananas are a popular choice for their energy-boosting properties and can be enjoyed as a quick snack, added to smoothies, or used in baking.',
              url: '/bananas',
            },
            {
              name: 'Broccoli',
              description:
                'Nutrient-packed green vegetable. Broccoli is packed with vitamins, minerals, and fiber. It has a distinct flavor and can be enjoyed steamed, roasted, or added to stir-fries.',
              url: '/broccoli',
            },
          ],
          events: [
            {
              title: 'Expected Completion',
              date: '2024-02-01',
              dateLabel: 'January, 2024',
              description: 'Originally planned for June 2023.',
              icon: 'IconConfetti',
              links: [],
            },
            {
              title: 'Construction Started',
              date: '2022-08-01',
              dateLabel: 'July, 2022',
              description:
                'The City of Waltham has awarded the Waltham Wayside Trail construction project to E.T. & L Corp.',
              icon: 'IconBulldozer',
              links: [],
            },
            {
              title: 'Plans Released',
              date: '2021-08-01',
              dateLabel: 'July, 2021',
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
              date: '2011-02-01',
              dateLabel: '2011',
              description:
                'The DCR executed a lease with the MBTA for 23 miles of the former railroad corridor from Waltham to Berlin for the purpose of designing and developing a multi-use rail trail in partnership with the local municipalities.',
              icon: 'IconLicense',
              links: [],
            },
          ],
        },
      },
    ],
  },
};

const Template = () => (
  <div style={{ maxWidth: 350 }}>
    <SegmentDetailsPanel segmentId={99} />
  </div>
);

export const FetchCall = Template.bind({});
