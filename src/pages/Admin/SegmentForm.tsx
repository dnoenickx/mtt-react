import { useMemo } from 'react';
import { useForm } from '@mantine/form';
import {
  Container,
  TextInput,
  ComboboxItem,
  OptionsFilter,
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
  Popover,
  JsonInput,
  Breadcrumbs,
  Anchor,
  Stack,
} from '@mantine/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { randomId } from '@mantine/hooks';
import { IconTrash, IconPlus, IconSearch, IconArrowRight } from '@tabler/icons-react';
import { multiLineString } from '@turf/turf';
import { format } from 'date-fns';
import { RawSegment, RawTrailEvent } from '@/types';
import { SEGMENT_STATES } from '../TrailMap/TrailMap.config';
import { deepEqual, formatDateString } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import LinksField, { FormLink } from './LinksField';
import { cleanToMultiLineString, toGeoJsonIO, validateMultiLineString } from '@/geospatialUtils';
import ConfirmationButton from '@/components/ConfirmationButton';

interface EventComboboxItem extends ComboboxItem {
  headline: string;
  description: string;
  date: string;
}

type FormSegment = Omit<RawSegment, 'trails' | 'geometry' | 'links' | 'events'> & {
  trails: string[];
  geometry: string;
  links: FormLink[];
  events: RawTrailEvent[];
};

const createOptionsFilter =
  <T extends ComboboxItem>(fields: (keyof T)[]): OptionsFilter =>
  ({ options, search }) => {
    const searchLower = search.toLowerCase().trim();
    return (options as T[]).filter((option) =>
      fields.some((field) => option[field]?.toString().toLowerCase().includes(searchLower))
    );
  };

const SegmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, getSegment, getNextId, saveChanges, deleteItem, editingEnabled } = useData();

  const initialSegment: FormSegment | null = useMemo(() => {
    if (id === undefined) return null;

    if (isCreating) {
      return {
        id: getNextId('segments'),
        name: '',
        description: '',
        state: 'paved',
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
      events: {
        date: (value) =>
          Number.isNaN(new Date(value).getTime())
            ? 'Invalid date format. Must be yyyy-mm-dd format.'
            : null,
      },
    },
  });

  const handleSubmit = (formSegment: FormSegment) => {
    if (!deepEqual(initialSegment, formSegment)) {
      const rawSegment: RawSegment = {
        ...formSegment,
        trails: formSegment.trails.map((trailId) => Number(trailId)),
        events: formSegment.events.map(({ id: eventId }) => eventId),
        links: formSegment.links.map((link) => ({
          text: link.text,
          url: link.url,
        })),
        geometry: cleanToMultiLineString(JSON.parse(formSegment.geometry)),
      };

      const rawEvents: RawTrailEvent[] = formSegment.events.map((event) => ({
        ...event,
        date: formatDateString(event.date),
        links: event.links.map((link) => ({
          text: link.text,
          url: link.url,
        })),
      }));

      saveChanges({ segments: [rawSegment], trailEvents: rawEvents });

      showNotification({
        withBorder: true,
        withCloseButton: false,
        title: 'Changes Submitted',
        message: 'We will review your suggested changes soon!',
        position: 'top-center',
      });
    }

    navigate(-1);
  };

  const handleDelete = () => {
    deleteItem('segments', initialSegment.id);

    showNotification({
      withBorder: true,
      withCloseButton: false,
      title: 'Delete Submitted',
      message: 'We will review your suggested changes soon!',
      position: 'top-center',
    });

    navigate(-1);
  };

  const handleCreateNewTrailEvent = () => {
    const trailEvent: RawTrailEvent = {
      id: getNextId(
        'trailEvents',
        form.values.events.map((event) => event.id)
      ),
      headline: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      date_precision: 'd',
      description: '',
      links: [],
    };
    form.insertListItem('events', trailEvent);
  };

  const eventsFields = form.values.events.map((event, index) => (
    <Fieldset
      legend={event.headline}
      key={event.id || randomId()}
      variant="filled"
      p={{ base: 'xs', sm: 'md' }}
    >
      <Group align="flex-end">
        <TextInput
          label="Headline"
          placeholder="Event title"
          {...form.getInputProps(`events.${index}.headline`)}
          style={{ flexGrow: 1 }}
        />
        <TextInput
          label="Date"
          placeholder="YYYY-MM-DD"
          {...form.getInputProps(`events.${index}.date`)}
        />
        <Select
          label="Date Precision"
          data={[
            { value: 'd', label: 'Day' },
            { value: 'm', label: 'Month' },
            { value: 'y', label: 'Year' },
          ]}
          {...form.getInputProps(`events.${index}.date_precision`)}
        />
        <ActionIcon
          title="Delete Event"
          variant="light"
          color="red"
          onClick={() => form.removeListItem('events', index)}
          mb="xs"
        >
          <IconTrash size="1rem" />
        </ActionIcon>
      </Group>
      <Textarea
        label="Description"
        placeholder="Event description"
        {...form.getInputProps(`events.${index}.description`)}
        minRows={3}
        autosize
        mt="sm"
      />
      <LinksField {...form.getInputProps(`events.${index}.links`)} mt="lg" />
    </Fieldset>
  ));

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
    <Container size="md" py="xl">
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title size="lg" py="md">
        {isCreating ? 'New Segment ' : `Segment ${initialSegment.id}`}
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
          <JsonInput
            label={
              <>
                Geometry
                <Button
                  size="compact-sm"
                  variant="transparent"
                  disabled={validateMultiLineString(form.values.geometry) !== null}
                  onClick={() => {
                    const url = toGeoJsonIO(
                      cleanToMultiLineString(JSON.parse(form.values.geometry))
                    );
                    window.open(url, '_blank');
                  }}
                  rightSection={
                    <IconArrowRight style={{ width: '70%', height: '70%' }} stroke={2} />
                  }
                  styles={{ section: { margin: 0 } }}
                >
                  edit in geojson.io
                </Button>
              </>
            }
            placeholder="Enter MultiLineString GeoJSON"
            description="Use the geojson.io link to edit the geometry, then paste the result here"
            minRows={4}
            maxRows={6}
            required
            autosize
            validationError="Invalid geometry: must be a JSON object"
            {...form.getInputProps('geometry')}
            onBlur={(event) => {
              const error = validateMultiLineString(event.target.value);
              if (error === null) {
                form.setFieldValue(
                  'geometry',
                  JSON.stringify(cleanToMultiLineString(JSON.parse(event.target.value)))
                );
              } else {
                form.setFieldError('geometry', error);
              }
            }}
          />
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
            <Stack px={{ base: 0, sm: 'md' }}>{eventsFields}</Stack>

            <Group justify="center" mt="md">
              <Popover width={300} withArrow trapFocus shadow="md">
                <Popover.Target>
                  <Button variant="light" leftSection={<IconSearch />}>
                    Search Events
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Select
                    label="Search Existing Events"
                    placeholder="Search and select an event"
                    data={Object.values(currentData.trailEvents).map((event) => ({
                      value: event.id.toString(),
                      label: event.headline,
                      description: event.description,
                      date: event.date,
                    }))}
                    onChange={(value) => {
                      if (value === null) return;
                      const selectedEvent = currentData.trailEvents[Number(value)];
                      if (selectedEvent) {
                        const trailEvent: RawTrailEvent = {
                          id: selectedEvent.id,
                          headline: selectedEvent.headline,
                          date: selectedEvent.date,
                          date_precision: 'd',
                          description: selectedEvent.description,
                          links: [],
                        };
                        form.insertListItem('events', trailEvent);
                      }
                    }}
                    filter={createOptionsFilter<EventComboboxItem>([
                      'label',
                      'description',
                      'date',
                    ])}
                    nothingFoundMessage="Nothing found..."
                    comboboxProps={{ withinPortal: false }}
                    searchable
                    clearable
                  />
                </Popover.Dropdown>
              </Popover>

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
            description="If link is  more relevant to trail or timeline event, add link there instead"
          />
        </Stack>

        <Divider my="xl" />

        <Group justify="space-between" mb="xl">
          <ConfirmationButton
            confirmationText="Are you sure you want to delete this?"
            onConfirm={handleDelete}
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
          >
            <Button color="red" variant="outline" disabled={!editingEnabled || isCreating}>
              Delete Segment
            </Button>
          </ConfirmationButton>

          <Group>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!editingEnabled} px="xl">
              Save
            </Button>
          </Group>
        </Group>
      </form>
    </Container>
  );
};

export default SegmentForm;
