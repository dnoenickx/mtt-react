import { FormEvent } from 'react';
import { Container, Button, Title, Group, Breadcrumbs, Anchor, Stack } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmationButton from '@/components/ConfirmationButton';
import { useData } from '@/components/DataProvider/DataProvider';
import { MappedChanges } from '@/types';
import { StickyBox } from '@/components/Atomic/Atomic';
import { capitalizeFirstLetter } from '@/utils';

type AdminFormProps = {
  itemId: number;
  isCreating: boolean;
  onSubmit: (event?: FormEvent<HTMLFormElement> | undefined) => void;
  children: React.ReactNode;
  singular?: string;
  plural?: string;
  objectType: keyof MappedChanges;
  pathParam?: string;
};

export function AdminForm({
  itemId,
  isCreating,
  onSubmit,
  children,
  objectType,
  singular: providedSingular,
  plural: providedPlural,
  pathParam: providedPathParam,
}: AdminFormProps) {
  const navigate = useNavigate();
  const { deleteItem } = useData();

  const pathParam = providedPathParam ?? objectType;
  const plural = providedPlural ?? capitalizeFirstLetter(pathParam);
  const singular = providedSingular ?? (plural.endsWith('s') ? plural.slice(0, -1) : plural);

  const title = isCreating ? `New ${singular}` : `${singular} ${itemId}`;
  useDocumentTitle(`${title}${isCreating ? '' : ' | Edit'}`);

  const breadcrumbs = [
    { title: 'Admin', href: '/admin' },
    { title: plural, href: `/admin/${pathParam}` },
    {
      title,
      href: `/admin/${pathParam}/${isCreating ? 'create' : itemId}`,
    },
  ];

  return (
    <form onSubmit={onSubmit}>
      <Container size="md" py="xl">
        <Breadcrumbs>
          {breadcrumbs.map((item, index) => (
            <Anchor key={index} component={Link} to={item.href}>
              {item.title}
            </Anchor>
          ))}
        </Breadcrumbs>

        <Title size="lg" py="md">
          {title}
        </Title>

        <Stack gap="lg">{children}</Stack>
      </Container>
      <StickyBox>
        <Container size="md">
          <Group justify="space-between">
            <ConfirmationButton
              confirmationText="Are you sure you want to delete this?"
              confirmButtonText="Delete"
              cancelButtonText="Cancel"
              onConfirm={() => {
                deleteItem(objectType, itemId);
                navigate(-1);
              }}
            >
              <Button color="red" variant="outline" disabled={isCreating}>
                Delete Segment
              </Button>
            </ConfirmationButton>

            <Group>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" px="xl">
                Save
              </Button>
            </Group>
          </Group>
        </Container>
      </StickyBox>
    </form>
  );
}
