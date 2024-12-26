import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import Map, { MapLayerMouseEvent, MapRef, NavigationControl } from 'react-map-gl';
import { Button, Drawer, ScrollArea, Tabs } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import styles from './TrailMap.module.css';
import { SegmentDetailsPanel } from '@/components/SegmentDetailsPanel/SegmentDetailsPanel';
import WelcomePanel, { LayerOption } from '@/components/WelcomePanel/WelcomePanel';
import { SegmentStates, SEGMENT_STATES } from './TrailMap.config';
import SegmentsLayer, {
  SEGMENTS_SYMBOLOGY_LAYER_ID,
  SEGMENTS_SOURCE_ID,
  SEGMENTS_HOVER_LAYER_ID,
} from '@/components/MapLayers/Segments/Segments.layer';
import { WelcomeModal } from '@/components/WelcomeModal/WelcomeModal';
import CommuterRailLayer, {
  COMMUTER_RAIL_LAYER_IDS,
} from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import Subway, { SUBWAY_LAYER_IDS } from '@/components/MapLayers/Subway/Subway.layer';

const DEFAULT_BASEMAP = 'mapbox://styles/dnoen/clp8rwblo001001p84znz9viw';

function MapAside({
  activeTab,
  setActiveTab,
  layers,
  drawerOpen,
  setDrawerOpen,
  mapRef,
}: {
  activeTab: string | null;
  setActiveTab: React.Dispatch<React.SetStateAction<string | null>>;
  layers: LayerOption[];
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mapRef: React.RefObject<MapRef>;
}) {
  const isSmallViewport = useMediaQuery('(max-width: 768px)');
  const [segmentStates, setSegmentStates] = useState<SegmentStates>(SEGMENT_STATES);
  const [baseMap, setBaseMap] = useState<string>(DEFAULT_BASEMAP);

  const handleStateToggle = (value: string) => {
    setSegmentStates((prev) => {
      const newStates = {
        ...prev,
        [value]: { ...prev[value], visible: !prev[value].visible },
      };

      const map = mapRef.current?.getMap();
      if (map) {
        if (map.getLayer(SEGMENTS_SYMBOLOGY_LAYER_ID) && map.getLayer(SEGMENTS_HOVER_LAYER_ID)) {
          const visibleStates = Object.entries(newStates)
            .filter(([, value]) => value.visible)
            .map(([key]) => key);
          map.setFilter(SEGMENTS_SYMBOLOGY_LAYER_ID, ['in', 'state', ...visibleStates]);
          map.setFilter(SEGMENTS_HOVER_LAYER_ID, ['in', 'state', ...visibleStates]);
          return newStates;
        }
      }
      return prev;
    });
  };

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      map.setStyle(baseMap);
    }
  }, [baseMap]);

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
          layers={layers}
          baseMap={baseMap}
          setBaseMap={setBaseMap}
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
  const onClickHandler = useCallback((e: MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0) return;

    const [id, layer] = [e.features[0].id, e.features[0].layer.id];

    if (layer === SEGMENTS_HOVER_LAYER_ID && id !== undefined) {
      searchParams.set('segment', `${id}`);
      setSearchParams(searchParams);
      setActiveTab('segmentDetailsPanel');
      setDrawerOpen(true);
    }
  }, []);

  const mapElement = useMemo(
    () => <TrailMap mapRef={mapRef} onClick={onClickHandler} />,
    [mapRef, onClickHandler]
  );

  return (
    <div className={styles.container}>
      <WelcomeModal />

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

function TrailMap({
  mapRef,
  onClick,
}: {
  mapRef: React.RefObject<MapRef>;
  onClick: (e: MapLayerMouseEvent) => void;
}) {
  const hoveredSegmentId = useRef<string | null>(null);

  console.log('map render');

  const onMouseMoveHandler = (e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: [SEGMENTS_HOVER_LAYER_ID],
    });

    if (features.length > 0) {
      const feature = features[0];
      const featureId = feature.id?.toString();

      if (hoveredSegmentId.current !== featureId) {
        map.getCanvas().style.cursor = 'pointer';

        // Reset the previously hovered feature
        if (hoveredSegmentId.current) {
          map.setFeatureState(
            { source: SEGMENTS_SOURCE_ID, id: hoveredSegmentId.current },
            { hover: false }
          );
        }

        // Set the new hovered feature
        if (featureId) {
          map.setFeatureState({ source: SEGMENTS_SOURCE_ID, id: featureId }, { hover: true });
          hoveredSegmentId.current = featureId;
        }
      }
    } else {
      // Reset hover state if no features are under the cursor
      map.getCanvas().style.cursor = '';
      if (hoveredSegmentId.current) {
        map.setFeatureState(
          { source: SEGMENTS_SOURCE_ID, id: hoveredSegmentId.current },
          { hover: false }
        );
        hoveredSegmentId.current = null;
      }
    }
  };

  return (
    <Map
      reuseMaps
      ref={mapRef}
      attributionControl={false}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
      mapStyle={DEFAULT_BASEMAP}
      maxZoom={17}
      minZoom={7}
      maxBounds={[
        [-74.5, 40.5],
        [-69.5, 43.5],
      ]}
      boxZoom={false}
      dragRotate={false}
      initialViewState={{
        longitude: -71.68,
        latitude: 42.35,
        zoom: 8.78,
      }}
      interactiveLayerIds={[SEGMENTS_HOVER_LAYER_ID]}
      onMouseMove={onMouseMoveHandler}
      onClick={onClick}
    >
      <NavigationControl />
      <SegmentsLayer />
      <Subway />
      <CommuterRailLayer />
    </Map>
  );
}
