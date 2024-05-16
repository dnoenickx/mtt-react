import React from 'react';

import { Accordion, Divider, Group, Text, Title, UnstyledButton } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { Trail } from '@/types';
import { useData } from '@/data/DataContext';
import { Timeline } from '../Timeline/Timeline';

import classes from './SegmentDetailsPanel.module.css';
import EditMenu from '../EditMenu/EditMenu';
import SegmentEditPopup from '../SegmentEditPopup/SegmentEditPopup';
import { TimelineEditorModal } from '../TimelineEditorModal/TimelineEditorModal';
import { LinkGroup, MultiLineText } from '../Atomic/Atomic';
import { generateRandomId } from '@/utils';

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

// export function SegmentDetailsPanel({ segmentId = 9130 }: { segmentId: number | undefined }) {
export function SegmentDetailsPanel({ segmentId }: { segmentId: number | undefined }) {
  const { segments, trails, newsflashes } = useData();
  const [segmentCreatePopupOpened, segmentCreatePopupToggle] = useDisclosure(false);
  const [segmentEditPopupOpened, segmentEditPopupToggle] = useDisclosure(false);
  const [newsflashPopupOpened, newsflashPopupToggle] = useDisclosure(false);

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
          {segmentCreatePopupOpened && (
            <SegmentEditPopup
              segment={{
                id: generateRandomId(segments.map((s) => s.id)),
                name: '',
                description: '',
                state: 'paved',
                trailIds: [],
                geometry: {
                  type: 'MultiLineString',
                  coordinates: [[]],
                },
                links: [],
              }}
              opened={segmentCreatePopupOpened}
              close={segmentCreatePopupToggle.close}
            />
          )}
          {segmentEditPopupOpened && (
            <SegmentEditPopup
              segment={segment}
              opened={segmentEditPopupOpened}
              close={segmentEditPopupToggle.close}
            />
          )}
          {newsflashPopupOpened && (
            <TimelineEditorModal
              newsflashes={segmentNews}
              opened={newsflashPopupOpened}
              close={newsflashPopupToggle.close}
              segmentId={segmentId}
            />
          )}
          <Group justify="space-between">
            <Title
              order={4}
              style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}
            >
              Segment
            </Title>
            <EditMenu
              openSegmentCreator={segmentCreatePopupToggle.open}
              openSegmentEditor={segmentEditPopupToggle.open}
              openEventEditor={newsflashPopupToggle.open}
            />
          </Group>
          {!segment.description && !segment.links.length ? (
            <UnstyledButton td="underline" m={0} c="dimmed" onClick={segmentEditPopupToggle.open}>
              Add a description
            </UnstyledButton>
          ) : (
            <>
              <MultiLineText m={0} text={segment.description} />
              <LinkGroup links={segment.links} />
            </>
          )}
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
            <UnstyledButton td="underline" m={0} c="dimmed" onClick={newsflashPopupToggle.open}>
              Add a event
            </UnstyledButton>
          )}
        </>
      )}
    </>
  );
}
