import React from 'react';

import { Accordion, Divider, Text, Title } from '@mantine/core';

import { Trail } from '@/types';
import { useData } from '@/data/DataContext';
import { Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';

function TrailAccordion({ trails }: { trails: Trail[] }) {
  const items = trails.map(({ name, description }) => (
    <Accordion.Item key={name} value={name}>
      <Accordion.Control>
        <Text>{name}</Text>
      </Accordion.Control>
      <Accordion.Panel>{description}</Accordion.Panel>
    </Accordion.Item>
  ));

  // TODO: zero index below throws error if no trails
  return (
    <Accordion classNames={classes} defaultValue={trails[0].name}>
      {items}
    </Accordion>
  );
}

export function SegmentDetailsPanel({ segmentId }: { segmentId: number | undefined }) {
  const { segments, trails, newsflashes } = useData();

  if (!segmentId) {
    return (
      <Text c="dimmed" ta="center">
        Use the map to select a trail segment and learn more.
      </Text>
    );
  }
  const segment = segments.find((s) => s.id === segmentId)!;
  const segmentTrails = trails.filter((t) => segment?.trailIds.includes(t.id));
  const segmentNews = newsflashes.filter((n) => n.segmentIds.includes(segment.id));

  return (
    <>
      {!segment ? (
        'Error'
      ) : (
        <>
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Segment Description
          </Title>
          <p style={{ color: 'gray', margin: 0, fontSize: 'smaller' }}>Segment ID: {segment.id}</p>
          <p style={{ margin: 0 }}>{segment.description || 'No description yet'}</p>
          <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Trails
          </Title>
          <TrailAccordion trails={segmentTrails} />
          <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Timeline
          </Title>
          {segmentNews.length ? (
            <Timeline events={segmentNews} />
          ) : (
            <p>No events yet. Check back later</p>
          )}
        </>
      )}
    </>
  );
}
