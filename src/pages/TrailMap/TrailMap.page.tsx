import React, { useMemo, useState, useRef, useCallback, ReactElement } from 'react';
import Map, {
  GeolocateControl,
  LngLatBoundsLike,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  Popup as MapPopup,
  ScaleControl,
} from 'react-map-gl/maplibre';
import {
  Button,
  Drawer,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import { IconBrandApple, IconBrandGoogleMaps, IconBrandStrava } from '@tabler/icons-react';
import { bbox, feature, featureCollection } from '@turf/turf';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
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
import { darkStyle, lightStyle } from './MapStyle';
import { useData } from '@/components/DataProvider/DataProvider';
import { createSlug } from '@/utils';
import TOWN_BOUNDING_BOXES from '../../town_bbox.json';

interface Popup {
  lng: number;
  lat: number;
  content: ReactElement;
}

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
  const { currentData } = useData();
  const [searchParams] = useSearchParams();
  const [popup, setPopup] = useState<Popup | undefined>(undefined);
  const { colorScheme } = useMantineColorScheme();

  const hoveredSegmentId = useRef<string | null>(null);

  const onContextMenuHandler = (e: MapLayerMouseEvent) => {
    const [lng, lat] = e.lngLat.toArray();

    setPopup({
      lng,
      lat,
      content: (
        <Stack gap={0}>
          <Text size="xs" ta="center" c="dimmed">
            Open in
          </Text>
          <Button.Group orientation="vertical">
            <Button
              leftSection={<IconBrandGoogleMaps size={14} />}
              variant="subtle"
              component="a"
              target="_blank"
              justify="left"
              href={`https://maps.google.com/?q=${lat},${lng}`}
            >
              Google Maps
            </Button>
            <Button
              leftSection={<IconBrandApple size={14} />}
              variant="subtle"
              component="a"
              target="_blank"
              justify="left"
              href={`https://maps.apple.com/?ll=${lat},${lng}&q=Dropped%20Pin`}
            >
              Apple Maps
            </Button>
            <Button
              leftSection={<IconBrandStrava size={14} />}
              variant="subtle"
              component="a"
              target="_blank"
              justify="left"
              href={`https://www.strava.com/maps/global-heatmap?sport=Ride&style=dark&terrain=false&labels=true&poi=false&cPhotos=false&gColor=hot&gOpacity=100#${e.target.getZoom()}/${lat}/${lng}`}
            >
              Strava Heatmap
            </Button>
          </Button.Group>
        </Stack>
      ),
    });
  };

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
      const hoveredFeature = features[0];
      const featureId = hoveredFeature.id?.toString();

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

  function getInitialBounds():
    | {
        bounds: LngLatBoundsLike;
        fitBoundsOptions: {
          padding: number;
        };
      }
    | undefined {
    const formatInitialState = (bounds: BBox2d) => ({
      bounds: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ] as LngLatBoundsLike,
      fitBoundsOptions: {
        padding: 50,
      },
    });

    // Check town first
    const townNames = (searchParams.get('town') || '').split(',');
    if (townNames.length) {
      const mergedBounds: BBox2d = townNames
        .filter((name): name is keyof typeof TOWN_BOUNDING_BOXES => name in TOWN_BOUNDING_BOXES)
        .reduce(
          (bounds, name) => {
            const townBbox = TOWN_BOUNDING_BOXES[name];
            return [
              Math.min(bounds[0], townBbox[0]),
              Math.min(bounds[1], townBbox[1]),
              Math.max(bounds[2], townBbox[2]),
              Math.max(bounds[3], townBbox[3]),
            ];
          },
          [Infinity, Infinity, -Infinity, -Infinity]
        );

      if (mergedBounds[0] !== Infinity) {
        return formatInitialState(mergedBounds);
      }
    }

    // Parse trail and segment parameters
    const trailNames = (searchParams.get('trail') || '').split(',');
    const trailIds = trailNames.length
      ? Object.values(currentData.trails)
          .filter(
            (trail) =>
              trailNames.includes(createSlug(trail.name)) ||
              (trail.slug && trailNames.includes(trail.slug))
          )
          .map((trail) => trail.id)
      : [];

    const segmentParam = searchParams.get('segment') || '';
    const segmentIds = segmentParam
      .split(',')
      .filter(Boolean) // Remove empty strings
      .map(Number);

    if (!segmentIds.length && !trailIds.length) return undefined;

    // Find segments that match the criteria
    const segments = Object.values(currentData.segments).filter(
      (segment) =>
        segmentIds.includes(segment.id) || segment.trails.some((id) => trailIds.includes(id))
    );

    if (!segments.length) return undefined;

    // Calculate and set the map bounds
    const features = segments.map((segment) => feature(segment.geometry));
    return formatInitialState(bbox(featureCollection(features)) as BBox2d);
  }

  const mapStyle = colorScheme === 'dark' ? darkStyle : lightStyle;

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
      onContextMenu={onContextMenuHandler}
      initialViewState={
        getInitialBounds() ?? {
          longitude: -71.68,
          latitude: 42.35,
          zoom: 8.78,
        }
      }
    >
      <GeolocateControl />
      <NavigationControl />
      <ScaleControl unit="imperial" />

      <SegmentsLayer />
      <Subway />
      <CommuterRailLayer />

      {popup && (
        <MapPopup
          anchor="top-left"
          longitude={Number(popup.lng)}
          latitude={Number(popup.lat)}
          onClose={() => setPopup(undefined)}
          closeButton={false}
          closeOnMove
        >
          {popup.content}
        </MapPopup>
      )}
    </Map>
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
