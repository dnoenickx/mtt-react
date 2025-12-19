import React from 'react';
import { Stack, Group, Text, Anchor } from '@mantine/core';

interface DistrictPopupProps {
  name: string;
  district: string;
  url: string;
}

export function DistrictPopup({ name, district, url }: DistrictPopupProps) {
  return (
    <Stack gap={0} align="center" m="sm">
      <Text size="md" fw={400}>
        {name}
      </Text>
      <Text size="sm" c="dimmed">
        {district}
      </Text>
      <Anchor href={url} target="_blank" rel="noopener noreferrer" variant="subtle" size="xs">
        View page
      </Anchor>
    </Stack>
  );
}

