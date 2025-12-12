import React from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  ScaleControl,
  Popup as MapLibrePopup,
  MapRef,
} from 'react-map-gl/maplibre';
import { useMantineColorScheme } from '@mantine/core';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getInitialBounds } from './utils/initialBounds';
import { darkStyle, lightStyle } from '../../MapStyle';
import { useData } from '@/components/DataProvider/DataProvider';
import './TrailMapComponent.module.css';
import { DEFAULT_MOBILE_VIEW_STATE, DEFAULT_VIEW_STATE } from '@/constants';
import { OpenExternalMapPopup } from '../OpenExternalMapPopup/OpenExternalMapPopup';

// Import map layer components
import { CommuterRailLayer } from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import { SegmentsLayer } from '@/components/MapLayers/Segments/Segments.layer';
import { useLayerManager } from '../../context/LayerManagerContext';
import { BikeShareLayer } from '@/components/MapLayers/BikeShare/BikeShare.layer';
import { SubwayLayer } from '@/components/MapLayers/Subway/Subway.layer';

interface TrailMapComponentProps {
  navigateToTab: (tab: string) => void;
  mapRef: React.RefObject<MapRef>;
}

export function TrailMapComponent({ navigateToTab, mapRef }: TrailMapComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isDebug = searchParams.has('debug');
  const { colorScheme } = useMantineColorScheme();
  const { currentData } = useData();
  const { popup, setPopup, handleClick, handleMouseMove, interactiveLayerIds } = useLayerManager();

  const handleMoveEnd = React.useCallback(
    (e: any) => {
      if (!isDebug) return;

      const viewState = e.viewState || e.target?.getMap()?.getViewState() || {};
      const lat = viewState.latitude;
      const lng = viewState.longitude;
      const zoom = viewState.zoom;

      if (typeof lat === 'number' && typeof lng === 'number' && typeof zoom === 'number') {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('lat', lat.toFixed(6));
        newSearchParams.set('lon', lng.toFixed(6));
        newSearchParams.set('zoom', zoom.toFixed(2));

        const newUrl = [
          location.pathname,
          newSearchParams.toString() ? `?${newSearchParams.toString()}` : '',
          location.hash,
        ].join('');

        window.history.replaceState({}, '', newUrl);
      }
    },
    [isDebug]
  );

  const getInitialViewState = () => {
    // Check for explicit lat/lon/zoom in URL params
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const zoom = parseFloat(searchParams.get('zoom') || '');

    // Only clear the params if we're not in debug mode
    if (
      (!isDebug && (!isNaN(lat) || !isNaN(lon) || !isNaN(zoom))) ||
      (isDebug && (isNaN(lat) || isNaN(lon) || isNaN(zoom)))
    ) {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      if (!isDebug) {
        newSearchParams.delete('lat');
        newSearchParams.delete('lon');
        newSearchParams.delete('zoom');
      } else {
        // For debug, ensure we have default values if any are missing
        const defaultState =
          window.innerWidth <= 768 ? DEFAULT_MOBILE_VIEW_STATE : DEFAULT_VIEW_STATE;
        if (isNaN(lat)) newSearchParams.set('lat', defaultState.latitude.toString());
        if (isNaN(lon)) newSearchParams.set('lon', defaultState.longitude.toString());
        if (isNaN(zoom)) newSearchParams.set('zoom', defaultState.zoom.toString());
      }

      const newUrl = [
        location.pathname,
        newSearchParams.toString() ? `?${newSearchParams.toString()}` : '',
        location.hash,
      ].join('');

      window.history.replaceState({}, '', newUrl);
    }

    if (!isNaN(lat) && !isNaN(lon)) {
      return {
        latitude: lat,
        longitude: lon,
        zoom: !isNaN(zoom) ? zoom : 12, // Default zoom if not provided
      };
    }

    // Then check for segment bounds
    const bounds = getInitialBounds(searchParams, currentData);
    if (bounds) {
      return bounds;
    }

    // Finally, fall back to default view state based on screen size
    return window.innerWidth <= 768 ? DEFAULT_MOBILE_VIEW_STATE : DEFAULT_VIEW_STATE;
  };

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
      pitchWithRotate={false}
      // @ts-ignore
      mapStyle={mapStyle}
      interactiveLayerIds={interactiveLayerIds}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={contextMenuHandler}
      onMoveEnd={isDebug ? handleMoveEnd : undefined}
      initialViewState={getInitialViewState()}
    >
      <GeolocateControl />
      <NavigationControl />
      <ScaleControl unit="imperial" />

      <CommuterRailLayer mapRef={mapRef} />
      <SubwayLayer />
      <BikeShareLayer mapRef={mapRef} />
      <SegmentsLayer
        mapRef={mapRef}
        onSegmentClick={(id) => {
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('segment', id);
            return newParams;
          });
          navigateToTab('segmentDetailsPanel');
        }}
      />

      {popup && (
        <MapLibrePopup
          anchor={popup.anchor || 'top-left'}
          longitude={Number(popup.lng)}
          latitude={Number(popup.lat)}
          onClose={() => setPopup(undefined)}
          closeButton={popup.source === 'click'}
          closeOnMove={popup.source === 'hover'}
        >
          {popup.content}
        </MapLibrePopup>
      )}
    </Map>
  );
}
