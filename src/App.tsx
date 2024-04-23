import React from 'react';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import { DataProvider } from './data/DataContext';

export default function App() {
  return (
    <DataProvider>
      <MantineProvider theme={theme}>
        <Router />
      </MantineProvider>
    </DataProvider>
  );
}
