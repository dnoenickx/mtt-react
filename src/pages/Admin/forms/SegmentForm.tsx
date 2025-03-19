import { useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import {
  Container,
  TextInput,
  Textarea,
  Button,
  Select,
  Title,
  Text,
  Group,
  MultiSelect,
  Box,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { randomId, useDisclosure } from '@mantine/hooks';
import { IconPlus, IconMap } from '@tabler/icons-react';
import { feature, featureCollection, multiLineString } from '@turf/turf';
import { RawSegment, RawTrailEvent, SegmentState } from '@/types';
import { deepEqual, formatDateString } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import { cleanToMultiLineString } from '@/geospatialUtils';
import MultiLineEditor from '@/components/MultiLineEditor/MultiLineEditor';
import { EventSearch, TimelineEditor, FormTrailEvent } from './EventEditorHelpers';
import LinksField, { FormLink, toRawLinks } from '../common/LinksField';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import { AdminForm } from '../AdminForm';
import useNavigateBack from '@/hooks/useNavigateBack';

type FormSegment = Omit<RawSegment, 'state' | 'trails' | 'geometry' | 'links' | 'events'> & {
  state: SegmentState | null;
  trails: string[];
  geometry: string;
  links: FormLink[];
  events: FormTrailEvent[];
};

const SegmentForm = () => {
  const navigate = useNavigate();
  const navigateBack = useNavigateBack();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, getSegment, getNextId, saveChanges } = useData();

  const [opened, { open, close }] = useDisclosure(false);

  // Reset scroll on page load
  useEffect(() => window.scrollTo(0, 0), [navigate]);

  const initialSegment: FormSegment | null = useMemo(() => {
    if (id === undefined) return null;

    if (isCreating) {
      return {
        id: getNextId('segments'),
        name: '',
        description: '',
        state: null,
        geometry: JSON.stringify(multiLineString([]).geometry),
        trails: [],
        events: [],
        links: [],
      };
    }

    const segment = getSegment(Number(id));
    if (segment === null) return null;

    return {
      ...segment,
      trails: segment.trails.map((trail) => trail.id.toString()),
      geometry: JSON.stringify(segment.geometry),
      links: segment.links.map((link) => ({
        ...link,
        id: randomId(),
      })),
      events: segment.events.map((event) => ({
        ...event,
        links: event.links.map((link) => ({
          ...link,
          id: randomId(),
        })),
        date: formatDateString(event.date),
      })),
    };
  }, [id]);

  if (initialSegment === null) {
    return (
      <Container size="sm" py="xl" style={{ textAlign: 'center' }}>
        <Title order={3} c="red" mb="md">
          Segment Not Found
        </Title>
        <Text size="lg" mb="md">
          The segment you are looking for does not exist.
        </Text>
        <Group justify="center" grow>
          <Button variant="outline" onClick={() => navigateBack('/admin/segments')}>
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  const form = useForm<FormSegment>({
    initialValues: initialSegment,
    validateInputOnBlur: true,
    validate: {
      state: (value) => (value === null ? 'State is required' : null),
      events: {
        headline: (value) => (value === '' ? 'Headline required' : null),
        date: (value) =>
          Number.isNaN(new Date(value).getTime()) ? 'Expectded yyyy-mm-dd format' : null,
        date_precision: (value) => (value === null ? 'Date precision is required' : null),
      },
    },
  });

  const handleSubmit = (formSegment: FormSegment) => {
    if (!deepEqual(initialSegment, formSegment)) {
      const rawSegment: RawSegment = {
        ...formSegment,
        name: formSegment.name.trim(),
        description: formSegment.description.trim(),
        state: formSegment.state as SegmentState,
        trails: formSegment.trails.map((trailId) => Number(trailId)),
        events: formSegment.events
          .sort((a, b) => +new Date(b.date) - +new Date(a.date))
          .map(({ id: eventId }) => eventId),
        links: toRawLinks(formSegment.links),
        geometry: cleanToMultiLineString(JSON.parse(formSegment.geometry)),
      };

      const rawEvents: RawTrailEvent[] = formSegment.events
        .map((event) => ({
          ...event,
          headline: event.headline.trim(),
          description: event.description.trim(),
          date: formatDateString(event.date),
          links: toRawLinks(event.links),
        }))
        .filter((event): event is RawTrailEvent => event.date_precision !== null);

      saveChanges({ segments: [rawSegment], trailEvents: rawEvents });
    }

    navigateBack('/admin/segments');
  };

  const handleCreateNewTrailEvent = () => {
    const trailEvent: FormTrailEvent = {
      id: getNextId(
        'trailEvents',
        form.values.events.map((event) => event.id)
      ),
      headline: '',
      date: '',
      date_precision: null,
      description: '',
      links: [],
    };
    form.insertListItem('events', trailEvent, 0);
  };

  return (
    <AdminForm
      itemId={initialSegment.id}
      isCreating={isCreating}
      onSubmit={form.onSubmit(handleSubmit)}
      objectType="segments"
    >
      <TextInput
        label="Name"
        description="Short descriptor (e.g. x street to y road, phase 2)"
        {...form.getInputProps('name')}
      />

      <Select
        label="State"
        data={Object.entries(SEGMENT_STATES).map(([value, { label }]) => ({
          value,
          label,
        }))}
        description="If necessary, describe state further within description"
        required
        {...form.getInputProps('state')}
      />

      <Textarea
        autosize
        minRows={3}
        label="Description"
        description="Information specific to this segment (e.g. conditions, amenities, progress)"
        {...form.getInputProps('description')}
      />

      <Box>
        <Text size="sm" fw={500}>
          Geometry
        </Text>
        <Text color="dimmed" size="12px" lh="14.4px">
          Open the editor to modify geometry, If you are having trouble, just describe the change in
          the description field above
        </Text>

        <Group justify="center" mt="md">
          <Button variant="light" onClick={open} leftSection={<IconMap />}>
            Open Editor
          </Button>

          <MultiLineEditor
            opened={opened}
            onClose={(value) => {
              if (value !== undefined) {
                const positionLists = value.features.map((feat) => feat.geometry.coordinates);
                form.setFieldValue(
                  'geometry',
                  JSON.stringify(multiLineString(positionLists).geometry)
                );
              }
              close();
            }}
            initialGeojson={featureCollection([feature(JSON.parse(form.values.geometry))])}
          />
        </Group>
      </Box>

      <MultiSelect
        searchable
        label="Trails"
        data={Object.values(currentData.trails).map((trail) => ({
          value: trail.id.toString(),
          label: trail.name,
        }))}
        placeholder="Select trails"
        {...form.getInputProps('trails')}
      />

      <LinksField
        {...form.getInputProps('links')}
        description="If link is more relevant to trail or timeline event, add link there instead"
      />

      <Box>
        <Text size="sm" fw={500}>
          Timeline
        </Text>
        <Text color="dimmed" size="12px" lh="14.4px">
          Create new timeline events or lookup existing ones to link them to this segment
        </Text>

        <Group justify="center" mt="md">
          <EventSearch
            form={form}
            trailIds={form.values.trails.map(Number)}
            eventIds={form.values.events.map(({ id: eventId }) => eventId)}
          />

          <Button variant="light" onClick={handleCreateNewTrailEvent} leftSection={<IconPlus />}>
            Add Event
          </Button>
        </Group>

        <TimelineEditor form={form} />
      </Box>
    </AdminForm>
  );
};

export default SegmentForm;
