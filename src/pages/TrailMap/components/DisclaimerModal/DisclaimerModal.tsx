import { Text, Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { EmailButton } from '../../../../components/Atomic/Atomic';

export function DisclaimerModal() {
  const [opened, { close }] = useDisclosure(sessionStorage.getItem('acceptedWelcome') !== 'true');

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} centered>
      <Text>Reaching out with your questions, comments, or suggestions:</Text>
      <Group justify="center" my="md">
        <EmailButton />
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
