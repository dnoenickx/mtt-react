import { useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { Container, TextInput, Textarea, Button, Title, Text, Group } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { randomId } from '@mantine/hooks';
import { RawTrail } from '@/types';
import { createSlug, deepEqual } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import LinksField, { FormLink, toRawLinks } from '../common/LinksField';
import { AdminForm } from '../AdminForm';

type FormTrail = Omit<RawTrail, 'links' | 'slug'> & {
  slug: string;
  links: FormLink[];
};

const TrailForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, saveChanges, getNextId } = useData();

  // Reset scroll on page load
  useEffect(() => window.scrollTo(0, 0), [navigate]);

  const initialTrail = useMemo(() => {
    if (id === undefined) return null;

    if (isCreating) {
      return {
        id: getNextId('trails'),
        name: '',
        slug: '',
        description: '',
        links: [],
      };
    }

    return currentData.trails[Number(id)];
  }, [id, currentData]);

  if (!initialTrail) {
    return (
      <Container size="sm" py="xl" style={{ textAlign: 'center' }}>
        <Title order={3} c="red" mb="md">
          Trail Not Found
        </Title>
        <Text size="lg" mb="md">
          The trail you are looking for does not exist.
        </Text>
        <Group justify="center" grow>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  const form = useForm<FormTrail>({
    initialValues: {
      slug: '',
      ...initialTrail,
      links: initialTrail.links.map((link) => ({
        ...link,
        id: randomId(),
      })),
    },
    validate: {
      slug: (value) =>
        createSlug(value) !== value ? 'Slug can only contain dashes and lower-case letters' : null,
    },
  });

  const handleSubmit = (formTrail: FormTrail) => {
    const trail: RawTrail = {
      ...formTrail,
      links: toRawLinks(formTrail.links),
    };

    if (trail.slug === undefined) {
      delete trail.slug;
    }

    if (!deepEqual(initialTrail, trail)) {
      saveChanges({ trails: [trail] });
    }
    navigate(-1);
  };

  return (
    <AdminForm
      itemId={initialTrail.id}
      isCreating={isCreating}
      onSubmit={form.onSubmit(handleSubmit)}
      objectType="trails"
    >
      <TextInput label="Name" required {...form.getInputProps('name')} />
      <TextInput
        label="Slug"
        {...form.getInputProps('slug')}
        description={`Shorter alternative for linking to this trail in addition to name based default '${createSlug(
          initialTrail.name
        )}'`}
        placeholder="e.g. 'mcrt' for mass-central-rail-trail"
      />
      <Textarea autosize minRows={3} label="Description" {...form.getInputProps('description')} />
      <LinksField {...form.getInputProps('links')} />
    </AdminForm>
  );
};

export default TrailForm;
