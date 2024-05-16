import { Menu, rem, UnstyledButton } from '@mantine/core';
import {
  IconCirclePlus,
  IconDotsVertical,
  IconEdit,
  IconRefresh,
  IconTimelineEvent,
  IconTrash,
} from '@tabler/icons-react';

interface EditMenuParams {
  openSegmentCreator: () => void;
  openSegmentEditor: () => void;
  openEventEditor: () => void;
  onDeleteSegment: () => void;
  onDeleteChanges: () => void;
}

export default function EditMenu({
  openSegmentCreator,
  openSegmentEditor,
  openEventEditor,
  onDeleteSegment,
  onDeleteChanges,
}: EditMenuParams) {
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <IconDotsVertical color="gray" size={18} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Segment</Menu.Label>
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
          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
          color="red"
          onClick={onDeleteSegment}
        >
          Delete Segment
        </Menu.Item>

        <Menu.Divider />
        <Menu.Label>Timeline</Menu.Label>
        <Menu.Item
          leftSection={<IconTimelineEvent style={{ width: rem(14), height: rem(14) }} />}
          onClick={openEventEditor}
        >
          Edit Timeline
        </Menu.Item>

        <Menu.Divider />
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          leftSection={<IconRefresh style={{ width: rem(14), height: rem(14) }} />}
          color="red"
          onClick={onDeleteChanges}
        >
          Clear My Changes
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
