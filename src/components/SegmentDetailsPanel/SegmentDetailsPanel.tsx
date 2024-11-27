import React, { useMemo } from 'react';

import { IconAlertCircle } from '@tabler/icons-react';
import { Accordion, Alert, Divider, Skeleton, Text, Title } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';

import { Trail } from '@/types';
import { LoadingTimeline, Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';
import { LinkGroup, MultiLineText, SkeletonParagraph } from '../Atomic/Atomic';
import data from '../../data.json';
import { DatePrecision } from '../../types';

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
    <Accordion classNames={classes} defaultValue={trails.length ? trails[0].name : undefined}>
      {items}
    </Accordion>
  );
}

export function SegmentDetailsPanel() {
  const [searchParams] = useSearchParams();
  const segmentId = searchParams.get('segment');

  const segment = useMemo(() => {
    const seg = data.segments.find(({ id }) => id.toString() === segmentId);

    if (seg === undefined) {
      return null;
    }

    const { name, description, links: linksIds, trails: trailsIds, events: eventsIds } = seg;

    return {
      name,
      description,
      links: data.links.filter(({ id }) => linksIds.includes(id)),
      trails: data.trails
        .filter(({ id }) => trailsIds.includes(id))
        .map((trail) => ({
          ...trail,
          links: data.links.filter(({ id }) => trail.links.includes(id)),
        })),
      events: data.trail_events
        .filter(({ id }) => eventsIds.includes(id))
        .map((event) => ({
          ...event,
          date: new Date(event.date),
          date_precision: event.date_precision as DatePrecision,
          links: data.links.filter(({ id }) => event.links.includes(id)),
        })),
    };
  }, [segmentId]);

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

  // TODO: use loaders again we needed
  const showLoaders = false;

  return (
    <>
      <Title order={4} mb={15} mt={25} style={{ color: 'var(--mantine-color-trail-green-8)' }}>
        Segment
      </Title>

      {showLoaders ? (
        <>
          <Skeleton height={18} mt={6} radius="lg" />
          <SkeletonParagraph lines={2} height={16} mt={8.4} radius="xl" />
        </>
      ) : (
        <>
          {segment.name && <Title order={5}>{segment.name}</Title>}
          <MultiLineText m={0} text={segment.description} />
          <LinkGroup links={segment.links} />
        </>
      )}

      <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
      <Title order={4} my={15} style={{ color: 'var(--mantine-color-trail-green-8)' }}>
        Trails
      </Title>

      {showLoaders ? (
        <>
          <Skeleton height={48} mt={6} />
          <Skeleton height={48} mt={6} />
        </>
      ) : (
        <TrailAccordion trails={segment.trails} />
      )}

      <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
      <Title order={4} my={15} style={{ color: 'var(--mantine-color-trail-green-8)' }}>
        Timeline
      </Title>

      {showLoaders ? <LoadingTimeline /> : <Timeline events={segment.events} />}

      {/* <Fieldset legend="New Event" variant="filled" radius="md" mt="md">
        <TextInput label="Title" placeholder="Title" />
        <Textarea label="Description" placeholder="Description" mt="md" />

        <Group grow mt="sm">
          <Button variant="outline">Discard</Button>
          <Button variant="filled">Submit</Button>
        </Group>
      </Fieldset>

      <Button
        justify="center"
        fullWidth
        leftSection={<IconNewSection size={14} />}
        variant="light"
        mt="md"
      >
        Add Event
      </Button> */}
    </>
  );
}
