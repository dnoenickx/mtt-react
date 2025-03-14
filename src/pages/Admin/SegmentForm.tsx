import { useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturnType } from '@mantine/form';
import {
  Container,
  TextInput,
  OptionsFilter,
  ComboboxParsedItemGroup,
  Textarea,
  Button,
  Select,
  Title,
  Text,
  Group,
  MultiSelect,
  Box,
  ActionIcon,
  Divider,
  Fieldset,
  Breadcrumbs,
  Anchor,
  Stack,
  Modal,
  Flex,
} from '@mantine/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { randomId, useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { IconPlus, IconSearch, IconX, IconMap } from '@tabler/icons-react';
import { feature, featureCollection, multiLineString } from '@turf/turf';
import { DatePrecision, RawSegment, RawTrailEvent, SegmentState } from '@/types';
import { SEGMENT_STATES } from '../TrailMap/TrailMap.config';
import { deepEqual, formatDateString } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import LinksField, { FormLink, toRawLinks } from './LinksField';
import { cleanToMultiLineString } from '@/geospatialUtils';
import ConfirmationButton from '@/components/ConfirmationButton';
import { StickyBox } from '@/components/Atomic/Atomic';
import MultiLineEditor from '@/components/MultiLineEditor/MultiLineEditor';

type FormTrailEvent = Omit<RawTrailEvent, 'date_precision' | 'links'> & {
  date_precision: DatePrecision | null;
  links: FormLink[];
};

type FormSegment = Omit<RawSegment, 'state' | 'trails' | 'geometry' | 'links' | 'events'> & {
  state: SegmentState | null;
  trails: string[];
  geometry: string;
  links: FormLink[];
  events: FormTrailEvent[];
};

const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w\s]/gi, '');

const optionsFilter: OptionsFilter = (input) => {
  const { search } = input;
  const options = input.options as ComboboxParsedItemGroup[];

  if (!search) return options;
  // TODO: should have a section for events already edited

  const searchNormalized = normalizeString(search);

  // Filter by year (if input is a valid year)
  const isYear = /^\d{4}$/.test(search);
  if (isYear) {
    return options.filter((item) => {
      if ('group' in item) {
        return item.group === search;
      }
      return false;
    });
  }

  // Filter by item label or description
  return options
    .map((item) => {
      const filteredItems = item.items.filter((innerItem) => {
        // TODO: this search could be a lot better
        const itemString = typeof innerItem === 'string' ? innerItem : innerItem.label;
        const normalizedItemString = normalizeString(itemString);
        return normalizedItemString.includes(searchNormalized);
      });

      // Return the group if it has any filtered items
      return filteredItems.length > 0 ? { group: item.group, items: filteredItems } : null;
    })
    .filter(Boolean) as ComboboxParsedItemGroup[];
};

function EventSearch({ form }: { form: UseFormReturnType<FormSegment> }) {
  const [opened, setOpened] = useState(false);
  const { currentData } = useData();

  const groupedByYear = Object.values(currentData.trailEvents)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .reduce((acc: Map<number, RawTrailEvent[]>, event: RawTrailEvent) => {
      const year = new Date(event.date).getFullYear();

      // Use push to add the event to the array for the corresponding year
      if (!acc.has(year)) {
        acc.set(year, []);
      }
      acc.get(year)?.push(event);

      return acc;
    }, new Map());

  const eventData = Array.from(groupedByYear.entries()).map(([year, events]) => ({
    group: year.toString(),
    items: events.map((event) => ({
      value: event.id.toString(),
      label: event.headline,
      description: event.description,
      date: event.date,
    })),
  }));

  return (
    <>
      <Button variant="light" leftSection={<IconSearch />} onClick={() => setOpened(true)}>
        Search Events
      </Button>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Select an Event" centered>
        <Select
          label="Search Existing Events"
          placeholder="Search and select an event"
          data={eventData}
          onChange={(value) => {
            if (value === null) return;
            const selectedEvent = currentData.trailEvents[Number(value)];
            if (selectedEvent) {
              form.insertListItem('events', { ...selectedEvent });
              setOpened(false);
            }
          }}
          filter={optionsFilter}
          nothingFoundMessage="Nothing found..."
          searchable
          clearable
          renderOption={({ option }) => (
            <Stack gap={0}>
              <Text size="sm">{option.label}</Text>
              <Text size="xs" color="dimmed" lineClamp={2}>
                {currentData.trailEvents[Number(option.value)].description}
              </Text>
            </Stack>
          )}
        />
      </Modal>
    </>
  );
}

