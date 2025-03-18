import { Link as RouterLink } from 'react-router-dom';
import { Group, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ConfirmationButton from '@/components/ConfirmationButton';
import { useData } from '@/components/DataProvider/DataProvider';
import { MappedChanges } from '@/types';

interface ActionButtonsProps {
  itemType: keyof MappedChanges;
  itemId: number;
  pathOverride?: string;
}

export default function ActionButtons({
  itemType,
  itemId,
  pathOverride,
}: ActionButtonsProps): JSX.Element {
  const { deleteItem } = useData();
  return (
    <Group wrap="nowrap">
      <ActionIcon
        aria-label="Edit"
        component={RouterLink}
        to={`/admin/${pathOverride ?? itemType}/${itemId}`}
      >
        <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
      </ActionIcon>
      <ConfirmationButton
        confirmationText="Are you sure you want to delete this?"
        onConfirm={() => deleteItem(itemType, itemId)}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      >
        <ActionIcon color="red" variant="outline" aria-label="Delete">
          <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </ConfirmationButton>
    </Group>
  );
}
