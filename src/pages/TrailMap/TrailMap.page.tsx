import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Button } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import styles from './TrailMapPage.module.css';
import { DisclaimerModal } from './components/DisclaimerModal/DisclaimerModal';
import { SUBWAY_LAYER_IDS } from '@/components/MapLayers/Subway/Subway.layer';
import { COMMUTER_RAIL_LAYER_IDS } from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import { SEGMENTS_HOVER_LAYER_ID } from '@/components/MapLayers/Segments/Segments.layer';
import { MapAside } from './components/MapAside';
import { TrailMapComponent } from './components/TrailMapComponent';

export function TrailMapPage() {
  const mapRef = useRef<MapRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get('segment') ? 'segmentDetailsPanel' : 'welcome'
  );

  // Layers
  const [layersVisibility, setLayersVisibility] = useState({
    commuterRail: false,
    subway: false,
  });

  const toggleLayerVisibility = (layer: keyof typeof layersVisibility) => {
    setLayersVisibility((prev) => {
      const map = mapRef.current?.getMap();
      if (map) {
        const visibility = prev[layer] ? 'none' : 'visible';

        let layerIds: string[] = [];
        switch (layer) {
          case 'subway':
            layerIds = SUBWAY_LAYER_IDS;
            break;
          case 'commuterRail':
            layerIds = COMMUTER_RAIL_LAYER_IDS;
            break;
          default:
            return prev;
        }

        layerIds.forEach((layerId) => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
          }
        });

        return {
          ...prev,
          [layer]: !prev[layer],
        };
      }

      return prev;
    });
  };

  const layers = useMemo(
    () => ({
      commuterRail: {
        label: 'Commuter Rail',
        visible: layersVisibility.commuterRail,
        toggle: () => toggleLayerVisibility('commuterRail'),
      },
      subway: {
        label: 'Subway',
        visible: layersVisibility.subway,
        toggle: () => toggleLayerVisibility('subway'),
      },
    }),
    [layersVisibility]
  );

  // On Segment Click
  const onClickHandler = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;

      const [id, layer] = [e.features[0].id, e.features[0].layer.id];

      if (layer === SEGMENTS_HOVER_LAYER_ID && id !== undefined) {
        searchParams.set('segment', `${id}`);
        setSearchParams(searchParams);
        setActiveTab('segmentDetailsPanel');
        setDrawerOpen(true);
      }
    },
    [searchParams, setSearchParams]
  );

  const mapElement = useMemo(
    () => <TrailMapComponent mapRef={mapRef} onClick={onClickHandler} />,
    [mapRef, onClickHandler]
  );

  return (
    <div className={styles.container}>
      <DisclaimerModal />

      <MapAside
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        layers={Object.values(layers)}
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

        {mapElement}
      </div>
    </div>
  );
}
