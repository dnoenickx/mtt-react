import { useState, useRef } from 'react';
import { Button } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { MapRef } from 'react-map-gl/maplibre';
import styles from './TrailMapPage.module.css';
import { DisclaimerModal } from './components/DisclaimerModal/DisclaimerModal';
import { MapAside } from './components/MapAside';
import { TrailMapComponent } from './components/TrailMapComponent';
import { LayerManagerProvider } from './context/LayerManagerContext';
import { useEmbedded } from '@/hooks/useEmbedded';

export function TrailMapPage() {
  const [searchParams] = useSearchParams();
  const isEmbedded = useEmbedded();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const initialTab = searchParams.get('segment') ? 'segmentDetailsPanel' : 'welcome';
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  return (
    <LayerManagerProvider mapRef={mapRef}>
      <div className={isEmbedded ? styles.embedded : styles.container}>
        {!isEmbedded && <DisclaimerModal />}

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
    </LayerManagerProvider>
  );
}
