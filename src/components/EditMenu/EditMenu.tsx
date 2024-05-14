import { Menu, rem, UnstyledButton } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTimelineEvent } from '@tabler/icons-react';

interface EditMenuParams {
  openSegmentEditor: () => void;
  openEventEditor: () => void;
}

export default function EditMenu({ openSegmentEditor, openEventEditor }: EditMenuParams) {
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <IconDotsVertical color="gray" size={18} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
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
