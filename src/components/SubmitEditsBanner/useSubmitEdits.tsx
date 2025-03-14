import { rem } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';

import { useData } from '../DataProvider/DataProvider';

export function useSubmitEdits() {
  const { setIsSubmitted, getMinimalChangesJSON } = useData();

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

  return mutation;
}
