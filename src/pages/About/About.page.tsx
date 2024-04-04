import { Container, Title, Accordion, Text } from '@mantine/core';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import classes from './About.module.css';

import statsGroupStyle from './StatsGroup.module.css';
import { List, ThemeIcon, rem } from '@mantine/core';
import { IconCircleCheck, IconCircleDashed, IconCircleX } from '@tabler/icons-react';

const listCheck = (
  <ThemeIcon variant="outline" color="teal" style={{ border: 0 }}>
    <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
  </ThemeIcon>
);

const listX = (
  <ThemeIcon variant="outline" color="red" style={{ border: 0 }}>
    <IconCircleX style={{ width: rem(16), height: rem(16) }} />
  </ThemeIcon>
);

type FAQ = {
  key: string;
  title: string;
  body: string | ReactElement;
};

const faqs: FAQ[] = [
  {
    key: 'missing-information',
    title: "Why don't you show all trails?",
    body: "There is some level of curation that occurs and it can be a little arbitrary, but my goal in doing so is to have an approachable resource. \
    There are already other mapping resources that highlight every single piece of infrastructure. \
    guiding principal I have is that a trail bikeable and relatively linear and long. For example, I don't",
  },
  {
    key: 'no-bike-lanes',
    title: "Why don't you show bike lanes?",
    body: '',
  },
  {
    key: 'why-account',
    title: 'Do I need an account to suggests changes?',
    body: (
      <>
        <Text>Yes, but anyone can create an account.</Text>
        <Text c="dimmed">
          Accounts are necessary for allowing you to view your own edits prior to them being
          approved. That way you can make a series of changes, like adding events to a trail segment
          you just created.
        </Text>
      </>
    ),
  },
  {
    key: 'adding-an-event',
    title: 'How do I add an event?',
    body: (
      <ol>
        <li>Log in or create an account.</li>
        <li>Use the map to select a trail segment.</li>
        <li>Scroll to the bottom of the segment details panel and click edit.</li>
        <li>
          Fill out the empty event field. Make sure you click 'select segments' and select all
          applicable trail segments on the map.
        </li>
      </ol>
    ),
  },
];

const data = [
  {
    title: 'Trail Miles',
    stats: '1,200',
    description: '24% more than in the same month last year, 33% more that two years ago',
  },
  {
    title: 'Events',
    stats: '200',
    description: '',
  },
  {
    title: 'Contributers',
    stats: '1',
    description: '1994 orders were completed this month, 97% satisfaction rate',
  },
];

const statsGroup = (
  <div className={statsGroupStyle.root}>
    {data.map((stat) => (
      <div key={stat.title} className={statsGroupStyle.stat}>
        <Text className={statsGroupStyle.count}>{stat.stats}</Text>
        <Text className={statsGroupStyle.title}>{stat.title}</Text>
        <Text className={statsGroupStyle.description}>{stat.description}</Text>
      </div>
    ))}
  </div>
);

// .item {
//     border-radius: var(--mantine-radius-md);
//     margin-bottom: var(--mantine-spacing-lg);
//     border: rem(1px) solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
//   }

const faqSection = (
  <Accordion variant="separated">
    {faqs.map(({ key, title, body }) => (
      <Accordion.Item value={key} key={key} mb="lg">
        <Accordion.Control>{title}</Accordion.Control>
        <Accordion.Panel>{body}</Accordion.Panel>
      </Accordion.Item>
    ))}
  </Accordion>
);

