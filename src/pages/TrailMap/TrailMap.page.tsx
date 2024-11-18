import React, { ReactElement, useState } from 'react';
import {
  GeolocateControl,
  Map as ReactMap,
  MapLayerMouseEvent,
  NavigationControl,
  Popup as MapPopup,
} from 'react-map-gl';
import { Affix, Button, Drawer, ScrollArea, Stack, Tabs } from '@mantine/core';
import { IconBrandGoogleMaps, IconMap2 } from '@tabler/icons-react';
import classes from './TrailMap.module.css';
import { SegmentDetailsPanel } from '@/components/SegmentDetailsPanel/SegmentDetailsPanel';
import WelcomePanel from '@/components/WelcomePanel/WelcomePanel';
import { SegmentStates, SEGMENT_STATES } from './TrailMap.config';
import CommuterRailLayer from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import Subway from '@/components/MapLayers/Subway/Subway.layer';
import SegmentsLayer, { segmentsLayerId } from '@/components/MapLayers/Segments/Segments.layer';
import { useSearchParams } from 'react-router-dom';
import { WelcomeModal } from '@/components/WelcomeModal/WelcomeModal';

export interface Hover {
  layer: string;
  id: string | number | undefined;
}

interface Popup {
  lng: number;
  lat: number;
  content: ReactElement;
}

const LOAD_MAP = true;

export function TrailMap() {
  const [popup, setPopup] = useState<Popup | undefined>(undefined);
  let [searchParams, setSearchParams] = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Active Tab /////////////////////////////////////////////////////////////////////
  const [activeTab, setActiveTab] = useState<string | null>(
    searchParams.get('segment') ? 'segmentDetailsPanel' : 'welcome'
  );

  // Segment States /////////////////////////////////////////////////////////////////
  const [segmentStates, setSegmentStates] = useState<SegmentStates>(SEGMENT_STATES);
  const toggleSegmentStateVisibility = (value: string) => {
    setSegmentStates((prev) => ({
      ...prev,
      [value]: { ...prev[value], visible: !prev[value].visible },
    }));
  };

  // Layers /////////////////////////////////////////////////////////////////////////
  const [commuterRailVisible, setCommuterRailVisible] = useState<boolean>(false);
  const [subwayVisible, setSubwayVisible] = useState<boolean>(false);
  const layers = [
    {
      label: 'Commuter Rail',
      visible: commuterRailVisible,
      toggle: () => setCommuterRailVisible((prev) => !prev),
    },
    { label: 'Subway', visible: subwayVisible, toggle: () => setSubwayVisible((prev) => !prev) },
  ];

  const [hover, setHover] = useState<Hover | undefined>();
  const [cursorStyle, setCursorStyle] = useState<string>();

  const onContextHandler = (e: MapLayerMouseEvent) => {
    const [lng, lat] = e.lngLat.toArray();

    if (!e.features || e.features.length === 0) {
      const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      const appleMapsUrl = `https://maps.apple.com/?ll=${lat},${lng}&q=Dropped%20Pin`;

      setPopup({
        lng,
        lat,
        content: (
          <Stack gap="xs">
            <Button
              leftSection={<IconBrandGoogleMaps size={14} />}
              variant="default"
              component="a"
              target="_blank"
              href={googleMapsUrl}
            >
              Open in Google Maps
            </Button>
            <Button
              leftSection={<IconMap2 size={14} />}
              variant="default"
              component="a"
              target="_blank"
              href={appleMapsUrl}
            >
              Open in Apple Maps
            </Button>
          </Stack>
        ),
      });
    }
  };

  const onClickHandler = (e: MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0) return;

    const [id, layer] = [e.features[0].id, e.features[0].layer.id];

    if (layer === segmentsLayerId && id != undefined) {
      searchParams.set('segment', `${id}`);
      setSearchParams(searchParams);
      setActiveTab('segmentDetailsPanel');
    }
  };

  const onMouseMoveHandler = (e: MapLayerMouseEvent) => {
    if (!e.features?.length) {
      setHover(undefined);
      setCursorStyle(undefined);
    } else {
      const [id, layer] = [e.features[0].id, e.features[0].layer.id];
      if (!hover || layer !== hover.layer || id !== hover.id) {
        setHover({ layer, id });
        setCursorStyle('pointer');
      }
    }
  };

  const tabs = (
    <Tabs
      value={activeTab}
      onChange={setActiveTab}
      radius="xs"
      classNames={{ tabLabel: classes.tabLabel, panel: classes.panel }}
    >
      <Tabs.List grow>
        <Tabs.Tab value="welcome">Map Settings</Tabs.Tab>
        <Tabs.Tab value="segmentDetailsPanel">Segment Details</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="welcome">
        <WelcomePanel
          segmentStates={segmentStates}
          toggleSegmentStateVisibility={toggleSegmentStateVisibility}
          layers={layers}
        />
      </Tabs.Panel>
      <Tabs.Panel value="segmentDetailsPanel">
        <SegmentDetailsPanel />
      </Tabs.Panel>
    </Tabs>
  );

  return (
    <div className={classes.container}>
      <WelcomeModal />

      <Drawer
        position="bottom"
        size="md"
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        withCloseButton={false}
        keepMounted
        radius="md"
        hiddenFrom="sm"
      >
        {tabs}
      </Drawer>

      <ScrollArea h="100%" type="scroll" scrollbars="y" className={classes.aside} visibleFrom="sm">
        {tabs}
      </ScrollArea>

      <div className={classes.body}>
        <Button
          styles={{
            root: {
              // style
              color: '#333333',
              backgroundColor: 'white',
              boxShadow: '0 0 0 2px rgba(0, 0, 0, .1)',
              // position
              zIndex: '1',
              position: 'absolute',
              transform: 'translateX(-50%)',
              bottom: '30px',
              left: '50%',
            },
            label: {
              fontWeight: 'bold',
            },
          }}
          onClick={() => setDrawerOpen((prev) => !prev)}
          hiddenFrom="sm"
        >
          Open Map Settings
        </Button>

        {LOAD_MAP && (
          <ReactMap
            reuseMaps
            dragRotate={false}
            boxZoom={false}
            onContextMenu={onContextHandler}
            onMouseMove={onMouseMoveHandler}
            onClick={onClickHandler}
            cursor={cursorStyle}
            interactiveLayerIds={[segmentsLayerId]}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            mapStyle="mapbox://styles/dnoen/clp8rwblo001001p84znz9viw"
            initialViewState={{
              longitude: -71.68,
              latitude: 42.35,
              zoom: 8.78,
            }}
          >
            <GeolocateControl position="top-right" />
            <NavigationControl position="top-right" />

            {popup && (
              <MapPopup
                anchor="top-left"
                longitude={Number(popup.lng)}
                latitude={Number(popup.lat)}
                onClose={() => setPopup(undefined)}
                closeButton={false}
                closeOnMove
                style={{ borderTopColor: 'gray' }}
              >
                {popup.content}
              </MapPopup>
            )}

            <SegmentsLayer states={segmentStates} hover={hover} />
            {commuterRailVisible && <CommuterRailLayer visible={commuterRailVisible} />}
            {subwayVisible && <Subway visible={subwayVisible} />}
          </ReactMap>
        )}
      </div>
    </div>
  );
}
