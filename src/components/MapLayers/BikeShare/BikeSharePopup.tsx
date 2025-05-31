import React from 'react';
import { Stack, Group, Text } from '@mantine/core';
import { formatDistanceStrict } from 'date-fns';

interface BikeSharePopupProps {
  name: string;
  numBikesAvailable: number;
  numEBikesAvailable: number;
  numDocksAvailable: number;
  updatedAt: Date;
}

export function BikeSharePopup({
  name,
  numBikesAvailable,
  numEBikesAvailable,
  numDocksAvailable,
  updatedAt,
}: BikeSharePopupProps) {
  return (
    <Stack gap="xs" align="center" m="sm">
      <Text fw={500}>{name}</Text>
      <Group gap="lg" grow>
        <Stack gap={0} align="center">
          <Text size="lg" fw={700}>
            {numBikesAvailable}
          </Text>
          <Text size="xs" c="dimmed">
            Bikes
          </Text>
        </Stack>
        <Stack gap={0} align="center">
          <Text size="lg" fw={700}>
            {numEBikesAvailable}
          </Text>
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            E-Bikes
          </Text>
        </Stack>
        <Stack gap={0} align="center">
          <Text size="lg" fw={700}>
            {numDocksAvailable}
          </Text>
          <Text size="xs" c="dimmed">
            Docks
          </Text>
        </Stack>
      </Group>
      <Text size="xs" c="dimmed">
        Updated {formatDistanceStrict(updatedAt, new Date(), { addSuffix: true })}
      </Text>
    </Stack>
  );
}
