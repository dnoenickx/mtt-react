import React, { ReactElement, useState, useEffect } from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  ScaleControl,
  Popup as MapLibrePopup,
  MapRef,
} from 'react-map-gl/maplibre';
import { PositionAnchor } from 'maplibre-gl';
import { useMantineColorScheme } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { getInitialBounds } from './utils/initialBounds';
import { darkStyle, lightStyle } from '../../MapStyle';
import { useData } from '@/components/DataProvider/DataProvider';
import './TrailMapComponent.module.css';
import { DEFAULT_VIEW_STATE } from '@/constants';
import { OpenExternalMapPopup } from '../OpenExternalMapPopup/OpenExternalMapPopup';

// Import map layer components
import { CommuterRailLayer } from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import { SegmentsLayer } from '@/components/MapLayers/Segments/Segments.layer';
import { BikeSharePopup } from '@/components/MapLayers/BikeShare/BikeSharePopup';
import { CommuterRailPopup } from '@/components/MapLayers/CommuterRail/CommuterRailPopup';
import { useLayerVisibility } from '../../context/LayerVisibilityContext';
import { BikeShareLayer } from '@/components/MapLayers/BikeShare/BikeShare.layer';
import { SubwayLayer } from '@/components/MapLayers/Subway/Subway.layer';

const featuresByLayer = (e: MapLayerMouseEvent): Record<string, GeoJSON.Feature[]> => {
  if (!e.features) {
    return {};
  }

  const groupedFeatures = e.features.reduce(
    (acc, feature) => {
      const layerId = feature.layer.id;
      acc[layerId] = acc[layerId] || [];
      acc[layerId].push(feature);
      return acc;
    },
    {} as Record<string, GeoJSON.Feature[]>
  );

  return groupedFeatures;
};

interface TrailMapComponentProps {
  navigateToTab: (tab: string) => void;
  mapRef: React.RefObject<MapRef>;
}

export function TrailMapComponent({ navigateToTab, mapRef }: TrailMapComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { colorScheme } = useMantineColorScheme();
  const { currentData } = useData();
  const { popup, setPopup, handleClick, handleMouseMove, interactiveLayerIds } =
    useLayerVisibility();

  const contextMenuHandler = (e: MapLayerMouseEvent) => {
    const [lng, lat] = e.lngLat.toArray();
    setPopup({ lng, lat, content: <OpenExternalMapPopup lng={lng} lat={lat} />, source: 'click' });
  };

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
      interactiveLayerIds={interactiveLayerIds}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={contextMenuHandler}
      initialViewState={getInitialBounds(searchParams, currentData) ?? DEFAULT_VIEW_STATE}
    >
      <GeolocateControl />
      <NavigationControl />
      <ScaleControl unit="imperial" />

      <CommuterRailLayer mapRef={mapRef} />
      <SubwayLayer mapRef={mapRef} />
      <BikeShareLayer mapRef={mapRef} />
      <SegmentsLayer
        mapRef={mapRef}
        onSegmentClick={(id) => {
          setSearchParams({ segment: id });
          navigateToTab('segmentDetailsPanel');
        }}
      />

      {popup && (
        <MapLibrePopup
          anchor={popup.anchor || 'top-left'}
          longitude={Number(popup.lng)}
          latitude={Number(popup.lat)}
          onClose={() => {
            console.log('closing popup');
            setPopup(undefined);
          }}
          closeButton={popup.source === 'click'}
          closeOnMove={popup.source === 'hover'}
        >
          {popup.content}
        </MapLibrePopup>
      )}
    </Map>
  );
}
