import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Tabs,
  Table,
  Text,
  Anchor,
  List,
  ActionIcon,
  Group,
  rem,
  Button,
  Alert,
  Badge,
  ScrollArea,
  Box,
  Spoiler,
} from '@mantine/core';
import {
  IconEdit,
  IconEraser,
  IconTrash,
  IconCheck,
  IconMapDown,
  IconCirclePlus,
  IconBrandYoutubeFilled,
} from '@tabler/icons-react';
import { useDocumentTitle, useSessionStorage } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Link } from '@/types';
import { handleDownload, toCapitalCase } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import ConfirmationButton from '@/components/ConfirmationButton';
import { EmailButton } from '@/components/Atomic/Atomic';
import { SEGMENT_STATES } from '../TrailMap/TrailMap.config';

const linkCell = (item: Record<string, any>): JSX.Element | string => (
  <List size="xs">
    {item.links.map(
      (link: Link) =>
        link && (
          <List.Item key={link.url}>
            <Anchor href={link.url} target="_blank" rel="noopener noreferrer" size="xs">
              {link.text}
            </Anchor>
          </List.Item>
        )
    )}
  </List>
);

export default function Admin() {
  const navigate = useNavigate();
  const { tabValue } = useParams<{ tabValue?: string }>();
  const { currentData, deleteItem, clearChanges, getCurrentJSON } = useData();

  const [spoilerOpen, setSpoilerOpen] = useSessionStorage({
    key: 'admin-spoiler',
    defaultValue: true,
    getInitialValueInEffect: false,
  });

  const downloadButton = Boolean(Number(import.meta.env.VITE_DEV));

  useDocumentTitle(`${toCapitalCase(tabValue)} | Edit`);

  const TABLE_FIELDS: Record<
    string,
    { key: string; label: string; render?: (item: Record<string, any>) => JSX.Element | string }[]
  > = {
    segments: [
      { key: 'id', label: 'ID' },
      {
        key: 'name',
        label: 'Name',
        render: (item) => (
          <Text size="sm" lineClamp={4} w="150px">
            {item.name}
          </Text>
        ),
      },
      {
        key: 'description',
        label: 'Description',
        render: (item) => (
          <Text size="xs" lineClamp={4} w="300px">
            {item.description}
          </Text>
        ),
      },
      {
        key: 'trails',
        label: 'Trails',
        render: (item) => (
          <List size="xs">
            {item.trails.map((trailId: number) => {
              if (!(trailId in currentData.trails)) return null;
              const { id, name } = currentData.trails[trailId];
              return (
                <List.Item key={id}>
                  <Anchor component={RouterLink} to={`/admin/trails/${id}`} size="xs">
                    {name}
                  </Anchor>
                </List.Item>
              );
            })}
          </List>
        ),
      },
      {
        key: 'state',
        label: 'State',
        render: (item) => (
          <Badge
            color={SEGMENT_STATES[item.state].color}
            styles={{
              label: {
                overflow: 'visible',
              },
            }}
          >
            {item.state}
          </Badge>
        ),
      },
      {
        key: 'links',
        label: 'Links',
        render: linkCell,
      },
    ],
    trails: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      {
        key: 'links',
        label: 'Links',
        render: linkCell,
      },
    ],
    // trailEvents: [
    //   { key: 'id', label: 'ID' },
    //   { key: 'headline', label: 'Headline' },
    //   {
    //     key: 'date',
    //     label: 'Date',
    //     render: (item) => formatDate(item.date, item.date_precision),
    //   },
    //   {
    //     key: 'links',
    //     label: 'Links',
    //     render: linkCell,
    //   },
    // ],
  };

  return (
    <>
      <Container size="lg" py="xl">
        <Alert variant="outline" title="Welcome" mb="xl">
          <Spoiler
            expanded={spoilerOpen}
            onExpandedChange={setSpoilerOpen}
            maxHeight={0}
            showLabel="Show more"
            hideLabel="show less"
            styles={{ control: { fontSize: '14px' } }}
          >
            <ul>
              <li>This page allows you to suggest edits to the map data!</li>
              <li>
                You&apos;ll be able to see your edits throughout the site, but they won&apos;t be
                visible to anyone else until I approve them.
              </li>
            </ul>
            How the data is organized:
            <ul>
              <li>A trail is a collection of segments. Segments can belong to multiple trails.</li>
              <li>
                Both trails and segments can have names, descriptions, and links attached to them.
              </li>
              <li>
                Segments have timelines comprised of events. Events can be shared across segments.
              </li>
            </ul>
            Examples of segments with detailed information:
            <ul>
              <li>
                <Anchor size="sm" component={RouterLink} to="/map?segment=130" target="_blank">
                  Sudbury-Hudson MCRT Extension
                </Anchor>
              </li>
              <li>
                <Anchor size="sm" component={RouterLink} to="/map?segment=52" target="_blank">
                  Mystic River Bridge
                </Anchor>
              </li>
              <li>
                <Anchor size="sm" component={RouterLink} to="/map?segment=172" target="_blank">
                  Northern Strand Lynn Extension
                </Anchor>
              </li>
              <li>
                <Anchor size="sm" component={RouterLink} to="/map?segment=4" target="_blank">
                  Swampscott Rail Trail
                </Anchor>
              </li>
              <li>
                <Anchor size="sm" component={RouterLink} to="/map?segment=331" target="_blank">
                  New Hampshire Seacost Greenway
                </Anchor>
              </li>
            </ul>
            <Group>
              <span>Reach out if you have any questions:</span>
              <EmailButton />
            </Group>
            <Group mt="lg">
              <span>Watch this video for more information</span>
              <Button
                leftSection={<IconBrandYoutubeFilled />}
                component={RouterLink}
                to="https://youtu.be/uIw3X7h3BeM"
                color="red"
                variant="light"
              >
                Suggest edits to Mass Trail Tracker
              </Button>
            </Group>
          </Spoiler>
        </Alert>

        <Group justify="flex-end">
          {downloadButton && (
            <Button
              leftSection={<IconMapDown style={{ width: rem(14), height: rem(14) }} />}
              onClick={() => handleDownload('updated_data.json', getCurrentJSON())}
              variant="outline"
              size="xs"
            >
              Download All Data
            </Button>
          )}
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
              leftSection={<IconEraser style={{ width: rem(14), height: rem(14) }} />}
              color="red"
              variant="outline"
              size="xs"
            >
              Clear Edits
            </Button>
          </ConfirmationButton>
        </Group>

        <Tabs variant="outline" value={tabValue} onChange={(value) => navigate(`/admin/${value}`)}>
          <Tabs.List>
            <Tabs.Tab value="segments" component={Box}>
              <Group>
                Segments
                {tabValue === 'segments' && (
                  <Button
                    variant="light"
                    onClick={(event: any) => {
                      event.stopPropagation();
                      navigate('/admin/segments/create');
                    }}
                    size="compact-xs"
                    leftSection={<IconCirclePlus size="1rem" />}
                    m={0}
                  >
                    Create segment
                  </Button>
                )}
              </Group>
            </Tabs.Tab>
            <Tabs.Tab value="trails" component={Box}>
              <Group>
                Trails
                {tabValue === 'trails' && (
                  <Button
                    variant="light"
                    onClick={(event: any) => {
                      event.stopPropagation();
                      navigate('/admin/trails/create');
                    }}
                    size="compact-xs"
                    leftSection={<IconCirclePlus size="1rem" />}
                    m={0}
                  >
                    Create trail
                  </Button>
                )}
              </Group>
            </Tabs.Tab>
          </Tabs.List>

          {(['segments', 'trails'] as (keyof typeof currentData)[]).map((type) => (
            <Tabs.Panel key={type} value={type}>
              <ScrollArea>
                <Table
                  highlightOnHover
                  data={{
                    head: [...TABLE_FIELDS[type].map((field) => field.label), 'Actions'],
                    body: Object.values(currentData[type]).map((item: Record<string, any>) => [
                      ...TABLE_FIELDS[type].map((field) =>
                        field.render ? field.render(item) : item[field.key]
                      ),
                      <Group wrap="nowrap">
                        <ActionIcon
                          aria-label="Edit"
                          component={RouterLink}
                          to={`/admin/${type}/${item.id}`}
                        >
                          <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                        <ConfirmationButton
                          confirmationText="Are you sure you want to delete this?"
                          onConfirm={() => deleteItem(type, item.id)}
                          confirmButtonText="Delete"
                          cancelButtonText="Cancel"
                        >
                          <ActionIcon color="red" variant="outline" aria-label="Delete">
                            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                          </ActionIcon>
                        </ConfirmationButton>
                      </Group>,
                    ]),
                  }}
                />
              </ScrollArea>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Container>
    </>
  );
}
