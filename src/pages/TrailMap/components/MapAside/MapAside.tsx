import React from 'react';
import { Drawer, ScrollArea, Tabs } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MapRef } from 'react-map-gl/maplibre';

import WelcomePanel from '../WelcomePanel/WelcomePanel';
import { SegmentDetailsPanel } from '../SegmentDetailsPanel/SegmentDetailsPanel';
import { SegmentStates, SEGMENT_STATES } from '../../TrailMap.config';
import { updateSegmentFilters } from '@/components/MapLayers/Segments/Segments.layer';
import styles from './MapAside.module.css';

interface MapAsideProps {
  activeTab: string | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mapRef: React.RefObject<MapRef>;
}

export function MapAside({
  activeTab,
  setActiveTab,
  drawerOpen,
  setDrawerOpen,
  mapRef,
}: MapAsideProps) {
  const isSmallViewport = useMediaQuery('(max-width: 768px)');
  const [segmentStates, setSegmentStates] = React.useState<SegmentStates>(SEGMENT_STATES);

  const handleStateToggle = (value: string) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    setSegmentStates((prev) => {
      const newStates = { ...prev, [value]: { ...prev[value], visible: !prev[value].visible } };
      const visibleStates = Object.keys(newStates).filter((key) => newStates[key].visible);
      updateSegmentFilters(map, visibleStates);
      return newStates;
    });
  };

  const tabs = (
    <Tabs
      value={activeTab}
      onChange={setActiveTab}
      radius="xs"
      classNames={{ tabLabel: styles.tabLabel, panel: styles.panel }}
    >
      <Tabs.List grow>
        <Tabs.Tab value="welcome">Map Settings</Tabs.Tab>
        <Tabs.Tab value="segmentDetailsPanel">Segment Details</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="welcome">
        <WelcomePanel
          segmentStates={segmentStates}
          toggleSegmentStateVisibility={handleStateToggle}
        />
      </Tabs.Panel>
      <Tabs.Panel value="segmentDetailsPanel">
        <SegmentDetailsPanel />
      </Tabs.Panel>
    </Tabs>
  );

  // Use Drawer for small screens
  if (isSmallViewport) {
    return (
      <Drawer
        position="bottom"
        size="md"
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        withCloseButton={false}
        radius="md"
      >
        {tabs}
      </Drawer>
    );
  }

  // Use ScrollArea for larger screens
  return (
    <ScrollArea h="100%" type="scroll" scrollbars="y" className={styles.aside}>
      {tabs}
    </ScrollArea>
  );
}
