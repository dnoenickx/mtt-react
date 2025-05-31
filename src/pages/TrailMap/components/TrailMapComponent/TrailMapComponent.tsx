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
import { SubwayLayer, SUBWAY_LAYER_TO_SOURCE } from '@/components/MapLayers/Subway/Subway.layer';
import {
  CommuterRailLayer,
  COMMUTER_RAIL_LAYER_TO_SOURCE,
  COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER,
} from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import {
  BikeShareLayer,
  BIKE_SHARE_LAYER_TO_SOURCE,
  BIKE_SHARE_INTERACTIVE_LAYER_ID,
} from '@/components/MapLayers/BikeShare/BikeShare.layer';
import {
  SegmentsLayer,
  SEGMENTS_LAYER_TO_SOURCE,
  SEGMENTS_INTERACTIVE_LAYER_ID,
} from '@/components/MapLayers/Segments/Segments.layer';
import { BikeSharePopup } from '@/components/MapLayers/BikeShare/BikeSharePopup';
import { CommuterRailPopup } from '@/components/MapLayers/CommuterRail/CommuterRailPopup';
import { useLayerVisibility } from '../../context/LayerVisibilityContext';

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

interface PopupData {
  lng: number;
  lat: number;
  content?: ReactElement;
  anchor?: PositionAnchor;
}

interface TrailMapComponentProps {
  navigateToTab: (tab: string) => void;
  mapRef: React.RefObject<MapRef>;
}

