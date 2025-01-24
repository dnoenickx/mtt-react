import { useMemo } from 'react';
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
import { showNotification } from '@mantine/notifications';
import { randomId } from '@mantine/hooks';
import { RawTrail } from '@/types';
import { deepEqual } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import LinksField, { FormLink } from './LinksField';

type FormTrail = Omit<RawTrail, 'links'> & {
  links: FormLink[];
};

const TrailForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'create';
  const { currentData, saveChanges, getNextId } = useData();

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
      links: formTrail.links.map((link) => ({
        text: link.text,
        url: link.url,
      })),
    };

    if (!deepEqual(initialTrail, trail)) {
      saveChanges({ trails: [trail] });
      showNotification({
        withBorder: true,
        withCloseButton: false,
        title: 'Changes Submitted',
        message: 'We will review your changes shortly!',
        position: 'top-center',
      });
    } else {
      console.log('no changes');
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
        <TextInput label="Name" {...form.getInputProps('name')} />
        <TextInput label="Slug" {...form.getInputProps('slug')} />
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
