import {
  Button,
  Divider,
  Group,
  JsonInput,
  Modal,
  MultiSelect,
  Select,
  SimpleGrid,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useData } from '@/data/DataContext';
import { Segment } from '@/types';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import { normalizeMultiLineString } from '@/utils';

export interface SegmentEditPopupParams {
  segment: Segment;
  opened: boolean;
  close: () => void;
}

interface FormSegment {
  id: number;
  name: string;
  description: string;
  state: string;
  trailIds: string[];
  geometry: string;
  comment: '';
}

function SegmentEditPopup({ segment, opened, close }: SegmentEditPopupParams) {
  const { trails, dispatch } = useData();

  const form = useForm<FormSegment>({
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
    validateInputOnBlur: true,
  });

  return (
    <Modal opened={opened} onClose={close} title="Edit Segment" size="xl" centered>
      <form
        onSubmit={form.onSubmit((values, event) => {
          event?.preventDefault();
          dispatch({
            action: 'upsert',
            type: 'segments',
            value: {
              ...values,
              trailIds: values.trailIds.map(Number),
              geometry: normalizeMultiLineString(values.geometry),
            } as Segment,
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
              placeholder="Search for trail"
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
              maxRows={15}
              autosize
              {...form.getInputProps('geometry')}
            />
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