export function TrailMapComponent({ navigateToTab, mapRef }: TrailMapComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { colorScheme } = useMantineColorScheme();
  const { setMapRef } = useLayerVisibility();
  const { currentData } = useData();

  const [popup, setPopup] = useState<PopupData | undefined>(undefined);

  // Combined layer-to-source mapping
  const LAYER_TO_SOURCE_MAP = {
    ...SEGMENTS_LAYER_TO_SOURCE,
    ...BIKE_SHARE_LAYER_TO_SOURCE,
    ...COMMUTER_RAIL_LAYER_TO_SOURCE,
    ...SUBWAY_LAYER_TO_SOURCE,
  };

  const [hoveredLayer, _setHoveredLayer] = useState<keyof typeof LAYER_TO_SOURCE_MAP | null>(null);
  const [hoveredFeatureId, _setHoveredFeatureId] = useState<number | null>(null);

  const updateHoveredFeature = (
    layerId: keyof typeof LAYER_TO_SOURCE_MAP | null,
    featureId: number | null
  ) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // skip if no change
    if (hoveredLayer === layerId && hoveredFeatureId === featureId) return;

    // clear previous
    if (hoveredLayer && hoveredFeatureId) {
      const sourceId = LAYER_TO_SOURCE_MAP[hoveredLayer];
      if (sourceId) {
        map.setFeatureState({ source: sourceId, id: hoveredFeatureId }, { hover: false });
      }
    }

    // set new hover
    if (layerId && featureId) {
      const sourceId = LAYER_TO_SOURCE_MAP[layerId];
      if (sourceId) {
        map.setFeatureState({ source: sourceId, id: featureId }, { hover: true });
      }
    }

    // save values
    _setHoveredLayer(layerId);
    _setHoveredFeatureId(featureId);
  };

  const onClickHandler = (e: MapLayerMouseEvent) => {
    if (!e.features?.length) return;

    const features = featuresByLayer(e);
    if (features[SEGMENTS_INTERACTIVE_LAYER_ID]) {
      const id = Number(features[SEGMENTS_INTERACTIVE_LAYER_ID][0].id);
      searchParams.set('segment', `${id}`);
      setSearchParams(searchParams);
      navigateToTab('segmentDetailsPanel');
    } else if (features[BIKE_SHARE_INTERACTIVE_LAYER_ID]) {
      const feature = features[BIKE_SHARE_INTERACTIVE_LAYER_ID][0];
      const { geometry, properties } = feature;
      if (!geometry || geometry.type !== 'Point' || !properties) return;

      const [lng, lat] = geometry.coordinates;
      setPopup({
        lng,
        lat,
        content: (
          <BikeSharePopup
            name={properties.name}
            numBikesAvailable={properties.num_bikes_available}
            numEBikesAvailable={properties.num_ebikes_available}
            numDocksAvailable={properties.num_docks_available}
            updatedAt={new Date()}
          />
        ),
        anchor: 'bottom',
      });
    }
  };

  const onContextMenuHandler = (e: MapLayerMouseEvent) => {
    const [lng, lat] = e.lngLat.toArray();
    setPopup({ lng, lat, content: <OpenExternalMapPopup lng={lng} lat={lat} /> });
  };

  const onMouseMoveHandler = (e: MapLayerMouseEvent) => {
    const features = featuresByLayer(e);

    // Handle hover state for all layers
    if (features[SEGMENTS_INTERACTIVE_LAYER_ID]) {
      const id = Number(features[SEGMENTS_INTERACTIVE_LAYER_ID][0].id);
      updateHoveredFeature(SEGMENTS_INTERACTIVE_LAYER_ID, id);
    } else if (features[BIKE_SHARE_INTERACTIVE_LAYER_ID]) {
      const id = Number(features[BIKE_SHARE_INTERACTIVE_LAYER_ID][0].id);
      updateHoveredFeature(BIKE_SHARE_INTERACTIVE_LAYER_ID, id);
    } else if (features[COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER]) {
      const feature = features[COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER][0];
      const id = Number(feature.id);
      updateHoveredFeature(COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER, id);

      // Show popup for commuter rail on hover
      if (feature.geometry?.type === 'Point') {
        const stationName = feature.properties?.STATION;
        if (stationName) {
          const [lng, lat] = feature.geometry.coordinates;
          setPopup({
            lng,
            lat,
            content: <CommuterRailPopup stationName={stationName} />,
            anchor: 'bottom',
          });
        }
      }
    } else {
      updateHoveredFeature(null, null);

      // Clear popup only if it's a hover popup (not a click popup for bikeshare)
      if (popup && hoveredLayer === COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER) {
        setPopup(undefined);
      }
    }
  };

  // Track whether the popup is from a click (persistent) or hover (temporary)
  const [popupSource, setPopupSource] = useState<'click' | 'hover' | null>(null);

  // Update popup source when popup changes
  useEffect(() => {
    if (!popup) {
      setPopupSource(null);
      return;
    }

    if (hoveredLayer === COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER) {
      setPopupSource('hover');
    } else if (popup) {
      setPopupSource('click');
    }
  }, [popup, hoveredLayer]);

  const mapStyle = colorScheme === 'dark' ? darkStyle : lightStyle;

  // Pass mapRef to the LayerVisibilityContext
  useEffect(() => {
    setMapRef(mapRef);
  }, [mapRef, setMapRef]);

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
      interactiveLayerIds={[
        BIKE_SHARE_INTERACTIVE_LAYER_ID,
        COMMUTER_RAIL_STATIONS_INTERACTIVE_LAYER,
        SEGMENTS_INTERACTIVE_LAYER_ID,
      ]}
      onMouseMove={onMouseMoveHandler}
      onClick={onClickHandler}
      onContextMenu={onContextMenuHandler}
      initialViewState={getInitialBounds(searchParams, currentData) ?? DEFAULT_VIEW_STATE}
    >
      <GeolocateControl />
      <NavigationControl />
      <ScaleControl unit="imperial" />

      <CommuterRailLayer mapRef={mapRef} />
      <BikeShareLayer mapRef={mapRef} />
      <SubwayLayer mapRef={mapRef} />
      <SegmentsLayer mapRef={mapRef} />

      {popup && (
        <MapLibrePopup
          anchor={popup.anchor || 'top-left'}
          longitude={Number(popup.lng)}
          latitude={Number(popup.lat)}
          onClose={() => setPopup(undefined)}
          closeButton={popupSource === 'click'}
          closeOnMove={popupSource === 'hover'}
        >
          {popup.content}
        </MapLibrePopup>
      )}
    </Map>
  );
}
