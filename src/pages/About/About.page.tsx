import {
  Container,
  Title,
  Accordion,
  Text,
  List,
  ThemeIcon,
  rem,
  Anchor,
  Divider,
  CopyButton,
  Button,
} from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconCopy } from '@tabler/icons-react';
import { Footer } from '@/components/Footer/Footer';

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

export default function About() {
  return (
    <>
      <Container size="sm" py="xl">
        <Title order={1} pt="xl" pb="xs">
          About
        </Title>
        <Title order={3} pt="xl" pb="xs">
          Mission
        </Title>
        To highlight regional connectivity, the history of completed trails, and the timeline for
        future trails. To connect people to local trail advocacy groups. To help you find trails.
        <a id="other-maps">
          <Title order={3} pt="xl" pb="xs">
            Additional Map Resources
          </Title>
        </a>
        I highly recommend checking out these other maps:
        <ul>
          <li key="mapc">
            <Anchor target="_blank" href="https://trailmap.mapc.org/">
              Trail Map | MAPC
            </Anchor>
          </li>
          <li key="priority">
            <Anchor
              target="_blank"
              href="https://experience.arcgis.com/experience/75ad0564b18f48f5973657d65d2a775d/page/Page/"
            >
              Massachusetts Priority Trails Network | MassDOT
            </Anchor>
          </li>
          <li key="inventory">
            <Anchor
              target="_blank"
              href="https://massdot.maps.arcgis.com/apps/webappviewer/index.html?id=76fc33869d534c6ba0b16803d25ee990"
            >
              Bicycle Facility Inventory | MassDOT
            </Anchor>
          </li>
          <li key="masstrails">
            <Anchor target="_blank" href="https://masstrails.com/bigmap.html">
              Mass Trails
            </Anchor>
          </li>
        </ul>
        <Title order={3} pt="xl" pb="xs">
          So why make another map?
        </Title>
        The maps above show existing and planned infrastructure in great detail. However,
        &ldquo;planned&ldquo; can mean a lot of things: a project nearing the end of contruction;
        something that&lsquo;s been funded and designed; or simply an idea some residents are
        advocating for.
        <br />
        <br />
        I went down a rabbit hole Googling some of these planned trails, but the information is
        spread across websites from countless local newspapers, towns, and trail groups. So I wanted
        to create a legible user-friendly map that highlights the regional network of linear paths
        (e.g. rail trails), while also delving into how the gaps in that network were being filled.
        <br />
        <br />
        <Title order={3} pt="xl" pb="xs">
          A hub for local trail groups
        </Title>
        <Text>
          Massachusetts has 351 cities and towns, and when we build a trail we tend to gradually
          contruct it town by town. The result is countless &ldquo;friends of the ___ trail&ldquo;
          organizations, each with their own website detailing their trail&lsquo;s history and
          conditions. I want to collect this information in a single location so it&#39;s easy to
          find, allowing anyone to submit suggestions so the data is always timely and accurate. I
          want to enable these groups to share information about the trails they care about.
        </Text>
        {/* <Title order={3} pt="xl" pb="xs">
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
        <Title order={3} pt="xl" pb="xs" ta="center">
          Frequently Asked Questions
        </Title>
        <Accordion variant="separated">
          <Accordion.Item value="what-trails" key="what-trails" mb="lg">
            <Accordion.Control>What trails do you include/exclude?</Accordion.Control>
            <Accordion.Panel>
              <List spacing="xs" size="md" center>
                <List.Item icon={listCheck}>
                  Relatively long, linear, and bikeable paths across the commonwealth
                </List.Item>
                <List.Item icon={listX}>short paths crisscrossing your local town common</List.Item>
                <List.Item icon={listX}>winding loop trails through a state forest</List.Item>
                <List.Item icon={listX}>bike lanes (may add in the future)</List.Item>
              </List>
              <Text mt="sm">
                There is some level of curation that occurs and it can be a little arbitrary, but my
                goal in doing so is to have an approachable resource. There are
                <Anchor href="#other-maps"> other mapping resources </Anchor>that highlight every
                single piece of infrastructure.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="bike-lanes" key="bike-lanes" mb="lg">
            <Accordion.Control>Why don&lsquo;t you show bike lanes?</Accordion.Control>
            <Accordion.Panel>
              There are too many for me to keep track of and they vary greatly in comfort and
              quality. I plan to add a MassDot bike lane layer to the map at some point, but do not
              plan to maintain my own catalog of bike lanes.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="edit-map" key="edit-map" mb="lg">
            <Accordion.Control>How do I edit the map?</Accordion.Control>
            <Accordion.Panel>
              <ol>
                <li>Use the map to select a segment</li>
                <li>Click the edit icon on the top right of the information panel</li>
                <li>Select an option</li>
              </ol>
              You can edit:
              <ul>
                <li>
                  A segment (name, description, geometry, associated trails, open/closed status).
                </li>
                <li>Segment timeline events (name, description, date, links)</li>
                <li>Create a segment</li>
                <li>Link an existing event with aditional segments</li>
              </ul>
              <Divider my="sm" />
              It is not yet possible to:
              <ul>
                <li>Create or edit trails</li>
              </ul>
              You&lsquo;re welcome to email me those or any other changes.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="features" key="features" mb="lg">
            <Accordion.Control>Can I report a bug/request a feature?</Accordion.Control>
            <Accordion.Panel>
              Yes. Email me:
              <CopyButton value="mass.trail.tracker@gmail.com" timeout={2000}>
                {({ copied, copy }) => (
                  <Button
                    variant="outline"
                    color={copied ? 'green' : 'gray'}
                    onClick={copy}
                    leftSection={<IconCopy />}
                    ml="md"
                  >
                    {copied ? 'Email copied' : 'mass.trail.tracker@gmail.com'}
                  </Button>
                )}
              </CopyButton>
              <br />
              Here is a{' '}
              <Anchor
                target="_blank"
                href="https://noenickx.notion.site/Mass-Trail-Tracker-To-Do-8e8f71b4d5f347598c5eb63d6f9a941b"
              >
                frequently updated list
              </Anchor>{' '}
              of all the things I plan on fixing/adding.
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Container>
      <Footer />
    </>
  );
}

// https://ui.mantine.dev/category/contact/

// https://ui.mantine.dev/category/features/

// Segments of number of miles in each category?
// https://ui.mantine.dev/component/stats-segments/
