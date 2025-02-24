import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import * as turf from '@turf/turf';
import Map, {
  GeolocateControl,
  LngLatBoundsLike,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/maplibre';
import { Button, Drawer, ScrollArea, Tabs } from '@mantine/core';
import { useMediaQuery, useSessionStorage } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import styles from './TrailMap.module.css';
import { SegmentDetailsPanel } from '@/components/SegmentDetailsPanel/SegmentDetailsPanel';
import WelcomePanel, { LayerOption } from '@/components/WelcomePanel/WelcomePanel';
import { SegmentStates, SEGMENT_STATES } from './TrailMap.config';
import SegmentsLayer, {
  SEGMENTS_SYMBOLOGY_LAYER_IDS,
  SEGMENTS_SOURCE_ID,
  SEGMENTS_HOVER_LAYER_ID,
} from '@/components/MapLayers/Segments/Segments.layer';
import { WelcomeModal } from '@/components/WelcomeModal/WelcomeModal';
import CommuterRailLayer, {
  COMMUTER_RAIL_LAYER_IDS,
} from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import Subway, { SUBWAY_LAYER_IDS } from '@/components/MapLayers/Subway/Subway.layer';
import { mapStyle } from './MapStyle';
import { useData } from '@/components/DataProvider/DataProvider';
import { createSlug } from '@/utils';
import { RawSegment } from '@/types';

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
              map.setFilter(layerId, ['all', ['==', ['get', 'style'], 'dashed'], stateFilter]);
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
          layers={layers}
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

function TrailMap({
  mapRef,
  onClick,
}: {
  mapRef: React.RefObject<MapRef>;
  onClick: (e: MapLayerMouseEvent) => void;
}) {
  const hoveredSegmentId = useRef<string | null>(null);

  const onMouseMoveHandler = (e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    let features: MapGeoJSONFeature[] = [];
    if (map.getLayer(SEGMENTS_HOVER_LAYER_ID)) {
      features = map.queryRenderedFeatures(e.point, {
        layers: [SEGMENTS_HOVER_LAYER_ID],
      });
    }

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

  const [viewState, setViewState] = useSessionStorage({
    key: 'viewState',
    defaultValue: {
      longitude: -71.68,
      latitude: 42.35,
      zoom: 8.78,
    },
  });

  return (
    <Map
      ref={mapRef}
      maxZoom={17}
      minZoom={7}
      maxBounds={[
        [-74.563994, 40.935011],
        [-69.07083, 43.405765],
      ]}
      boxZoom={false}
      // @ts-ignore
      mapStyle={mapStyle}
      interactiveLayerIds={[SEGMENTS_HOVER_LAYER_ID]}
      onMouseMove={onMouseMoveHandler}
      onClick={onClick}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
    >
      <GeolocateControl />
      <NavigationControl />
      <ScaleControl unit="imperial" />

      <SegmentsLayer />
      <Subway />
      <CommuterRailLayer />
    </Map>
  );
}

export function TrailMapPage() {
  const mapRef = useRef<MapRef>(null);
  const { currentData } = useData();
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

  function getSegmentsByTrailNames(trailName: string | null): RawSegment[] {
    if (trailName === null) return [];

    const trailNames = trailName.split(',');
    const trails = Object.values(currentData.trails).filter(({ name }) =>
      trailNames.includes(createSlug(name))
    );

    if (!trails.length) return [];

    const segments = Object.values(currentData.segments).filter(({ trails: segmentTrails }) =>
      segmentTrails.some((trailId) => trails.some((trail) => trail.id === trailId))
    );

    return segments;
  }

  function getSegmentByIds(id: string | null): RawSegment[] {
    if (!id) return [];
    const ids = id.split(',');
    return ids
      .map((segId) => (!Number.isNaN(Number(segId)) ? currentData.segments[Number(segId)] : null))
      .filter((segment): segment is RawSegment => segment !== null);
  }

  const handleMapUpdate = (segmentIds: number[], bbox: turf.BBox) => {
    const waitForMap = (attempts = 0): any => {
      const { current } = mapRef;

      if (!current) {
        if (attempts >= 10) return;
        setTimeout(() => waitForMap(attempts + 1), 100);
        return;
      }

      const map = current.getMap();
      const source = map.getSource(SEGMENTS_SOURCE_ID);

      if (!source) {
        if (attempts >= 10) return;
        setTimeout(() => waitForMap(attempts + 1), 100);
        return;
      }

      const fitToBounds = () =>
        current.fitBounds(bbox as LngLatBoundsLike, { padding: 20, maxZoom: 14 });

      if (current.isStyleLoaded()) {
        fitToBounds();
      } else {
        current.once('load', () => fitToBounds());
      }

      const setHoverState = (ids: number[], value: boolean) =>
        ids.forEach((id) =>
          map.setFeatureState({ source: SEGMENTS_SOURCE_ID, id }, { hover: value })
        );

      setHoverState(segmentIds, true);
      setTimeout(() => setHoverState(segmentIds, false), 3000);
    };

    waitForMap();
  };

  useEffect(() => {
    const segmentId = searchParams.get('segment');
    const trailName = searchParams.get('trail');

    const segments = [...getSegmentByIds(segmentId), ...getSegmentsByTrailNames(trailName)];
    if (!segments.length) return;

    const coordinates = segments.flatMap(({ geometry }) => geometry.coordinates.flat());
    if (!coordinates.length) return;

    handleMapUpdate(
      segments.map(({ id }) => id),
      turf.bbox(turf.lineString(coordinates))
    );
  }, []);

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
