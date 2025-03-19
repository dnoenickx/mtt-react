import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { randomId } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { Button, Text, Container, Title, Group } from '@mantine/core';
import { DatePrecision, RawTrailEvent } from '@/types';
import { useData } from '@/components/DataProvider/DataProvider';
import { toRawLinks } from '../common/LinksField';
import { deepEqual, formatDateString } from '@/utils';
import { AdminForm } from '../AdminForm';
import { EventFormFields, FormTrailEvent } from './EventEditorHelpers';
import useNavigateBack from '@/hooks/useNavigateBack';

export const TrailEventForm = () => {
  const navigate = useNavigate();
  const navigateBack = useNavigateBack();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, saveChanges, getNextId } = useData();

  // Reset scroll on page load
  useEffect(() => window.scrollTo(0, 0), [navigate]);

  const initialEvent = useMemo(() => {
    if (id === undefined) return null;

    if (isCreating) {
      return {
        id: getNextId('trailEvents'),
        headline: '',
        date: '',
        date_precision: null,
        description: '',
        links: [],
      };
    }

    const event = currentData.trailEvents[Number(id)];

    return {
      ...event,
      links: event.links.map((link) => ({
        ...link,
        id: randomId(),
      })),
      date: formatDateString(event.date),
    };
  }, [id, currentData]);

  if (!initialEvent) {
    return (
      <Container size="sm" py="xl" style={{ textAlign: 'center' }}>
        <Title order={3} c="red" mb="md">
          Event Not Found
        </Title>
        <Text size="lg" mb="md">
          The event you are looking for does not exist.
        </Text>
        <Group justify="center" grow>
          <Button variant="outline" onClick={() => navigateBack('/admin/events')}>
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  const form = useForm<FormTrailEvent>({
    initialValues: {
      ...initialEvent,
      links: initialEvent.links.map((link) => ({
        ...link,
        id: randomId(),
      })),
    },
  });

  const handleSubmit = (formEvent: FormTrailEvent) => {
    const event: RawTrailEvent = {
      ...formEvent,
      date_precision: formEvent.date_precision as DatePrecision,
      links: toRawLinks(formEvent.links),
    };

    if (!deepEqual(initialEvent, event)) {
      saveChanges({ trailEvents: [event] });
    }
    navigateBack('/admin/events');
  };

  return (
    <AdminForm
      itemId={initialEvent.id}
      isCreating={isCreating}
      onSubmit={form.onSubmit(handleSubmit)}
      objectType="trailEvents"
      pathParam="events"
    >
      <EventFormFields form={form} />
    </AdminForm>
  );
};
