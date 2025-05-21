import { Table } from '@mantine/core';
import { ReactNode } from 'react';

interface AdminTableProps {
  headers: string[];
  rows: ReactNode[];
}

// A shared component used by all admin tables
export default function AdminTable({ headers, rows }: AdminTableProps): JSX.Element {
  return (
    <Table highlightOnHover striped>
      <Table.Thead>
        <Table.Tr>
          {headers.map((header, index) => (
            <Table.Th key={index}>{header}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
