import { Menu, rem, UnstyledButton } from '@mantine/core';
import {
  IconCirclePlus,
  IconDotsVertical,
  IconEdit,
  IconTimelineEvent,
  IconTrash,
} from '@tabler/icons-react';

interface EditMenuParams {
  openSegmentCreator: () => void;
  openSegmentEditor: () => void;
  openEventEditor: () => void;
  onDeleteSegment: () => void;
}

export default function EditMenu({
  openSegmentCreator,
  openSegmentEditor,
  openEventEditor,
  onDeleteSegment,
}: EditMenuParams) {
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <IconDotsVertical color="gray" size={18} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
          onClick={openSegmentCreator}
        >
          Create Segment
        </Menu.Item>
        <Menu.Item
          leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
          onClick={openSegmentEditor}
        >
          Edit Segment
        </Menu.Item>
        <Menu.Item
          leftSection={<IconTimelineEvent style={{ width: rem(14), height: rem(14) }} />}
          onClick={openEventEditor}
        >
          Edit Timeline
        </Menu.Item>
        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
          color="red"
          onClick={onDeleteSegment}
        >
          Delete Segment
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
