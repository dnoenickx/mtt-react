import React, { useEffect, useState } from 'react';

import { Accordion, Alert, Button, Divider, Skeleton, Text, Title } from '@mantine/core';

import { Segment, Trail } from '@/types';
import { LoadingTimeline, Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';
import { LinkGroup, MultiLineText, SkeletonParagraph } from '../Atomic/Atomic';
import { useSearchParams } from 'react-router-dom';
import { IconAlertCircle } from '@tabler/icons-react';

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

  return <Accordion classNames={classes}>{items}</Accordion>;
}

export function SegmentDetailsPanel() {
  const [searchParams] = useSearchParams();
  const segmentId = searchParams.get('segment');

  const [segment, setSegment] = useState<Segment | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSegment = async () => {
    setError(false);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/segments/${segmentId}/`);
      const data: Segment = await response.json();
      data.events = data.events.map((event) => ({
        ...event,
        date: new Date(event.date),
      }));
      setSegment(data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (segmentId) {
      fetchSegment();
    }
  }, [segmentId]);

  if (error) {
    return (
      <Alert
        variant="light"
        color="red"
        title="Failed to load segment details"
        icon={<IconAlertCircle />}
      >
        <Button variant="outline" color="red" size="compact-sm" onClick={fetchSegment}>
          Try Again
        </Button>
      </Alert>
    );
  }

  if (!segment && !loading) {
    return (
      <Text c="dimmed" ta="center">
        Use the map to select a trail segment and learn more.
      </Text>
    );
  }

  const showLoaders = loading || !segment;

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
    </>
  );
}
