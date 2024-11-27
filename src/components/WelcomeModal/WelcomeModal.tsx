import { Text, Button, CopyButton, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCopy } from '@tabler/icons-react';

export function WelcomeModal() {
  const [opened, { close }] = useDisclosure(sessionStorage.getItem('acceptedWelcome') !== 'true');

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} centered>
      <Text>
        <b>November 2024:</b> Now that it&apos;s dark and cold, I have plenty of time to work
        through the backlog of improvements and updates I&apos;ve been meaning to make! Keep
        reaching out with your questions, comments, or suggestions:
      </Text>
      <Group justify="center" my="md">
        <CopyButton value="mass.trail.tracker@gmail.com" timeout={2000}>
          {({ copied, copy }) => (
            <Button
              variant="outline"
              color={copied ? 'green' : 'gray'}
              onClick={copy}
              leftSection={<IconCopy />}
            >
              {copied ? 'Email copied' : 'mass.trail.tracker@gmail.com'}
            </Button>
          )}
        </CopyButton>
      </Group>
      <Text c="dimmed" size="sm">
        Disclaimer: The data herein is provided for informational purposes only. MassTrailTracker
        makes no warranties, either expressed or implied, and assumes no responsibility for its
        completeness or accuracy. Users assume all responsibility and risk associated with use of
        the map and agree to indemnify and hold harmless MassTrailTracker with respect to any and
        all claims and demands that may arise resulting from use of this map.
      </Text>
      <Group justify="center">
        <Button
          data-autofocus
          onClick={() => {
            sessionStorage.setItem('acceptedWelcome', 'true');
            close();
          }}
        >
          Get started
        </Button>
      </Group>
    </Modal>
  );
}
