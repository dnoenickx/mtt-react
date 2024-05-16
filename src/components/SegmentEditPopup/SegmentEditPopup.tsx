import {
  Button,
  Divider,
  Fieldset,
  Group,
  JsonInput,
  Modal,
  MultiSelect,
  rem,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLinkPlus, IconTrash } from '@tabler/icons-react';
import { useData } from '@/data/DataContext';
import { Optional, Segment, SegmentState } from '@/types';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import { normalizeMultiLineString } from '@/utils';

export interface SegmentEditPopupParams {
  segment: Segment;
  opened: boolean;
  close: () => void;
}

interface SubmitSegment extends Optional<Segment, 'id'> {
  comment: string;
}

function SegmentEditPopup({ segment, opened, close }: SegmentEditPopupParams) {
  const { trails, dispatch } = useData();

  const form = useForm({
    initialValues: {
      ...segment,
      geometry: JSON.stringify(segment.geometry),
      trailIds: trails.filter((t) => segment.trailIds.includes(t.id)).map((t) => t.id.toString()),
      comment: '',
    },
    validate: {
      geometry: (value) => {
        try {
          normalizeMultiLineString(value);
        } catch {
          return 'Invalid GeoJSON: must be LineString or MultiLineString.';
        }
        return null;
      },
    },
    transformValues: (values): SubmitSegment => {
      const updatedValues: SubmitSegment = {
        ...values,
        trailIds: values.trailIds.map(Number),
        geometry: normalizeMultiLineString(values.geometry),
        state: values.state as SegmentState,
      };

      if (updatedValues.id === -1) {
        delete updatedValues.id;
      }

      return updatedValues;
    },
    validateInputOnBlur: true,
  });

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
    <Modal opened={opened} onClose={close} title="Edit Segment" size="xl" centered>
      <form
        onSubmit={form.onSubmit((value, event) => {
          event?.preventDefault();
          dispatch({
            action: 'upsert',
            type: 'segments',
            value,
          });
          close();
        })}
      >
        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          spacing={{ base: 10, sm: 'xl' }}
          verticalSpacing={{ base: 'md', sm: 'xl' }}
        >
          <div>
            <TextInput
              label="Name"
              description="Short geographic description (e.g. x trail from a to b street)"
              placeholder="Segment Name"
              pb={15}
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              description="Segment specific information (e.g. access, amenities, condition)"
              placeholder="Segment Description"
              resize="vertical"
              minRows={2}
              pb={15}
              autosize
              {...form.getInputProps('description')}
            />
            <MultiSelect
              label="Trails"
              placeholder="Type to search..."
              data={trails.map((t) => ({ label: t.name, value: t.id.toString() }))}
              checkIconPosition="left"
              pb={25}
              limit={15}
              searchable
              {...form.getInputProps('trailIds')}
            />
            <Select
              label="Status"
              placeholder="Pick value"
              data={Object.entries(SEGMENT_STATES).map(([k, v]) => ({ label: v.label, value: k }))}
              required
              {...form.getInputProps('state')}
            />
          </div>
          <div>
            <JsonInput
              label="Geometry"
              description={
                <>
                  You can try editing the coordinates using{' '}
                  <a href="https://geojson.io/" target="_blank" rel="noopener noreferrer">
                    GeoJSON.io
                  </a>
                  , or just describe the changes in the comment field below
                </>
              }
              validationError="Invalid JSON"
              maxRows={10}
              autosize
              {...form.getInputProps('geometry')}
            />
            <Text size="sm" mt="md">
              Links
            </Text>
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
          </div>
        </SimpleGrid>
        <Divider my="lg" />
        <Textarea
          resize="vertical"
          label="Comments"
          description="Any notes for me when updating the map"
          placeholder="Anything else?"
          minRows={2}
          autosize
          pb={15}
          {...form.getInputProps('comments')}
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Modal>
  );
}

export default SegmentEditPopup;
