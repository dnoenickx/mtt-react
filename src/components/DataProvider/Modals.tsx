import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { handleDownload } from '@/utils';
import { Button, Group, TextInput, Modal, Text, Stack } from '@mantine/core';
import { useData } from './DataProvider';
import { useForm } from '@mantine/form';
import { differenceInMinutes } from 'date-fns';

export function ClearChangesModal() {
  const { lastUpdated, lastModified, getChangesJSON, clearChanges } = useData();

  const hasUpdated = lastModified !== undefined && lastUpdated > lastModified;

  return (
    <Modal
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      opened={hasUpdated}
      onClose={() => undefined}
      title="Map Data Update"
      overlayProps={{
        backgroundOpacity: 0.55,
      }}
    >
      <p>
        I have updated the map data since you last visited. You must clear your local edits to
        prevent conflicts.
      </p>
      <Group justify="flex-end">
        <Button variant="outline" onClick={() => handleDownload('changes', getChangesJSON())}>
          Download Your Edits
        </Button>
        <Button color="red" onClick={clearChanges}>
          Clear Edits
        </Button>
      </Group>
    </Modal>
  );
}

export function GetContactInfoModal() {
  const { changes } = useData();
  const [opened, setOpened] = useState(false);
  const [lastClosed, setLastClosed] = useLocalStorage<number | null>({
    key: 'contact-info-modal-closed',
    defaultValue: null,
  });
  const [contactInfo, setContactInfo] = useLocalStorage<{
    name: string;
    email: string;
    organization: string;
  } | null>({
    key: 'contact-info',
    defaultValue: null,
  });

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      organization: '',
    },
  });

  useEffect(() => {
    // Show the modal only if changes exist, 30 mins have passed, and no info in localStorage
    const hasChanges =
      Object.keys(changes.trails).length > 0 ||
      Object.keys(changes.segments).length > 0 ||
      Object.keys(changes.trailEvents).length > 0;
    const thirtyMinutesPassed =
      lastClosed === null || differenceInMinutes(new Date(), lastClosed) > 30;
    const infoNotSaved = contactInfo === null;

    if (hasChanges && thirtyMinutesPassed && infoNotSaved) {
      setOpened(true);
    }
  }, [changes, lastClosed, contactInfo]);

  const handleSubmit = (values: { name: string; email: string; organization: string }) => {
    // Save the form data to localStorage
    setContactInfo(values);
    setLastClosed(Date.now());
    setOpened(false);
  };

  const handleMaybeLater = () => {
    setLastClosed(Date.now());
    setOpened(false);
  };

  return (
    <Modal
      centered
      opened={opened}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      onClose={handleMaybeLater}
      title="Thanks for your suggestion!"
      overlayProps={{
        backgroundOpacity: 0.55,
        transitionProps: {
          enterDelay: 500,
        },
      }}
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack gap="xs">
          <Text c="dimmed" size="sm">
            It'd be nice to know who you are! I want to know who's a regular editor, reach out if I
            have questions, and see what organizations are making use of my website.
          </Text>
          <Text c="dimmed" size="sm">
            If you prefer to remain anonymous, that's ok too!
          </Text>
        </Stack>

        <Stack my="lg" gap="xs">
          <TextInput label="Name" placeholder="Jane Doe" {...form.getInputProps('name')} />
          <TextInput
            label="Email"
            placeholder="email@website.com"
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Organization"
            placeholder="e.g. DCR, MassDOT, Friends of the ___ trail"
            {...form.getInputProps('organization')}
          />
        </Stack>

        <Group justify="space-between" mt="xl" mb="sm">
          <Button variant="subtle" onClick={handleMaybeLater}>
            Maybe later
          </Button>
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Modal>
  );
}
