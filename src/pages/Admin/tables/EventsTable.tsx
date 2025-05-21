import { Link } from 'react-router-dom';
import { Anchor, List, Table, Text } from '@mantine/core';
import { formatDateWithPrecision } from '@/utils';
import AdminTable from './AdminTable';
import ActionButtons from '../common/ActionButtons';
import { useData } from '@/components/DataProvider/DataProvider';

export default function EventsTable(): JSX.Element {
  const { currentData } = useData();

  const headers = ['ID', 'Headline', 'Date', 'Trails', 'Segments', 'Links', 'Actions'];

  // Count of segments per event
  const segmentCountPerEvent: Record<number, number> = {};
  // TrailIds per event
  const eventToTrailsMap: Record<number, Set<number>> = {};

  Object.values(currentData.segments).forEach(({ trails, events }) => {
    events.forEach((eventId) => {
      // Increment event's segment count
      segmentCountPerEvent[eventId] = (segmentCountPerEvent[eventId] || 0) + 1;

      // Add trails to event's set
      if (!eventToTrailsMap[eventId]) {
        eventToTrailsMap[eventId] = new Set();
      }
      trails.forEach((trailId) => eventToTrailsMap[eventId].add(trailId));
    });
  });

  // Generates row's "Trails" column -- a bulleted list of trails
  const renderTrailsList = (eventId: number) => {
    const trailIds = Array.from(eventToTrailsMap[eventId] || []);
    return (
      <List size="xs">
        {trailIds.map((trailId) => {
          if (!(trailId in currentData.trails)) return null;
          const { id, name } = currentData.trails[trailId];
          return (
            <List.Item key={id}>
              <Anchor component={Link} to={`/admin/trails/${id}`} size="xs">
                {name}
              </Anchor>
            </List.Item>
          );
        })}
      </List>
    );
  };

  const rows = Object.values(currentData.trailEvents).map((item) => (
    <Table.Tr key={item.id}>
      {/* ID */}
      <Table.Td>{item.id}</Table.Td>

      {/* Headline */}
      <Table.Td>{item.headline}</Table.Td>

      {/* Date */}
      <Table.Td>
        <Text size="sm" style={{ textWrap: 'nowrap' }}>
          {formatDateWithPrecision(item.date, item.date_precision)}
        </Text>
      </Table.Td>

      {/* Trails */}
      <Table.Td>{renderTrailsList(item.id)}</Table.Td>

      {/* Segments */}
      <Table.Td align="center">{segmentCountPerEvent[item.id] || 0}</Table.Td>

      {/* Links */}
      <Table.Td align="center">{item.links.length}</Table.Td>

      {/* Actions */}
      <Table.Td>
        <ActionButtons itemType="trailEvents" itemId={item.id} pathOverride="events" />
      </Table.Td>
    </Table.Tr>
  ));

  return <AdminTable headers={headers} rows={rows} />;
}
