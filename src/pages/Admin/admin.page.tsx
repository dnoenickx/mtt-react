import { useParams } from 'react-router-dom';
import { Container } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { toCapitalCase } from '@/utils';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

export default function Admin(): JSX.Element {
  const { tabValue = 'segments' } = useParams<{ tabValue?: string }>();

  useDocumentTitle(`${toCapitalCase(tabValue)} | Edit`);

  const showDownloadButton = Boolean(Number(import.meta.env.VITE_DEV));

  return (
    <Container size="lg" py="xl">
      <AdminHeader showDownloadButton={showDownloadButton} />

      <AdminTabs tabValue={tabValue} />
    </Container>
  );
}
