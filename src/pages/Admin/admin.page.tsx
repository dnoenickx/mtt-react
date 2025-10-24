import { useParams } from 'react-router-dom';
import { Container } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { toCapitalCase } from '@/utils';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

export default function Admin(): JSX.Element {
  const { tabValue = 'segments' } = useParams<{ tabValue?: string }>();

  useDocumentTitle(`${toCapitalCase(tabValue)} | Edit`);

  return (
    <Container py="xl" maw="100vw">
      <Container size="lg">
        <AdminHeader />
        <AdminTabs tabValue={tabValue} />
      </Container>
    </Container>
  );
}
