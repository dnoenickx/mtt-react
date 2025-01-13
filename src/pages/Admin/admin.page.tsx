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
  Menu,
  Switch,
  Badge,
} from '@mantine/core';
import {
  IconBarrierBlock,
  IconEdit,
  IconEraser,
  IconEye,
  IconTrash,
  IconPencilOff,
  IconCheck,
  IconMenu2,
  IconPencilUp,
  IconPencilDown,
  IconMapDown,
  IconCirclePlus,
  IconX,
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { Link } from '@/types';
import { formatDate, sortById } from '@/utils';
import { useData } from '@/components/DataProvider/DataProvider';
import ConfirmationButton from '@/components/ConfirmationButton';
// import { useClipboard } from '@mantine/hooks';
import { EmailButton } from '@/components/Atomic/Atomic';
import { SEGMENT_STATES } from '../TrailMap/TrailMap.config';

const linkCell = (item: Record<string, any>): JSX.Element | string => (
  <List size="sm">
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

function DataOptionsMenu() {
  const navigate = useNavigate();
  const { currentData, clearChanges, changes, importChanges, editingEnabled, lastModified } =
    useData();
  // const changesClipboard = useClipboard({ timeout: 500 });
  // const dataClipboard = useClipboard({ timeout: 500 });

  const getCurrentJSON = (): string =>
    JSON.stringify({
      segments: sortById(currentData.segments),
      trailEvents: sortById(currentData.trailEvents),
      trails: sortById(currentData.trails),
    });

  const getChangesJSON = (): string =>
    JSON.stringify({
      segments: sortById(changes.segments),
      trailEvents: sortById(changes.trailEvents),
      trails: sortById(changes.trails),
      lastModified: (lastModified ?? new Date()).toISOString(),
    });

  const handleDownload = (fileName: string, data: string): void => {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}_${new Date()
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '')}.json`;
      link.click();
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleUploadChanges = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target?.files?.[0] ?? null;

      if (file) {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            if (importChanges(reader.result as string)) {
              showNotification({
                withBorder: true,
                withCloseButton: false,
                title: 'Upload Successful',
                message: 'Loaded changes from file',
                position: 'bottom-left',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                m: 'lg',
              });
            } else {
              showNotification({
                withBorder: true,
                withCloseButton: false,
                title: 'Failed to Upload',
                message: 'Something was wrong with that file',
                position: 'bottom-left',
                icon: <IconX style={{ width: rem(20), height: rem(20) }} />,
                color: 'red',
                m: 'lg',
              });
            }
          } catch (error) {
            console.error('Failed to parse uploaded changes:', error);
          }
        };

        reader.readAsText(file);
      }
    });

    input.click();
  };

  // const handlePasteChanges = () => {
  //   navigator.clipboard.readText().then((text) => {
  //     try {
  //       const data = JSON.parse(text);
  //       setChanges(mapFromRawData(data));

  //       showNotification({
  //         withBorder: true,
  //         withCloseButton: false,
  //         title: 'Upload Successful',
  //         message: `Loaded changes from clipboard`,
  //         position: 'bottom-left',
  //         icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
  //         m: 'lg',
  //       });
  //     } catch (error) {
  //       console.error('Failed to parse pasted changes:', error);
  //     }
  //   });
  // };

  return (
    <Menu trigger="click-hover" shadow="md" keepMounted>
      <Menu.Target>
        <Button variant="light" leftSection={<IconMenu2 size={18} />}>
          Admin Actions
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          disabled={!editingEnabled}
          leftSection={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => navigate('/admin/segments/create')}
        >
          Add Segment
        </Menu.Item>
        <Menu.Item
          disabled={!editingEnabled}
          leftSection={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => navigate('/admin/trails/create')}
        >
          Add Trail
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          disabled={!editingEnabled || lastModified === undefined}
          leftSection={<IconPencilDown style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => handleDownload('changes', getChangesJSON())}
        >
          Download Changes
        </Menu.Item>

        <Menu.Item
          disabled={!editingEnabled}
          leftSection={<IconPencilUp style={{ width: rem(14), height: rem(14) }} />}
          onClick={handleUploadChanges}
        >
          Upload Changes
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconMapDown style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => handleDownload('updated_data', getCurrentJSON())}
        >
          Download All Data
        </Menu.Item>

        {/* <Menu.Divider />
        <Menu.Item
          leftSection={<IconCopy style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => dataClipboard.copy(getCurrentJSON())}
        >
          {dataClipboard.copied ? 'Copied Data' : 'Copy Data'}
        </Menu.Item>
        <Menu.Item
          disabled={!editingEnabled}
          leftSection={<IconCopy style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => changesClipboard.copy(getChangesJSON())}
        >
          {changesClipboard.copied ? 'Copied Changes' : 'Copy Changes'}
        </Menu.Item>
        <Menu.Item
          disabled={!editingEnabled}
          leftSection={<IconClipboardText style={{ width: rem(14), height: rem(14) }} />}
          onClick={handlePasteChanges}
        >
          Paste Changes
        </Menu.Item> */}

        <Menu.Divider />

        {/* Danger Zone */}
        <ConfirmationButton
          confirmationText="Are you sure you want to clear changes?"
          onConfirm={() => {
            clearChanges();
            showNotification({
              withBorder: true,
              withCloseButton: false,
              title: 'Changes Cleared',
              message: 'You are now viewing the current publicly available data.',
              position: 'bottom-left',
              icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
              m: 'lg',
            });
          }}
          confirmButtonText="Clear"
          cancelButtonText="Cancel"
        >
          <Menu.Item
            disabled={!editingEnabled}
            leftSection={<IconEraser style={{ width: rem(14), height: rem(14) }} />}
            color="red"
          >
            Clear Changes
          </Menu.Item>
        </ConfirmationButton>
      </Menu.Dropdown>
    </Menu>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { tabValue } = useParams<{ tabValue?: string }>();
  const { currentData, deleteItem, editingEnabled, setEditingEnabled } = useData();

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
          <Text size="sm" lineClamp={4} w="300px">
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
        render: (item) => <Badge color={SEGMENT_STATES[item.state].color}>{item.state}</Badge>,
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
      // { key: 'slug', label: 'Slug' },
      { key: 'description', label: 'Description' },
      {
        key: 'links',
        label: 'Links',
        render: linkCell,
      },
    ],
    trailEvents: [
      { key: 'id', label: 'ID' },
      { key: 'headline', label: 'Headline' },
      {
        key: 'date',
        label: 'Date',
        render: (item) => formatDate(new Date(item.date), item.date_precision),
      },
      {
        key: 'links',
        label: 'Links',
        render: linkCell,
      },
    ],
  };

  const handleRowDelete = (type: keyof typeof currentData, id: number) => {
    deleteItem(type, id);

    showNotification({
      withBorder: true,
      withCloseButton: false,
      title: 'Delete Submitted',
      message: 'We will review your suggested changes soon!',
      position: 'bottom-left',
      icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
      m: 'lg',
    });
  };

  return (
    <>
      <Alert
        variant="filled"
        color="red"
        title="Under Construction"
        icon={<IconBarrierBlock />}
        mb="lg"
        px="xl"
      >
        The admin features are still under development. Your changes will only be saved in your
        browser and may be lost.
      </Alert>
      <Container size="lg" py="xl">
        <Group justify="space-between">
          <Switch
            checked={editingEnabled}
            onChange={(event) => setEditingEnabled(event.currentTarget.checked)}
            label="Enable Editing + View Changes"
            onLabel={<IconEye style={{ width: rem(14), height: rem(14) }} />}
            offLabel={<IconPencilOff style={{ width: rem(14), height: rem(14) }} />}
          />
          <DataOptionsMenu />
        </Group>

        <Alert variant="outline" title="Welcome" my="xl">
          <ul>
            <li>This page allows you to suggest changes to the map data!</li>
            <li>
              You&apos;ll be able to see your edits throughout the site, but they won&apos;t be
              visible to anyone else until I approve them.
            </li>
          </ul>
          <ul>
            <li>A trail is a collection of segments. Segments can belong to multiple trails.</li>
            <li>
              Both trails and segments can have names, descriptions, and links attached to them.
            </li>
            <li>
              Segments have timeliens comprised of events. Events can be shared across segments.
            </li>
          </ul>
          <Group>
            <span>Reach out if you have any questions:</span>
            <EmailButton />
          </Group>
        </Alert>

        <Tabs variant="outline" value={tabValue} onChange={(value) => navigate(`/admin/${value}`)}>
          <Tabs.List>
            <Tabs.Tab value="segments">Segments</Tabs.Tab>
            <Tabs.Tab value="trails">Trails</Tabs.Tab>
            {/* <Tabs.Tab value="trailEvents">Events</Tabs.Tab> */}
          </Tabs.List>

          {(['segments', 'trails'] as (keyof typeof currentData)[]).map((type) => (
            <Tabs.Panel key={type} value={type}>
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
                        onClick={() => navigate(`/admin/${type}/${item.id}`)}
                      >
                        {editingEnabled ? (
                          <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        ) : (
                          <IconEye style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        )}
                      </ActionIcon>
                      <ConfirmationButton
                        confirmationText="Are you sure you want to delete this?"
                        onConfirm={() => handleRowDelete(type, item.id)}
                        confirmButtonText="Delete"
                        cancelButtonText="Cancel"
                      >
                        <ActionIcon
                          color="red"
                          variant="outline"
                          aria-label="Delete"
                          disabled={!editingEnabled}
                        >
                          <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                      </ConfirmationButton>
                    </Group>,
                  ]),
                }}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Container>
    </>
  );
}