function EventsEditor({ form }: { form: UseFormReturnType<FormSegment> }) {
  const events = form.values.events.map((event, index) => (
    <Fieldset key={event.id} variant="filled" p={{ base: 'xs', sm: 'md' }} mt="xs" pos="relative">
      {/* Top-right Delete Button */}
      <ActionIcon
        title="Remove Event"
        variant="subtle"
        color="red"
        onClick={() => form.removeListItem('events', index)}
        style={{ position: 'absolute', top: 4, right: 3 }}
      >
        <IconX size="1rem" />
      </ActionIcon>

      <Stack gap="xs">
        {/* Headline and Date Group */}
        <Flex gap="xs" direction={{ base: 'column', md: 'row' }}>
          <TextInput
            label="Headline"
            placeholder="Event title"
            {...form.getInputProps(`events.${index}.headline`)}
            w={{ base: '100%', md: '55%' }}
          />

          {/* Date & Precision should wrap together when needed */}
          <Flex gap="xs" w={{ base: '100%', md: '45%' }} direction={{ base: 'column', xs: 'row' }}>
            <TextInput
              label="Date"
              placeholder="YYYY-MM-DD"
              {...form.getInputProps(`events.${index}.date`)}
              w={{ base: '100%', xs: '50%' }}
            />
            <Select
              label="Date Precision"
              placeholder="Select precision"
              data={[
                { value: 'd', label: 'Day' },
                { value: 'm', label: 'Month' },
                { value: 's', label: 'Season' },
                { value: 'y', label: 'Year' },
              ]}
              value={form.values.events[index].date_precision || ''}
              {...form.getInputProps(`events.${index}.date_precision`)}
              w={{ base: '100%', xs: '50%' }}
            />
          </Flex>
        </Flex>

        {/* Description & Links */}
        <Textarea
          label="Description"
          placeholder="Event description"
          {...form.getInputProps(`events.${index}.description`)}
          minRows={3}
          autosize
        />
        <LinksField {...form.getInputProps(`events.${index}.links`)} />
      </Stack>
    </Fieldset>
  ));

  return <Stack px={{ base: 0, sm: 'md' }}>{events}</Stack>;
}

const SegmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, getSegment, getNextId, saveChanges, deleteItem } = useData();
  useDocumentTitle(isCreating ? 'New Segment' : `Segment ${id} | Edit`);

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
          <Button variant="outline" onClick={() => navigate(-1)}>
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
      // geometry: (value) =>
      //   value === JSON.stringify(multiLineString([]).geometry) ? 'Geometry cannot be empty' : null,
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

    navigate(-1);
  };

  const handleDelete = () => {
    deleteItem('segments', initialSegment.id);
    navigate(-1);
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
    form.insertListItem('events', trailEvent);
  };

  const breadcrumbs = [
    { title: 'Admin', href: '/admin' },
    { title: 'Segments', href: '/admin/segments' },
    {
      title: isCreating ? 'New Segment ' : `Segment ${initialSegment.id}`,
      href: isCreating ? '/admin/segments/create' : `/admin/segments/${initialSegment.id}`,
    },
  ].map((item, index) => (
    <Anchor key={index} component={Link} to={item.href}>
      {item.title}
    </Anchor>
  ));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Container size="md" py="xl">
        <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
        <Title size="lg" py="md">
          {isCreating ? 'New Segment ' : `Segment ${initialSegment.id}`}
        </Title>
        <Stack gap="lg">
          <TextInput
            label="Name"
            description="Short descriptor (e.g. x street to y road, phase 2)"
            {...form.getInputProps('name')}
          />
          <Textarea
            autosize
            minRows={3}
            label="Description"
            description="Information specific to this segment (e.g. conditions, amenities, progress)"
            {...form.getInputProps('description')}
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

          <Box>
            <Text size="sm" fw={500}>
              Geometry
            </Text>
            <Text color="dimmed" size="12px" lh="14.4px">
              Open the editor to modify geometry, If you are having trouble, just describe the
              change in the description field above
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
          <Box>
            <Text size="sm" fw={500}>
              Timeline
            </Text>
            <Text color="dimmed" size="12px" lh="14.4px">
              Create new timeline events or lookup existing ones to link them to this segment
            </Text>
            <EventsEditor form={form} />

            <Group justify="center" mt="md">
              <EventSearch form={form} />

              <Button
                variant="light"
                onClick={handleCreateNewTrailEvent}
                leftSection={<IconPlus />}
              >
                Add Event
              </Button>
            </Group>
          </Box>
          <LinksField
            {...form.getInputProps('links')}
            description="If link is more relevant to trail or timeline event, add link there instead"
          />
        </Stack>

        <Divider my="xl" />
      </Container>

      <StickyBox>
        <Container size="md">
          <Group justify="space-between">
            <ConfirmationButton
              confirmationText="Are you sure you want to delete this?"
              onConfirm={handleDelete}
              confirmButtonText="Delete"
              cancelButtonText="Cancel"
            >
              <Button color="red" variant="outline" disabled={isCreating}>
                Delete Segment
              </Button>
            </ConfirmationButton>

            <Group>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" px="xl">
                Save
              </Button>
            </Group>
          </Group>
        </Container>
      </StickyBox>
    </form>
  );
};

export default SegmentForm;
