import React from 'react';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from './Router';
import { resolver, theme } from './theme';
import { DataProvider } from './components/DataProvider/DataProvider';
import { ClearChangesModal, GetContactInfoModal } from './components/Modals';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} cssVariablesResolver={resolver}>
        <Notifications />
        <DataProvider>
          <ClearChangesModal />
          <GetContactInfoModal />
          <Router />
        </DataProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
