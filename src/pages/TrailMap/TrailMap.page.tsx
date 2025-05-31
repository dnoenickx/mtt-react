import { useState, useRef } from 'react';
import { Button } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { MapRef } from 'react-map-gl/maplibre';
import styles from './TrailMapPage.module.css';
import { DisclaimerModal } from './components/DisclaimerModal/DisclaimerModal';
import { MapAside } from './components/MapAside';
import { TrailMapComponent } from './components/TrailMapComponent';
import { LayerVisibilityProvider } from './context/LayerVisibilityContext';

export function TrailMapPage() {
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const initialTab = searchParams.get('segment') ? 'segmentDetailsPanel' : 'welcome';
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  return (
    <LayerVisibilityProvider mapRef={mapRef}>
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

          <TrailMapComponent
            mapRef={mapRef}
            navigateToTab={(tab: string) => {
              setActiveTab(tab);
              setDrawerOpen(true);
            }}
          />
        </div>
      </div>
    </LayerVisibilityProvider>
  );
}
