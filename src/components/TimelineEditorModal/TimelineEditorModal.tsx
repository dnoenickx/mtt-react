import { format, parse, isValid } from 'date-fns';
import {
  Alert,
  Button,
  Divider,
  Fieldset,
  Group,
  Modal,
  rem,
  Slider,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconCalendar,
  IconCirclePlus,
  IconInfoCircle,
  IconLinkPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useData } from '@/data/DataContext';
import { formatDate } from '@/utils';
import { DatePrecision, Newsflash } from '@/types';

export interface TimelineEditorProps {
  newsflashes: Newsflash[];
  opened: boolean;
  close: () => void;
  segmentId: number;
}

function newNewsflash(segmentId: number): Newsflash {
  const min = 1;
  const max = 9999;
  return {
    id: Math.floor(min + Math.random() * (max - min + 1)),
    headline: '',
    date: new Date(),
    datePrecision: 'day',
    description: '',
    icon: '',
    segmentIds: [segmentId],
    links: [],
  };
}

function EventEditForm({
  newsflash,
  onDirty,
  onSubmit,
}: {
  newsflash: Newsflash;
  onDirty: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
}) {
  const { dispatch } = useData();

  function datePrecisionToInt(val: DatePrecision): number {
    switch (val) {
      case 'year':
        return 0;
      case 'month':
        return 50;
      default:
        return 100;
    }
  }

  function intToDatePrecision(val: number): DatePrecision {
    switch (val) {
      case 0:
        return 'year';
      case 50:
        return 'month';
      default:
        return 'day';
    }
  }

  const form = useForm({
    initialValues: {
      ...newsflash,
      date: format(newsflash.date, 'M/d/yyyy'),
      datePrecision: datePrecisionToInt(newsflash.datePrecision),
    },
    validateInputOnBlur: true,
    validate: {
      date: (value) =>
        isValid(parse(value, 'M/d/yyyy', new Date())) ? null : 'Date must be mm/dd/yyyy format',
    },
    transformValues: (values): Newsflash => ({
      ...values,
      date: parse(values.date, 'M/d/yyyy', new Date()),
      datePrecision: intToDatePrecision(values.datePrecision),
    }),
  });

  useEffect(() => onDirty(form.isDirty()), [form.isDirty()]);

  const links = form.values.links.map((item, index) => (
    <Fieldset style={{ width: '100%' }} mb="sm" key={index}>
      <TextInput placeholder="Label" mb={10} {...form.getInputProps(`links.${index}.label`)} />
      <TextInput
        placeholder="bostonglobe.com"
        mb={10}
        {...form.getInputProps(`links.${index}.url`)}
      />
      <Group justify="right">
        <Button
          variant="light"
          color="red"
          size="xs"
          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => form.removeListItem('links', index)}
        >
          Delete
        </Button>
      </Group>
    </Fieldset>
  ));

  return (
    <form
      onSubmit={form.onSubmit((values, event) => {
        event?.preventDefault();
        dispatch({
          action: 'upsert',
          type: 'newsflashes',
          value: values,
        });
        onSubmit();
        form.resetDirty();
      })}
    >
      <TextInput
        label="Title"
        placeholder="Event title"
        pb={15}
        {...form.getInputProps('headline')}
      />
      <Textarea
        label="Description"
        placeholder="Event Description"
        resize="vertical"
        minRows={2}
        pb={15}
        autosize
        {...form.getInputProps('description')}
      />
      <TextInput
        label="Date"
        placeholder="mm/dd/yyyy"
        leftSection={<IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
        description="Select a date and how that date should be displayed"
        mb={15}
        {...form.getInputProps('date')}
      />
      <Slider
        marks={[
          { value: 0, label: 'Year' },
          { value: 50, label: 'Month' },
          { value: 100, label: 'Day' },
        ]}
        step={50}
        label={(val) => {
          try {
            return formatDate(
              parse(form.values.date, 'M/d/yyyy', new Date()),
              intToDatePrecision(val)
            );
          } catch {
            return null;
          }
        }}
        mb={35}
        mx={30}
        {...form.getInputProps('datePrecision')}
      />
      <Divider my="lg" hiddenFrom="sm" />

      <Text size="sm">Links</Text>
      {links}

      <Group justify="center" mt="md">
        <Button
          variant="light"
          size="xs"
          onClick={() => form.insertListItem('links', { url: '', label: '' })}
          leftSection={<IconLinkPlus style={{ width: rem(14), height: rem(14) }} />}
        >
          Add link
        </Button>
      </Group>

      <Divider mt="md" size="xs" />

      <Tooltip.Floating label="No changes made" disabled={form.isDirty()}>
        <Group mt="sm" grow>
          <Button
            disabled={!form.isDirty()}
            variant="outline"
            onClick={() => {
              onSubmit();
              form.reset();
              onDirty(false);
            }}
          >
            Discard Changes
          </Button>
          <Button disabled={!form.isDirty()} type="submit">
            Save
          </Button>
        </Group>
      </Tooltip.Floating>
    </form>
  );
}

export function TimelineEditorModal({
  newsflashes,
  opened,
  close,
  segmentId,
}: TimelineEditorProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [newEvent, setNewEvent] = useState<Newsflash | undefined>(
    newsflashes.length ? undefined : newNewsflash(segmentId)
  );

  const preppedNewsflashes = [...(newEvent ? [newEvent] : []), ...newsflashes].sort((a, b) =>
    a.date > b.date ? -1 : 1
  );

  function handleTabChange(value: string | null): void {
    if (value === activeTab) {
      return;
    }

    if (formIsDirty) {
      setShowSaveWarning(true);
    } else {
      setActiveTab(value);
      setShowSaveWarning(false);
      setNewEvent(undefined);
    }
  }

  function handleClose() {
    if (formIsDirty) {
      setShowSaveWarning(true);
    } else {
      close();
      setShowSaveWarning(false);
    }
  }

  useEffect(() => {
    if (
      preppedNewsflashes.length &&
      preppedNewsflashes.every((n) => n.id.toString() !== activeTab)
    ) {
      setActiveTab(preppedNewsflashes[0].id.toString());
    }
  }, [activeTab, preppedNewsflashes]);

  return (
    <Modal opened={opened} onClose={handleClose} title="Edit Timeline" size="lg">
      {showSaveWarning && (
        <Alert
          variant="light"
          color="red"
          radius="xl"
          title="Event Modified"
          icon={<IconInfoCircle />}
          mb="sm"
          mx="md"
          py="xs"
        >
          You must save or discard your changes first.
        </Alert>
      )}
      <Tabs value={activeTab} onChange={handleTabChange} orientation="vertical">
        <Tabs.List>
          {preppedNewsflashes.map((n) => (
            <Tabs.Tab value={n.id.toString()} key={n.id.toString()}>
              {n.headline || 'New Event'}
            </Tabs.Tab>
          ))}
          <Button
            leftSection={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
            variant="light"
            mx="sm"
            mt="md"
            onClick={() => {
              if (formIsDirty) {
                setShowSaveWarning(true);
              } else {
                const createdEvent = newNewsflash(segmentId);
                setNewEvent(createdEvent);
                setActiveTab(createdEvent.id.toString());
              }
            }}
          >
            Add Event
          </Button>
        </Tabs.List>

        {preppedNewsflashes.map((n) => (
          <Tabs.Panel value={n.id.toString()} ml="md" key={n.id.toString()}>
            <EventEditForm
              newsflash={n}
              onDirty={setFormIsDirty}
              onSubmit={() => {
                setNewEvent(undefined);
                setShowSaveWarning(false);
              }}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Modal>
  );
}
