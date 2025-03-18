import { useState } from 'react';
import { UseFormReturnType } from '@mantine/form';
import {
  TextInput,
  OptionsFilter,
  ComboboxParsedItemGroup,
  Textarea,
  Button,
  Select,
  Text,
  ActionIcon,
  Fieldset,
  Stack,
  Modal,
  Flex,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { DatePrecision, RawSegment, RawTrailEvent } from '@/types';
import { useData } from '@/components/DataProvider/DataProvider';
import LinksField, { FormLink } from '../common/LinksField';

export type FormTrailEvent = Omit<RawTrailEvent, 'date_precision' | 'links'> & {
  date_precision: DatePrecision | null;
  links: FormLink[];
};

type EventItem = {
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

export function EventSearch<T>({
  form,
  trailIds,
  eventIds,
}: {
  form: UseFormReturnType<T>;
  trailIds: number[];
  eventIds: number[];
}) {
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

  const matchCount = (a: RawSegment) => a.trails.filter((id) => trailIds.includes(id)).length;

  // Sort segments by number of trails they share.
  // Get top 5 where matchCount > 0, sorted in descending order.
  const segs = Object.values(currentData.segments)
    .filter((a) => matchCount(a) > 0)
    .sort((a, b) => matchCount(b) - matchCount(a))
    .slice(0, 5);

  // Flatten events from the top segments, excluding those already in eventIds
  const allEvents = segs.flatMap(({ events }) => events).filter((val) => !eventIds.includes(val));

  // Count occurrences of each event
  const eventCounts = allEvents.reduce(
    (acc, event) => {
      acc[event] = (acc[event] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  // Sort events by occurrence count in descending order and take the top 5
  const prevalentEvents = Object.entries(eventCounts)
    .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
    .slice(0, 5)
    .map(([event]) => event); // Extract event IDs

  const suggestionEvents = prevalentEvents
    .map((eventId) => currentData.trailEvents[Number(eventId)])
    .filter((event) => event !== undefined); // Filter out any undefined events

  if (suggestionEvents.length > 0) {
    // Add suggestions group to eventData
    eventData.unshift({
      group: 'Suggestions',
      items: suggestionEvents.map((event) => ({
        value: `0${event.id.toString()}`,
        label: event.headline,
        description: event.description,
        date: event.date,
      })),
    });
  }

  return (
    <>
      <Button variant="light" leftSection={<IconSearch />} onClick={() => setOpened(true)}>
        Search Events
      </Button>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Select an Event" yOffset="2vh">
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
          maxDropdownHeight={500}
          nothingFoundMessage="Nothing found..."
          searchable
          data-autofocus
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

export function EventFormFields({
  form,
  index = '',
}: {
  form: UseFormReturnType<any>;
  index?: string;
}) {
  return (
    <Stack gap="xs">
      {/* Headline and Date Group */}
      <Flex gap="xs" direction={{ base: 'column', md: 'row' }}>
        <TextInput
          label="Headline"
          placeholder="Event title"
          {...form.getInputProps(`${index}headline`)}
          w={{ base: '100%', md: '55%' }}
        />

        {/* Date & Precision should wrap together when needed */}
        <Flex gap="xs" w={{ base: '100%', md: '45%' }} direction={{ base: 'column', xs: 'row' }}>
          <TextInput
            label="Date"
            placeholder="YYYY-MM-DD"
            {...form.getInputProps(`${index}date`)}
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
            {...form.getInputProps(`${index}date_precision`)}
            w={{ base: '100%', xs: '50%' }}
          />
        </Flex>
      </Flex>

      {/* Description & Links */}
      <Textarea
        label="Description"
        placeholder="Event description"
        {...form.getInputProps(`${index}description`)}
        minRows={3}
        autosize
      />
      <LinksField {...form.getInputProps(`${index}links`)} />
    </Stack>
  );
}

export function TimelineEditor<T extends EventItem>({ form }: { form: UseFormReturnType<T> }) {
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

      <EventFormFields form={form} index={`events.${index}.`} />
    </Fieldset>
  ));

  return <Stack px={{ base: 0, sm: 'md' }}>{events}</Stack>;
}
