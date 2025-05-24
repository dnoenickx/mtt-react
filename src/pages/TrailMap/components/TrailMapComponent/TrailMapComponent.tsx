import React, { useState } from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/maplibre';
import { useMantineColorScheme } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { getInitialBounds } from './utils/initialBounds';
import { MapPopup, PopupData } from '../MapPopup';
import { darkStyle, lightStyle } from '../../MapStyle';
import { useData } from '@/components/DataProvider/DataProvider';
import './TrailMapComponent.module.css';
import { DEFAULT_VIEW_STATE } from '@/constants';
import { useMap, LayerHook } from '../../context/MapContext';

export function TrailMapComponent() {
  const { currentData } = useData();
  const [searchParams] = useSearchParams();
  const [popup, setPopup] = useState<PopupData | undefined>(undefined);
  const { colorScheme } = useMantineColorScheme();
  const { mapRef, interactiveLayerIds, visibleLayers } = useMap();

  const onClickHandler = (e: MapLayerMouseEvent) => {
    visibleLayers.forEach((layer: LayerHook) => layer.handleClick?.(e));
  };

  const onContextMenuHandler = (e: MapLayerMouseEvent) => {
    const [lng, lat] = e.lngLat.toArray();
    setPopup({ lng, lat });
  };

  const onMouseMoveHandler = (e: MapLayerMouseEvent) => {
    visibleLayers.forEach((layer: LayerHook) => layer.handleMouseMove?.(e));
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
      onMouseMove={onMouseMoveHandler}
      onClick={onClickHandler}
      onContextMenu={onContextMenuHandler}
      initialViewState={getInitialBounds(searchParams, currentData) ?? DEFAULT_VIEW_STATE}
    >
      <GeolocateControl />
      <NavigationControl />
      <ScaleControl unit="imperial" />

      {visibleLayers.map((layer, index) => (
        <React.Fragment key={index}>{layer.render()}</React.Fragment>
      ))}

      <MapPopup popup={popup} onClose={() => setPopup(undefined)} />
    </Map>
  );
}
