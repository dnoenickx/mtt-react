import { Segment } from '@/types';
import { formatDate } from '@/utils';
import {
  TextInput,
  Text,
  Checkbox,
  Button,
  Group,
  Box,
  Textarea,
  MultiSelect,
  SegmentedControl,
  rem,
  Radio,
  Container,
  Flex,
  Fieldset,
  Slider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm, UseFormReturnType } from '@mantine/form';
import { IconCalendar } from '@tabler/icons-react';

import classes from './SegmentEditPanel.module.css';

function EventEditor({ form }: { form: UseFormReturnType<Segment> }) {
  const fields = form.values.events.map((item, index) => (
    <Fieldset legend="Event" style={{ width: '100%' }}>
      <TextInput
        label="Title"
        placeholder="Title"
        mb={10}
        {...form.getInputProps(`events.${index}.title`)}
      />
      <DatePickerInput
        label="Date"
        placeholder="Pick date"
        valueFormat="YYYY-MM-DD"
        leftSection={<IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
        description="Select a date and how that date should be displayed"
        value={item.date}
        mb={15}
      />
      <Slider
        marks={[
          { value: 0, label: 'Year' },
          { value: 50, label: 'Month' },
          { value: 100, label: 'Day' },
        ]}
        step={50}
        label={(val) => formatDate(item.date, val == 0 ? 'year' : val == 50 ? 'month' : 'day')}
        mb={35}
      />
      <Textarea
        resize="vertical"
        label="Description"
        placeholder="Event description"
        autosize
        {...form.getInputProps(`events.${index}.description`)}
      />
    </Fieldset>
  ));

  return (
    <>
      <Flex gap="sm" justify="flex-start" align="center" direction="column" wrap="wrap">
        {fields}
      </Flex>
      <Group justify="center" mt="md">
        <Button
          variant="light"
          onClick={() =>
            form.insertListItem('events', {
              title: '',
              date: new Date(),
              datePrecision: 'day',
              description: '',
              icon: '',
              links: [],
            })
          }
        >
          Add event
        </Button>
      </Group>
    </>
  );
}

function SegmentEditPanel({ initialData }: { initialData: Segment }) {
  const form = useForm<Segment>({ initialValues: initialData });

  return (
    <>
      <TextInput
        label="Segment Name"
        description="Short geographic description (e.g. x trail from a to b street)"
        placeholder="Name"
        pb={15}
        {...form.getInputProps(`name`)}
      />
      <Textarea
        resize="vertical"
        label="Segment Description"
        description="Segment specific information (e.g. access, amenities, condition)"
        placeholder="Segment Description"
        autosize
        pb={15}
        {...form.getInputProps(`description`)}
      />
      <MultiSelect
        checkIconPosition="left"
        data={['Northern Strand', 'Charles River', 'Minuteman', 'Muddy River']}
        label="Trails"
        placeholder="Pick a trail"
        defaultValue={['Mass Central Rail Trail']}
        pb={25}
        limit={10}
        searchable
        value={form.values.trails.map((t) => t.name)}
        // TODO: onChange
      />
      <EventEditor form={form} />
      <Group justify="center" mt="xl" grow>
        <Button
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          onClick={() => console.log(form.values)}
        >
          Submit Changes
        </Button>
      </Group>
    </>
  );
}

export default SegmentEditPanel;

// https://mantine.dev/form/use-form/#useformreturntype
// https://mantine.dev/form/nested/#nested-arrays

// TIMELINE
//    https://mantine.dev/dates/date-picker-input/
