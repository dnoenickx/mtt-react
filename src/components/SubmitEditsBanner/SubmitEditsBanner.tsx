import { Button, Alert, Group, Text, Transition, rem } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconEraser, IconFileDiff, IconPencilShare, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import ConfirmationButton from '../ConfirmationButton';
import { useData } from '../DataProvider/DataProvider';

function SubmitEditsBanner() {
  const { isSubmitted, setIsSubmitted, clearChanges, getMinimalChangesJSON } = useData();

  const mutation = useMutation({
    mutationFn: () => {
      const [data, editId] = getMinimalChangesJSON();
      const url = `${import.meta.env.VITE_API_ENDPOINT}/edits/${editId}`;
      return fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: () => {
      showNotification({
        withBorder: true,
        withCloseButton: false,
        title: 'Failed to Submit',
        message: 'Try again later',
        position: 'top-center',
        icon: <IconX style={{ width: rem(20), height: rem(20) }} />,
        m: 'lg',
        color: 'red',
      });
    },
  });

  return (
    <Transition
      mounted={!isSubmitted}
      transition="slide-down"
      duration={300}
      exitDelay={2200}
      timingFunction="ease"
    >
      {(styles) => (
        <Alert
          variant="filled"
          radius={0}
          py="xs"
          px={{ base: 'sm', md: 'lg', lg: 'xl' }}
          top={{ base: 45, sm: 60 }}
          style={{
            ...styles,
            position: 'sticky',
            zIndex: 99,
          }}
        >
          <Group justify="space-between">
            <Group gap="sm">
              <IconFileDiff />
              <Text fw={700}>Unsaved Edits</Text>
              <Text c="white" size="sm">
                Your edits are saved in your browser. Be sure to submit them before leaving.
              </Text>
            </Group>
            <Group gap="lg">
              <ConfirmationButton
                confirmationText="All edits will be cleared from your browser. Submitted changes will still be available for me to review, but any unsubmitted changes will be permanently lost."
                onConfirm={() => {
                  clearChanges();
                  showNotification({
                    withBorder: true,
                    withCloseButton: false,
                    title: 'Edits Cleared',
                    message: 'Now viewing current published data',
                    position: 'top-center',
                    icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                    m: 'lg',
                  });
                }}
                confirmButtonText="Clear"
                cancelButtonText="Cancel"
                modalProps={{
                  title: 'Clear edits?',
                }}
              >
                <Button
                  size="xs"
                  variant="outline"
                  color="white"
                  leftSection={<IconEraser style={{ width: rem(20), height: rem(20) }} />}
                >
                  Clear All Edits
                </Button>
              </ConfirmationButton>
              <Button
                size="xs"
                variant="white"
                leftSection={
                  isSubmitted ? (
                    <IconCheck style={{ width: rem(20), height: rem(20) }} />
                  ) : (
                    <IconPencilShare style={{ width: rem(20), height: rem(20) }} />
                  )
                }
                onClick={() => mutation.mutate()}
                loading={mutation.isPending}
                disabled={mutation.isPending}
              >
                {isSubmitted ? 'Submitted!' : 'Submit Edits'}
              </Button>
            </Group>
          </Group>
        </Alert>
      )}
    </Transition>
  );
}

export default SubmitEditsBanner;
