import React, { useMemo, useState } from 'react';

import { IconAlertCircle, IconCopy, IconPencil, IconShare, IconShare3 } from '@tabler/icons-react';
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
  Menu,
  Popover,
  Checkbox,
  CopyButton,
  Stack,
} from '@mantine/core';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@mantine/hooks';

import { Segment, Trail } from '@/types';
import { Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';
import { LinkGroup, MultiLineText } from '../../../../components/Atomic';
import { useData } from '../../../../components/DataProvider/DataProvider';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import { createSlug } from '@/utils';

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

function ShareMenu({ segment, trails }: { segment: number; trails: Trail[] }) {
  const [includeSegment, setIncludeSegment] = useState(true);
  const [selectedTrails, setSelectedTrails] = useState<Set<number>>(new Set());

  // Toggle trail selection
  const toggleTrail = (id: number) => {
    setSelectedTrails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build share URL
  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (includeSegment) {
      params.append('segment', String(segment));
    }

    trails.forEach((trail) => {
      if (selectedTrails.has(trail.id)) {
        params.append('trail', trail.slug ?? createSlug(trail.name));
      }
    });

    const base = window.location.origin + window.location.pathname;
    const query = params.toString();

    return query ? `${base}?${query}` : base;
  }, [includeSegment, selectedTrails, trails, segment]);

  return (
    <Popover width={220} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Button
          variant="subtle"
          leftSection={<IconShare3 style={{ width: '65%', height: '65%' }} />}
          size="compact-xs"
          styles={{
            section: { marginRight: -2 },
          }}
          c="dimmed"
        >
          share
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="xs">
          <Checkbox
            label={`Segment ${segment}`}
            checked={includeSegment}
            onChange={(e) => setIncludeSegment(e.currentTarget.checked)}
          />

          {trails.map(({ id, slug, name }) => (
            <Checkbox
              key={id}
              label={name}
              checked={selectedTrails.has(id)}
              onChange={() => toggleTrail(id)}
            />
          ))}

          <CopyButton value={shareUrl} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                variant="outline"
                color={copied ? 'green' : 'gray'}
                onClick={copy}
                leftSection={<IconCopy style={{ width: '75%', height: '75%' }} />}
                size="xs"
                mt="xs"
              >
                {copied ? 'Link copied' : 'Copy Link'}
              </Button>
            )}
          </CopyButton>

          <Text size="xs" c="dimmed">
            Selected items will be zoomed to and highlighted
          </Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
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
      <Group justify="flex-end" mt="xs">
        <ShareMenu segment={segment.id} trails={segment.trails} />
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

      <Divider size="xs" style={{ marginTop: 7, marginBottom: 7 }} />
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
