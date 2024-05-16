import { Menu, rem, UnstyledButton } from '@mantine/core';
import { IconCirclePlus, IconDotsVertical, IconEdit, IconTimelineEvent } from '@tabler/icons-react';

interface EditMenuParams {
  openSegmentCreator: () => void;
  openSegmentEditor: () => void;
  openEventEditor: () => void;
}

export default function EditMenu({
  openSegmentCreator,
  openSegmentEditor,
  openEventEditor,
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
      </Menu.Dropdown>
    </Menu>
  );
}
