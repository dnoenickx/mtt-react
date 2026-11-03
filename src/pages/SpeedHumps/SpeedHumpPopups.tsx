import { Badge, Group, List, Stack, Text } from '@mantine/core';
import {
  categoryFor,
  HumpProps,
  HUMP_COLOR,
  ineligibilityReasons,
  RoadProps,
} from './speedHumps.config';

export function RoadPopup({ road }: { road: RoadProps }) {
  const category = categoryFor(road.PopupLong);
  const ineligible = category?.id === 'ineligible';
  const lanes =
    road.k_totlanes > 0 ? `${road.k_totlanes} lane${road.k_totlanes === 1 ? '' : 's'}` : null;

  return (
    <Stack gap={6} p="sm" maw={280}>
      <Text fw={600}>{road.STREETNAME || 'Unnamed street'}</Text>
      <Badge color={category?.color} variant="filled" style={{ alignSelf: 'flex-start' }}>
        {road.PopupLong}
      </Badge>
      {ineligible && (
        <div>
          <Text size="xs" c="dimmed">
            Why not eligible:
          </Text>
          <List size="xs" withPadding>
            {ineligibilityReasons(road).map((r) => (
              <List.Item key={r}>{r}</List.Item>
            ))}
          </List>
        </div>
      )}
      {lanes && (
        <Text size="xs" c="dimmed">
          {lanes}
        </Text>
      )}
    </Stack>
  );
}

export function HumpPopup({ hump }: { hump: HumpProps }) {
  return (
    <Stack gap={4} p="sm" maw={280}>
      <Group gap={6} wrap="nowrap">
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: HUMP_COLOR }} />
        <Text fw={600}>{hump.Name}</Text>
      </Group>
      <Text size="xs" c="dimmed">
        Speed hump (current data) · {hump.Zone.replace(/^NSS:\s*/, '')}
      </Text>
    </Stack>
  );
}
