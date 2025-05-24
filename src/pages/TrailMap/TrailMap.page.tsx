import React, { useState, useCallback } from 'react';
import { Button } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import styles from './TrailMapPage.module.css';
import { DisclaimerModal } from './components/DisclaimerModal/DisclaimerModal';
import { MapAside } from './components/MapAside';
import { TrailMapComponent } from './components/TrailMapComponent';
import { MapProvider } from './context/MapContext';
import { useRef } from 'react';
import { MapRef } from 'react-map-gl/maplibre';
import { useSegmentsLayer } from '@/components/MapLayers/Segments/Segments.layer';
import { useCommuterRailLayer } from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import { useSubwayLayer } from '@/components/MapLayers/Subway/Subway.layer';

export function TrailMapPage() {
  const mapRef = useRef<MapRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get('segment') ? 'segmentDetailsPanel' : 'welcome'
  );

  const handleSegmentClick = useCallback(
    (id: string | number) => {
      searchParams.set('segment', `${id}`);
      setSearchParams(searchParams);
      setActiveTab('segmentDetailsPanel');
      setDrawerOpen(true);
    },
    [searchParams, setSearchParams]
  );

  const layers = [
    {
      id: 'segments',
      label: 'Trail Segments',
      visible: true,
      canToggle: false,
      hook: useSegmentsLayer,
      params: {
        onClick: handleSegmentClick,
      },
    },
    {
      id: 'commuterRail',
      label: 'Commuter Rail',
      visible: false,
      canToggle: true,
      hook: useCommuterRailLayer,
    },
    {
      id: 'subway',
      label: 'Subway',
      visible: false,
      canToggle: true,
      hook: useSubwayLayer,
    },
  ];

  return (
    <MapProvider initialLayers={layers} mapRef={mapRef}>
      <div className={styles.container}>
        <DisclaimerModal />

        <MapAside
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          mapRef={mapRef}
        />

        <div className={styles.body}>
          <Button
            classNames={{
              root: styles.buttonRoot,
              label: styles.buttonLabel,
            }}
            onClick={() => setDrawerOpen((prev) => !prev)}
            hiddenFrom="sm"
          >
            Open Map Settings
          </Button>

          <TrailMapComponent />
        </div>
      </div>
    </MapProvider>
  );
}
