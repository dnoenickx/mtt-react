import { Table, ScrollArea } from '@mantine/core';
import { ReactNode } from 'react';

interface AdminTableProps {
  headers: string[];
  rows: ReactNode[];
}

export default function AdminTable({ headers, rows }: AdminTableProps): JSX.Element {
  return (
    <ScrollArea>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {headers.map((header, index) => (
              <Table.Th key={index}>{header}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
