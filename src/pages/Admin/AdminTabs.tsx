import { useNavigate } from 'react-router-dom';
import { Tabs, Box, Group, Button } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons-react';
import SegmentsTable from './tables/SegmentsTable';
import TrailsTable from './tables/TrailsTable';
import EventsTable from './tables/EventsTable';

interface TabButtonConfig {
  label: string;
  createPath: string;
}

export default function AdminTabs({ tabValue }: { tabValue: string }): JSX.Element {
  const navigate = useNavigate();

  const tabButtons: Record<string, TabButtonConfig> = {
    segments: {
      label: 'Segments',
      createPath: '/admin/segments/create',
    },
    trails: {
      label: 'Trails',
      createPath: '/admin/trails/create',
    },
    events: {
      label: 'Events',
      createPath: '/admin/events/create',
    },
  };

  const renderTabLabel = (key: string) => (
    <Group>
      {tabButtons[key].label}
      {tabValue === key && (
        <Button
          variant="light"
          onClick={(event: any) => {
            event.stopPropagation();
            navigate(tabButtons[key].createPath);
          }}
          size="compact-xs"
          leftSection={<IconCirclePlus size="1rem" />}
          m={0}
        >
          Create {key === 'events' ? 'event' : key.slice(0, -1)}
        </Button>
      )}
    </Group>
  );

  return (
    <Tabs variant="outline" value={tabValue} onChange={(value) => navigate(`/admin/${value}`)}>
      <Tabs.List>
        {Object.keys(tabButtons).map((key) => (
          <Tabs.Tab key={key} value={key} component={Box}>
            {renderTabLabel(key)}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="segments">
        <SegmentsTable />
      </Tabs.Panel>

      <Tabs.Panel value="trails">
        <TrailsTable />
      </Tabs.Panel>

      <Tabs.Panel value="events">
        <EventsTable />
      </Tabs.Panel>
    </Tabs>
  );
}
