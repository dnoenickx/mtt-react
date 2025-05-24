import React from 'react';
import { Drawer, ScrollArea, Tabs } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MapRef } from 'react-map-gl/maplibre';
import WelcomePanel from '../WelcomePanel/WelcomePanel';
import { SegmentDetailsPanel } from '../SegmentDetailsPanel/SegmentDetailsPanel';
import { SegmentStates, SEGMENT_STATES } from '../../TrailMap.config';
import {
  SEGMENTS_SYMBOLOGY_LAYER_IDS,
  SEGMENTS_HOVER_LAYER_ID,
} from '@/components/MapLayers/Segments/Segments.layer';
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
    setSegmentStates((prev) => {
      const newStates = {
        ...prev,
        [value]: { ...prev[value], visible: !prev[value].visible },
      };

      const map = mapRef.current?.getMap();
      if (map) {
        if (
          SEGMENTS_SYMBOLOGY_LAYER_IDS.every((layerId) => map.getLayer(layerId)) &&
          map.getLayer(SEGMENTS_HOVER_LAYER_ID)
        ) {
          const visibleStates = Object.entries(newStates)
            .filter(([, state]) => state.visible)
            .map(([key]) => key);

          const stateFilter = ['match', ['get', 'state'], visibleStates, true, false];

          SEGMENTS_SYMBOLOGY_LAYER_IDS.forEach((layerId) => {
            if (layerId === 'segments_symbology_dashed') {
              // @ts-ignore
              map.setFilter(layerId, ['all', ['has', 'dashedWidth'], stateFilter]);
            } else if (layerId.startsWith('segments_symbology_highlight')) {
              // @ts-ignore
              map.setFilter(layerId, ['all', ['==', ['get', 'highlight'], true], stateFilter]);
            } else {
              // @ts-ignore
              map.setFilter(layerId, stateFilter);
            }
          });
          // @ts-ignore
          map.setFilter(SEGMENTS_HOVER_LAYER_ID, stateFilter);
          return newStates;
        }
      }
      return prev;
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
