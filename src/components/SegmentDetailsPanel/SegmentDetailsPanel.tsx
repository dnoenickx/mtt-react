import { useQuery } from 'react-query';
import { Accordion, AppShell, Button, Divider, InputDescription, Text, Title } from '@mantine/core';

import { Timeline } from '../Timeline/Timeline';

import { RelatedTrail, Segment } from '@/types';
import classes from './SegmentDetailsPanel.module.css';
import { getSegment } from '@/api';
import { useEffect, useState } from 'react';

function TrailAccordion({ trails }: { trails: RelatedTrail[] }) {
  const items = trails.map(({ name, description }) => (
    <Accordion.Item key={name} value={name}>
      <Accordion.Control>
        <Text>{name}</Text>
      </Accordion.Control>
      <Accordion.Panel>{description}</Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion classNames={classes} defaultValue={trails[0].name}>
      {items}
    </Accordion>
  );
}

export function SegmentDetailsPanel({ segmentId }: { segmentId: number | undefined }) {
  const [data, setData] = useState<Segment | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (segmentId === undefined) return;

    getSegment(segmentId)
      .then((data) => {
        setData(data);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [segmentId]);

  if (segmentId === undefined) {
    return (
      <Text c="dimmed" ta="center">
        Use the map to select a trail segment and learn more.
      </Text>
    );
  }

  return (
    <>
      {loading && <Text c="dimmed">Loading...</Text>}
      {error && <Text c="dimmed">Error</Text>}
      {data && (
        <>
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Trails
          </Title>
          <TrailAccordion trails={data.trails} />
          <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Segment Description
          </Title>
          <p style={{ margin: 0 }}>{data.description}</p>
          <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Timeline
          </Title>
          <Timeline events={data.events} />
        </>
      )}
    </>
  );
}
