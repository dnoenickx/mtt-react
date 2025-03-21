import { Link as RouterLink } from 'react-router-dom';
import { Text, List, Anchor, Badge, Table } from '@mantine/core';
import { useData } from '@/components/DataProvider/DataProvider';
import AdminTable from './AdminTable';
import ActionButtons from '../common/ActionButtons';
import { SEGMENT_STATES } from '@/pages/TrailMap/TrailMap.config';
import linkCell from '../common/linkCell';

export default function SegmentsTable(): JSX.Element {
  const { currentData } = useData();

  const headers = ['ID', 'Name', 'Description', 'Trails', 'Status', 'Links', 'Actions'];

  const renderTrailsList = (trails: number[]) => (
    <List size="xs">
      {trails.map((trailId) => {
        if (!(trailId in currentData.trails)) return null;
        const { id, name } = currentData.trails[trailId];
        return (
          <List.Item key={id}>
            <Anchor component={RouterLink} to={`/admin/trails/${id}`} size="xs">
              {name}
            </Anchor>
          </List.Item>
        );
      })}
    </List>
  );

  const rows = Object.values(currentData.segments).map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.id}</Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={4} w="150px">
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" lineClamp={4} w="300px">
          {item.description}
        </Text>
      </Table.Td>
      <Table.Td>{renderTrailsList(item.trails)}</Table.Td>
      <Table.Td>
        <Badge
          color={SEGMENT_STATES[item.state].color}
          styles={{
            label: { overflow: 'visible' },
          }}
        >
          {item.state}
        </Badge>
      </Table.Td>
      <Table.Td>{linkCell(item)}</Table.Td>
      <Table.Td>
        <ActionButtons itemType="segments" itemId={item.id} />
      </Table.Td>
    </Table.Tr>
  ));

  return <AdminTable headers={headers} rows={rows} />;
}
