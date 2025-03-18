import { Anchor, Table } from '@mantine/core';
import { Link } from 'react-router-dom';
import AdminTable from './AdminTable';
import ActionButtons from '../common/ActionButtons';
import linkCell from '../common/linkCell';
import { useData } from '@/components/DataProvider/DataProvider';
import { createSlug } from '@/utils';

export default function TrailsTable(): JSX.Element {
  const { currentData } = useData();
  const headers = ['ID', 'Name', 'Description', 'Links', 'Segments', 'Actions'];

  const trailCounts: Record<number, number> = {};
  Object.values(currentData.segments).forEach(({ trails }) => {
    trails.forEach((trailId) => {
      trailCounts[trailId] = (trailCounts[trailId] || 0) + 1;
    });
  });

  const rows = Object.values(currentData.trails).map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.id}</Table.Td>
      <Table.Td>
        <Anchor component={Link} to={`/map?trail=${createSlug(item.slug ?? item.name)}`}>
          {item.name}
        </Anchor>
      </Table.Td>
      <Table.Td>{item.description}</Table.Td>
      <Table.Td>{linkCell(item)}</Table.Td>
      <Table.Td align="center">{trailCounts[item.id] || 0}</Table.Td>
      <Table.Td>
        <ActionButtons itemType="trails" itemId={item.id} />
      </Table.Td>
    </Table.Tr>
  ));

  return <AdminTable headers={headers} rows={rows} />;
}
