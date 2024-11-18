import React, { useEffect, useState } from 'react';

import { Accordion, Divider, Group, Text, Title } from '@mantine/core';

import { Segment, Trail } from '@/types';
import { Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';
import { LinkGroup, MultiLineText } from '../Atomic/Atomic';
import { useSearchParams } from 'react-router-dom';

function TrailAccordion({ trails }: { trails: Trail[] }) {
  const items = trails.map(({ name, description, links }) => (
    <Accordion.Item key={name} value={name}>
      <Accordion.Control>
        <Text>{name}</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <MultiLineText text={description} />
        <LinkGroup links={links} />
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return <Accordion classNames={classes}>{items}</Accordion>;
}

export function SegmentDetailsPanel() {
  const [segment, setSegment] = useState<Segment | undefined>(undefined);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchSegment = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/segments/${searchParams.get('segment')}/`
        );
        const data: Segment = await response.json();
        data.events = data.events.map((event) => ({
          ...event,
          date: new Date(event.date),
        }));
        setSegment(data);
      } catch (error) {
        console.error('Error fetching segment:', error);
      }
    };

    if (searchParams.get('segment')) {
      fetchSegment();
    }
  }, [searchParams]);

  if (!segment)
    return (
      <Text c="dimmed" ta="center">
        Use the map to select a trail segment and learn more.
      </Text>
    );

  return (
    <>
      {!segment ? (
        'Error'
      ) : (
        <>
          <Group justify="space-between">
            <Title
              order={4}
              style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
            >
              Segment
            </Title>
          </Group>
          {segment.name && <Title order={5}>{segment.name}</Title>}
          <MultiLineText m={0} text={segment.description} />
          <LinkGroup links={segment.links} />

          <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Trails
          </Title>
          <TrailAccordion trails={segment.trails} />

          <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
          <Title
            order={4}
            style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
          >
            Timeline
          </Title>
          <Timeline events={segment.events} />
        </>
      )}
    </>
  );
}
