import {
  Container,
  Title,
  Accordion,
  Text,
  List,
  ThemeIcon,
  rem,
  Anchor,
  Button,
  Group,
} from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconDownload, IconExternalLink } from '@tabler/icons-react';
import { useDocumentTitle } from '@mantine/hooks';
import { Footer } from '@/components/Footer/Footer';
import { EmailButton } from '@/components/Atomic/Atomic';
import { useData } from '@/components/DataProvider/DataProvider';
import { handleDownload } from '@/utils';

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
  useDocumentTitle('About | Mass Trail Tracker');

  const { currentData } = useData();

  const downloadData = () => {
    const data: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
      type: 'FeatureCollection',
      features: Object.values(currentData.segments).map(({ id, geometry, state, trails }) => ({
        id,
        type: 'Feature',
        geometry: geometry as GeoJSON.MultiLineString,
        properties: {
          state,
          trails: trails.map((trailId) => currentData.trails[trailId].name),
          trailIds: trails.map((trailId) => currentData.trails[trailId].id),
        },
      })),
    };

    handleDownload('trail_data.geojson', JSON.stringify(data));
  };

  return (
    <>
      <Container size="sm" py="xl">
        <Title order={1} pt="xl" pb="xs">
          About
        </Title>
        <Title order={3} pt="xl" pb="xs">
          Mission
        </Title>
        To provide a user-friendly resource for discovering trails throughout Massachusetts. This
        platform emphasizes detailed timelines and descriptions of trails, filling the gap on when
        and how the trail network is expanding. By offering direct links to trail groups, news
        articles, and project websites, it aims to connect users and trail advocates while bringing
        clarity to the evolving trail network.
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
        <Text mt="sm">
          The maps above show existing and planned trails in great detail and are updated by{' '}
          <span>actual state agencies</span>!
        </Text>
        <Text mt="sm">
          I came up with the idea for this website after researching the history of various trails
          and the timelines for planned extensions. This information was scattered across countless
          local newspapers, town websites, and friends group pages, making it hard to keep track of.
        </Text>
        <Text mt="sm">
          When you see &ldquo;planned&ldquo; on other maps, it can mean a lot of things: a project
          nearing completion; something that&lsquo;s been funded and designed; or simply an idea
          some residents are advocating for. I wanted to make a map of linear paths while providing
          clear context about the status of these projects, complete with timelines and links to
          sources.
        </Text>
        <Title order={3} pt="xl" pb="xs">
          A hub for local trail groups
        </Title>
        <Text>
          Massachusetts&lsquo; trail-building approach usually occurs town by town, resulting in a
          patchwork of local &ldquo;friends of the trail&rdquo; organizations, each maintaining
          separate websites with valuable but isolated information. This map serves as a centralized
          platform where these dedicated groups can showcase their work and connect with users.
        </Text>
        <Text mt="sm">
          I&lsquo;ve built features so anyone can submit trail updates to ensure information remains
          current and accurate. Trail advocates can benefit from direct links to specific trails,
          and soon will be able to embed customized versions of this map on their own websites. By
          partnering with groups like the Mass Central Rail Trail Coalition and providing tools that
          work across municipal boundaries, this resource strengthens the statewide trail advocacy
          community while making information more accessible to everyone.
        </Text>
        <Title order={3} pt="xl" pb="xs">
          About me
        </Title>
        <Text>
          My name is Danny. I&apos;m from Boston and mostly get around by bike, occasionally
          enjoying longer rides around Eastern Mass. I&apos;m software engineer and enjoys making
          maps (and biking), so this is a personal passion project of mine.
        </Text>
        <Text mt="sm">
          I regularly use trails like the Southwest Corridor, sections of the Emerald Necklace,
          Charles River paths, and Somerville Community Path. These trails aren&apos;t just pleasant
          places to relax - they&apos;re practical transportation infrastructure that improves daily
          life.
        </Text>
        <Text mt="sm" pb="xl">
          What excites me most is how Massachusetts has reached point with trail development where
          many of our trail are connecting and really forming a network with good connections. These
          connections support exercise, day trips, weekend getaways, and daily transportation while
          benefiting local economies, climate goals, and public health.
        </Text>
        <Title order={3} pt="xl" pb="xs" ta="center">
          Frequently Asked Questions
        </Title>
        <Accordion variant="separated">
          <Accordion.Item value="mcrt-route" key="mcrt-route" mb="lg">
            <Accordion.Control>
              What&apos;s the best current route along the Mass Central Rail Trail?
            </Accordion.Control>
            <Accordion.Panel>
              Here is the route from the Fall 2024 RN2B (Ride Northampton to Boston)
              <br />
              <Button
                component="a"
                href="https://ridewithgps.com/routes/47996539"
                onClick={(event) => event.preventDefault()}
                c="dimmed"
                leftSection={<IconExternalLink size={14} />}
                variant="default"
                styles={{
                  root: {
                    height: 'auto',
                    paddingTop: '3px',
                    paddingBottom: '3px',
                  },
                  label: {
                    whiteSpace: 'pre-line',
                    textAlign: 'left',
                    lineHeight: 1.25,
                  },
                }}
              >
                Ride With GPS
              </Button>
            </Accordion.Panel>
          </Accordion.Item>
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
              quality. I plan to add a MassDOT bike lane layer to the map at some point, but do not
              plan to maintain my own catalog of bike lanes.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="features" key="features" mb="lg">
            <Accordion.Control>Can I report a bug/request a feature?</Accordion.Control>
            <Accordion.Panel>
              <Group>
                <span>Yes. Email me:</span>
                <EmailButton />
              </Group>
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
          <Accordion.Item value="data-download" key="data-download" mb="lg">
            <Accordion.Control>Where can I download the GIS data?</Accordion.Control>
            <Accordion.Panel>
              <Button onClick={downloadData} leftSection={<IconDownload />}>
                Download GeoJSON
              </Button>
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
