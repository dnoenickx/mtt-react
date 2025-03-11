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
  Menu,
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
  const items = trails.map(({ name, description, links }) => (
    <Accordion.Item key={name} value={name}>
      <Accordion.Control>
        <Text>{name}</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <MultiLineText text={description} size="sm" />
        <LinkGroup links={links} />
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

  const { getSegment, editingEnabled } = useData();
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
      <Group align="baseline" justify="space-between">
        <Title order={4} mb="md" mt="sm" style={{ color: 'var(--mantine-color-trail-green-8)' }}>
          Segment
        </Title>
        {editingEnabled && (
          <Menu
            trigger="click-hover"
            loop={false}
            withinPortal={false}
            trapFocus={false}
            menuItemTabIndex={0}
            shadow="md"
            width={200}
          >
            <Menu.Target>
              <Button
                variant="outline"
                leftSection={<IconPencil style={{ width: '70%', height: '70%' }} />}
                size="compact-sm"
                styles={{
                  section: {
                    margin: 0,
                  },
                }}
              >
                edit
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Segments</Menu.Label>
              <Menu.Item component={Link} to={`/admin/segments/${segment.id}`} key={segment.id}>
                {segment.name || `Segment ${segment.id}`}
              </Menu.Item>
              <Menu.Label>Trails</Menu.Label>
              {segment.trails.map(({ id, name }) => (
                <Menu.Item component={Link} to={`/admin/trails/${id}`} key={id}>
                  {name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
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

      <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
      <Title order={4} my="md" style={{ color: 'var(--mantine-color-trail-green-8)' }}>
        Trails
      </Title>
      <TrailAccordion trails={segment.trails} />

      <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
      <Title order={4} my="md" style={{ color: 'var(--mantine-color-trail-green-8)' }}>
        Timeline
      </Title>
      <Timeline events={segment.events} />
    </>
  );
}
