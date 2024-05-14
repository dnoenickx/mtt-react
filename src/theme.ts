import { Anchor, createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Put your mantine theme override here */
  fontFamily: 'Open Sans, sans-serif',
  headings: {
    fontFamily: 'Open Sans',
    // fontFamily: 'Josefin Sans',
    fontWeight: '600',
  },
  primaryColor: 'trail-green',
  colors: {
    'trail-green': [
      '#f3f7f4',
      '#e7ebe8',
      '#cad4cd',
      '#abbeb0',
      '#90aa96',
      '#7f9e86',
      '#75987e',
      '#63846b',
      '#57765e',
      '#47664f',
    ],
    slate: [
      '#f8fafc',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b',
      '#0f172a',
      '#020617',
    ],
  },
  components: {
    Anchor: Anchor.extend({
      styles: {
        root: { color: 'var(--mantine-primary-color-9)' },
      },
    }),
  },
});
