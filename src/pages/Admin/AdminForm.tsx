import { FormEvent } from 'react';
import { Container, Button, Title, Breadcrumbs, Anchor, Stack, Flex } from '@mantine/core';
import { useDocumentTitle, useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import ConfirmationButton from '@/components/ConfirmationButton';
import { useData } from '@/components/DataProvider/DataProvider';
import { MappedChanges } from '@/types';
import { StickyBox } from './common/StickyBox';
import { capitalizeFirstLetter } from '@/utils';
import useNavigateBack from '@/hooks/useNavigateBack';

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
  const navigateBack = useNavigateBack();
  const { deleteItem } = useData();
  const isMobile = useMediaQuery('(min-width: var(--mantine-breakpoint-xs))');

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
          <Flex
            gap="sm"
            direction={{ base: 'column', xs: 'row' }}
            justify={{ base: 'center', xs: 'space-between' }}
          >
            <ConfirmationButton
              confirmationText="Are you sure you want to delete this?"
              confirmButtonText="Delete"
              cancelButtonText="Cancel"
              onConfirm={() => {
                deleteItem(objectType, itemId);
                navigateBack(`/admin/${pathParam}`);
              }}
            >
              <Button color="red" variant="outline" disabled={isCreating} fullWidth={isMobile}>
                Delete Segment
              </Button>
            </ConfirmationButton>

            <Flex direction={{ base: 'column', xs: 'row' }} gap="sm">
              <Button
                variant="outline"
                onClick={() => navigateBack(`/admin/${pathParam}`)}
                fullWidth={isMobile}
              >
                Cancel
              </Button>
              <Button type="submit" px="xl" fullWidth={isMobile}>
                Save
              </Button>
            </Flex>
          </Flex>
        </Container>
      </StickyBox>
    </form>
  );
}
