import { useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import {
  Container,
  TextInput,
  Textarea,
  Button,
  Title,
  Text,
  Group,
  Divider,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { randomId, useDocumentTitle } from '@mantine/hooks';
import { RawTrail } from '@/types';
import { createSlug, deepEqual } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import LinksField, { FormLink, toRawLinks } from './LinksField';

type FormTrail = Omit<RawTrail, 'links' | 'slug'> & {
  slug: string;
  links: FormLink[];
};

const TrailForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, saveChanges, getNextId } = useData();
  useDocumentTitle(isCreating ? 'New Trail' : `Trail ${id} | Edit`);

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

  const breadcrumbs = [
    { title: 'Admin', href: '/admin' },
    { title: 'Trails', href: '/admin/trails' },
    {
      title: isCreating ? 'New Trail ' : `Trail ${initialTrail.id}`,
      href: isCreating ? '/admin/trails/create' : `/admin/trails/${initialTrail.id}`,
    },
  ].map((item, index) => (
    <Anchor key={index} component={Link} to={item.href}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="md" py="xl">
      <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
      <Title size="lg" my="md">
        {isCreating ? 'New Trail ' : `Trail ${initialTrail.id}`}
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
        <Divider my="xl" />
        <LinksField {...form.getInputProps('links')} />
        <Divider my="xl" />
        <Group justify="flex-end" mb="xl">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Container>
  );
};

export default TrailForm;
