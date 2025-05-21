import { Anchor, Table } from '@mantine/core';
import { Link } from 'react-router-dom';
import AdminTable from './AdminTable';
import ActionButtons from '../common/ActionButtons';
import LinkCell from '../common/LinkCell';
import { useData } from '@/components/DataProvider/DataProvider';
import { createSlug } from '@/utils';

export default function TrailsTable(): JSX.Element {
  const { currentData } = useData();
  const headers = ['ID', 'Name', 'Description', 'Links', 'Segments', 'Actions'];

  // Count how many segments each trail has
  const trailSegmentCounts: Record<number, number> = {};
  Object.values(currentData.segments).forEach(({ trails }) => {
    trails.forEach((trailId) => {
      trailSegmentCounts[trailId] = (trailSegmentCounts[trailId] || 0) + 1;
    });
  });

  const rows = Object.values(currentData.trails).map((item) => (
    <Table.Tr key={item.id}>
      {/* ID */}
      <Table.Td>{item.id}</Table.Td>

      {/* Name */}
      <Table.Td>
        <Anchor component={Link} to={`/map?trail=${createSlug(item.slug ?? item.name)}`}>
          {item.name}
        </Anchor>
      </Table.Td>

      {/* Description */}
      <Table.Td>{item.description}</Table.Td>

      {/* Links */}
      <Table.Td>{LinkCell(item)}</Table.Td>

      {/* Segments */}
      <Table.Td align="center">{trailSegmentCounts[item.id] || 0}</Table.Td>

      {/* Actions */}
      <Table.Td>
        <ActionButtons itemType="trails" itemId={item.id} />
      </Table.Td>
    </Table.Tr>
  ));

  return <AdminTable headers={headers} rows={rows} />;
}