export default function About() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} pt="xl" pb="xs">
        About
      </Title>
      <Title order={2} pt="xl" pb="xs">
        Mission
      </Title>
      To help you find trails, while highlighting regional connectivity, the history of completed
      trails, and the timeline for future trails. To connect people to local trail advocacy groups.
      <Title order={2} pt="xl" pb="xs">
        What does this map show?
      </Title>
      <List spacing="xs" size="md" center>
        <List.Item icon={listCheck}>
          Relatively long, linear, and bikeable paths across the commonwealth
        </List.Item>
        <List.Item icon={listX}>short paths crisscrossing your local town common</List.Item>
        <List.Item icon={listX}>winding loop trails through a state forest</List.Item>
        <List.Item icon={listX}>bike lanes (may add in the future)</List.Item>
      </List>
      <Title order={2} pt="xl" pb="xs">
        Additional Map Resources
      </Title>
      I highly recommend checking out these other maps:
      <ul>
        <li key="mapc">
          <a href="https://trailmap.mapc.org/">Trail Map | MAPC</a>
        </li>
        <li key="priority">
          <a href="https://experience.arcgis.com/experience/75ad0564b18f48f5973657d65d2a775d/page/Page/">
            Massachusetts Priority Trails Network | MassDOT
          </a>
        </li>
        <li key="inventory">
          <a href="https://massdot.maps.arcgis.com/apps/webappviewer/index.html?id=76fc33869d534c6ba0b16803d25ee990">
            Bicycle Facility Inventory | MassDOT
          </a>
        </li>
        <li key="masstrails">
          <a href="https://masstrails.com/bigmap.html">Mass Trails</a>
        </li>
      </ul>
      <Title order={2} pt="xl" pb="xs">
        So why make another map?
      </Title>
      I wanted to make a map that is more legible, easy to digest, responsive, and user friendly. By
      not including every foot trail, bike lane, and little path in the state, it's easier to see
      the regional picture of how longer distance trails intersect. Furthermore, I wanted to provide
      more information when you click on a trail, particularly links to relevant articles and
      websites.
      <Title order={2} pt="xl" pb="xs">
        A hub for local trail groups
      </Title>
      <Text>
        Massachusetts has many cities and towns and when we build a trail on abandoned rail
        corridors it tends to happen town by town, leading to a regional trail with a dozen local
        names and “friends of the __ trail” groups. Most groups have a website with a variety of
        resources like maps, histories, and photos, but not all do and it be hard to find and keep
        track of dozens of websites.
      </Text>
      <Text pt="sm">
        I want to collect this information in a single location so it's easy to find, allowing
        anyone to submit suggestions so the data is always timely and accurate. Technology can be
        difficult to navigate, and I want to enable these groups to share information about the
        trails they care about.
      </Text>
      {/* <Title order={2} pt="xl" pb="xs">
        Why do I care?
      </Title>
      <Text>
        I want to enable more people to take fewer trips by car. I don't mean you shouldn't own a
        car and should never drive, I just think it should be safe and pleasant to get around by
        bike or foot (if that's something you wanted to do).
      </Text>
      <Text pt="sm">
        I bike most places. I most often do so on the Muddy River, Southwest Corridor, and Charles
        River. I love these paths because they get me where I am going in a direct, safe, and
        pleasant way.
      </Text>
      <Text pt="sm">
        A trail that's primarily recreational for one person, can be transportation for another.
        Both are good. I want to encourage the use and construction of paths to enable both. That's
        why I focus on long linear paths.
      </Text> */}
      <Title order={2} pt="xl" pb="xs">
        Now what?
      </Title>
      <ul style={{ paddingTop: 0 }}>
        <li>Contribute information (add a trail, an article, a description, a photo).</li>
        <li>Make a donation to support the continued hosting and development of this site.</li>
        <li>Contact your local representatives.</li>
        <li>Join a local trail advocacy group.</li>
        <li>Share this site with a friend.</li>
        <li>Get outside and go for a ride.</li>
      </ul>
      <Title order={2} pt="xl" pb="xs" ta="center">
        Frequently Asked Questions
      </Title>
      {faqSection}
    </Container>
  );
}

// https://ui.mantine.dev/category/contact/

// https://ui.mantine.dev/category/features/

// Segments of number of miles in each category?
// https://ui.mantine.dev/component/stats-segments/
