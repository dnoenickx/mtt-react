import React, { ReactElement, useState } from 'react';
import {
  FullscreenControl,
  GeolocateControl,
  Map as ReactMap,
  MapLayerMouseEvent,
  NavigationControl,
  Popup as MapPopup,
  ScaleControl,
} from 'react-map-gl';
import { Button, Group, Modal, ScrollArea, Stack, Tabs } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconBrandGoogleMaps, IconMap2 } from '@tabler/icons-react';
import classes from './TrailMap.module.css';
import { SegmentDetailsPanel } from '@/components/SegmentDetailsPanel/SegmentDetailsPanel';
import WelcomePanel from '@/components/WelcomePanel/WelcomePanel';
import { SegmentStates, SEGMENT_STATES } from './TrailMap.config';
import CommuterRailLayer from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import Subway from '@/components/MapLayers/Subway/Subway.layer';
import SegmentsLayer, { segmentsLayerName } from '@/components/MapLayers/Segments/Segments.layer';

export interface Hover {
  layer: string;
  id: string | number | undefined;
}

interface Popup {
  lng: number;
  lat: number;
  content: ReactElement;
}

export function TrailMap() {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | number | undefined>(
    undefined
  );

  const mobile = useMediaQuery('(min-width: 414px)');

  const [popup, setPopup] = useState<Popup | undefined>(undefined);

  // Active Tab /////////////////////////////////////////////////////////////////////
  const [activeTab, setActiveTab] = useState<string | null>('welcome');

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

  // const [baseMap, setBaseMap] = useState<string>('default');

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
        // <a target="_blank" rel="noopener noreferrer" href={googleMapsUrl}>
        //   Google Maps
        // </a>
      });
    }
  };

  const onClickHandler = (e: MapLayerMouseEvent) => {
    if (!e.features || e.features.length === 0) return;

    const [id, layer] = [e.features[0].id, e.features[0].layer.id];

    if (layer === segmentsLayerName) {
      setSelectedSegmentId(id);
      setActiveTab('segmentDetailsPanel');
    }
  };

  const onEnterHandler = (e: MapLayerMouseEvent) => {
    if (!e.features) return;

    const [id, layer] = [e.features[0].id, e.features[0].layer.id];

    if (!hover || layer !== hover.layer || id !== hover.id) {
      setHover({ layer, id });
      setCursorStyle('pointer');
    }
  };

  const onLeaveHandler = () => {
    setHover(undefined);
    setCursorStyle(undefined);
  };

  const [opened, { close }] = useDisclosure(sessionStorage.getItem('acceptedWelcome') !== 'true');

  return (
    <div className={classes.container}>
      <Modal opened={opened} onClose={close} withCloseButton={false} centered>
        <p>
          Update (May 2024): I&apos;m working on a lot of updates to the website, including the
          ability to submit changes. If you see anything that&apos;s incorrect, or want to request a
          feature, email me{' '}
          <a href="mailto:mass.trail.tracker@gmail.com">mass.trail.tracker@gmail.com</a>
        </p>
        <p style={{ color: 'gray', fontSize: 'small' }}>
          Disclaimer: The data herein is provided for informational purposes only. MassTrailTracker
          makes no warranties, either expressed or implied, and assumes no responsibility for its
          completeness or accuracy. Users assume all responsibility and risk associated with use of
          the map and agree to indemnify and hold harmless MassTrailTracker with respect to any and
          all claims and demands that may arise resulting from use of this map.
        </p>
        <Group justify="center">
          <Button
            onClick={() => {
              sessionStorage.setItem('acceptedWelcome', 'true');
              close();
            }}
          >
            Get started
          </Button>
        </Group>
      </Modal>
      <ScrollArea h="100%" type="scroll" scrollbars="y" className={classes.aside}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          radius="xs"
          classNames={{ tabLabel: classes.tabLabel, panel: classes.panel }}
        >
          <Tabs.List grow>
            <Tabs.Tab value="welcome">Welcome</Tabs.Tab>
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
            <SegmentDetailsPanel segmentId={selectedSegmentId as number} />
          </Tabs.Panel>
        </Tabs>
      </ScrollArea>
      <div className={classes.body}>
        <ReactMap
          reuseMaps
          dragRotate={false}
          boxZoom={false}
          onMouseEnter={onEnterHandler}
          onContextMenu={onContextHandler}
          onMouseLeave={onLeaveHandler}
          onClick={onClickHandler}
          cursor={cursorStyle}
          interactiveLayerIds={[segmentsLayerName]}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
          // mapStyle="mapbox://styles/mapbox/light-v11"
          mapStyle="mapbox://styles/dnoen/clp8rwblo001001p84znz9viw"
          initialViewState={{
            longitude: -71.68,
            latitude: 42.35,
            zoom: 8.78,
          }}
        >
          {mobile && <GeolocateControl position="top-right" />}
          {mobile && <FullscreenControl position="top-right" />}
          <NavigationControl position="top-right" />
          <ScaleControl />

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
      </div>
    </div>
  );
}
