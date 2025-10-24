import { IconCopy } from '@tabler/icons-react';
import { Button, CopyButton } from '@mantine/core';

export const EmailButton = () => (
  <CopyButton value="mass.trail.tracker@gmail.com" timeout={2000}>
    {({ copied, copy }) => (
      <Button
        variant="outline"
        color={copied ? 'green' : 'gray'}
        onClick={copy}
        leftSection={<IconCopy style={{ width: '75%', height: '75%' }} />}
        size="xs"
      >
        {copied ? 'Email copied' : 'mass.trail.tracker@gmail.com'}
      </Button>
    )}
  </CopyButton>
);
