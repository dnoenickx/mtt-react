import React, { useMemo } from 'react';

import { IconAlertCircle, IconPencil } from '@tabler/icons-react';
import {
  Accordion,
  Alert,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@mantine/hooks';

import { Segment, Trail } from '@/types';
import { Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';
import { LinkGroup, MultiLineText } from '../Atomic/Atomic';
import { useData } from '../DataProvider/DataProvider';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';

function TrailAccordion({ trails }: { trails: Trail[] }) {
  const items = trails.map(({ id, name, description, links }) => (
    <Accordion.Item key={name} value={name}>
      <Accordion.Control>
        <Text>{name}</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <MultiLineText text={description} size="sm" />
        <LinkGroup links={links} />
        <Group justify="flex-end">
          {/* <Button
            variant="subtle"
            leftSection={<IconSearch style={{ width: '65%', height: '65%' }} />}
            c="dimmed"
            size="compact-xs"
            styles={{
              section: {
                marginRight: -2,
              },
            }}
          >
            zoom
          </Button> */}
          <Button
            variant="subtle"
            leftSection={<IconPencil style={{ width: '65%', height: '65%' }} />}
            c="dimmed"
            size="compact-xs"
            styles={{
              section: {
                marginRight: -2,
              },
            }}
            component={Link}
            to={`/admin/trails/${id}`}
          >
            edit
          </Button>
        </Group>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion classNames={classes} defaultValue={trails[0]?.name} key={trails[0]?.name}>
      {items}
    </Accordion>
  );
}

export function SegmentDetailsPanel() {
  const [searchParams] = useSearchParams();
  const segmentId = Number(searchParams.get('segment')?.split(',')[0]);

  const { getSegment } = useData();
  const segment: Segment | null = useMemo(() => getSegment(segmentId), [segmentId]);

  const title =
    !segmentId || segment === null
      ? 'Mass Trail Tracker'
      : segment.name || segment.trails.find(({ name }) => name)?.name || 'Mass Trail Tracker';
  useDocumentTitle(title);

  // No segment selected
  if (!segmentId) {
    return (
      <Text c="dimmed" ta="center">
        Use the map to select a trail segment and learn more.
      </Text>
    );
  }

  // Error finding segment
  if (segment === null) {
    return (
      <Alert variant="light" color="red" title="Segment not found" icon={<IconAlertCircle />}>
        Use the map to select another one!
      </Alert>
    );
  }

  return (
    <>
      {/* <Group align="baseline" justify="space-between"> */}
      <Title order={4} mb="md" mt="sm" c="var(--mantine-color-trail-green-text)">
        Segment
      </Title>
      {/* </Group> */}
      <Flex justify="space-between" wrap="wrap" rowGap="xs" mb="sm">
        {segment.name && <Title order={5}>{segment.name}</Title>}
        <Tooltip
          multiline
          w={220}
          withArrow
          transitionProps={{ duration: 200 }}
          label={SEGMENT_STATES[segment.state].description}
        >
          <Badge variant="outline" color={SEGMENT_STATES[segment.state].color}>
            {SEGMENT_STATES[segment.state].label}
          </Badge>
        </Tooltip>
      </Flex>
      <MultiLineText m={0} text={segment.description} />
      <LinkGroup links={segment.links} />
      <Group justify="flex-end">
        <Button
          variant="subtle"
          leftSection={<IconPencil style={{ width: '65%', height: '65%' }} />}
          size="compact-xs"
          styles={{
            section: {
              marginRight: -2,
            },
          }}
          component={Link}
          to={`/admin/segments/${segment.id}`}
          c="dimmed"
        >
          edit
        </Button>
      </Group>

      <Divider size="xs" style={{ marginTop: 20, marginBottom: 7 }} />
      <Title order={4} my="md" c="var(--mantine-color-trail-green-text)">
        Trails
      </Title>
      <TrailAccordion trails={segment.trails} />

      <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
      <Title order={4} my="md" c="var(--mantine-color-trail-green-text)">
        Timeline
      </Title>
      <Timeline events={segment.events} />
    </>
  );
}
