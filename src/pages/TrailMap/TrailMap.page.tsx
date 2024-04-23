import React, { ReactElement } from 'react';
import {
  FullscreenControl,
  GeolocateControl,
  Map as ReactMap,
  MapLayerMouseEvent,
  NavigationControl,
  Popup as MapPopup,
  ScaleControl,
} from 'react-map-gl';
import { useState } from 'react';
import classes from './TrailMap.module.css';
import { Button, Group, Modal, ScrollArea, Tabs } from '@mantine/core';
import { SegmentDetailsPanel } from '@/components/SegmentDetailsPanel/SegmentDetailsPanel';
import WelcomePanel from '@/components/WelcomePanel/WelcomePanel';
import { SegmentStates, SEGMENT_STATES } from './TrailMap.config';
import CommuterRailLayer from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import Subway from '@/components/MapLayers/Subway/Subway.layer';
import SegmentsLayer, { segmentsLayerName } from '@/components/MapLayers/Segments/Segments.layer';
import { useDisclosure } from '@mantine/hooks';

// TODO: secure token (https://visgl.github.io/react-map-gl/docs/get-started/tips-and-tricks#securing-mapbox-token)

// NOTE: if calculating features for a map, make use of useMemo so it doesn't recacluate on each map interaction

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiZG5vZW4iLCJhIjoiY2xoNzg2bHo3MDZ2bjNmcXN2NXdtaG04ZiJ9.qyEXOJkb1eU1d7qecxjGJQ';

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

    if (!e.features || e.features.length == 0) {
      const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

      setPopup({
        lng: lng,
        lat: lat,
        content: (
          <a target="_blank" rel="noopener noreferrer" href={googleMapsUrl}>
            Google Maps
          </a>
        ),
      });
    }
  };

  const onClickHandler = (e: MapLayerMouseEvent) => {
    if (!e.features || e.features.length == 0) return;

    const [id, layer] = [e.features[0].id, e.features[0].layer.id];

    console.log(id, layer);

    if (layer === segmentsLayerName) {
      setSelectedSegmentId(id);
      setActiveTab('segmentDetailsPanel');
      //   console.log()
    }
  };

  const onEnterHandler = (e: MapLayerMouseEvent) => {
    if (!e.features) return;

    const [id, layer] = [e.features[0].id, e.features[0].layer.id];

    if (!hover || layer !== hover.layer || id !== hover.id) {
      setHover({ layer: layer, id: id });
      setCursorStyle('pointer');
    }
  };

  const onLeaveHandler = () => {
    setHover(undefined);
    setCursorStyle(undefined);
  };

  const [opened, { open, close }] = useDisclosure(
    sessionStorage.getItem('acceptedWelcome') !== 'true'
  );

  return (
    <div className={classes.container}>
      <Modal opened={opened} onClose={close} withCloseButton={false} centered>
        <p>
          Update (May 2024): I'm working on a lot of updates to the website, including the ability
          to submit changes. If you see anything that's incorrect, or want to request a feature,
          email me <a href="mailto:mass.trail.tracker@gmail.com">mass.trail.tracker@gmail.com</a>
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
      <ScrollArea h={'100%'} type="scroll" scrollbars="y" className={classes.aside}>
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
          mapboxAccessToken={MAPBOX_TOKEN}
          // mapStyle="mapbox://styles/mapbox/light-v11"
          mapStyle="mapbox://styles/dnoen/clp8rwblo001001p84znz9viw"
          initialViewState={{
            longitude: -71.68,
            latitude: 42.35,
            zoom: 8.78,
          }}
        >
          <GeolocateControl position="top-right" />
          <FullscreenControl position="top-right" />
          <NavigationControl position="top-right" />
          <ScaleControl />

          {popup && (
            <MapPopup
              anchor="top-left"
              longitude={Number(popup.lng)}
              latitude={Number(popup.lat)}
              onClose={() => setPopup(undefined)}
              closeButton={false}
              closeOnMove={true}
              style={{ borderTopColor: 'gray' }}
            >
              {popup.content}
            </MapPopup>
          )}

          <SegmentsLayer states={segmentStates} hover={hover} />
          <CommuterRailLayer visible={commuterRailVisible} />
          <Subway visible={subwayVisible} />
        </ReactMap>
      </div>
    </div>
  );
}
