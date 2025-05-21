import React, { useState, useRef } from 'react';
import Map, {
  GeolocateControl,
  LngLatBoundsLike,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/maplibre';
import { useMantineColorScheme } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { bbox, feature, featureCollection } from '@turf/turf';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
import { MapPopup, PopupData } from '../MapPopup';
import SegmentsLayer, {
  SEGMENTS_SOURCE_ID,
  SEGMENTS_HOVER_LAYER_ID,
} from '@/components/MapLayers/Segments/Segments.layer';
import Subway from '@/components/MapLayers/Subway/Subway.layer';
import CommuterRailLayer from '@/components/MapLayers/CommuterRail/CommuterRail.layer';
import { darkStyle, lightStyle } from '../../MapStyle';
import { useData } from '@/components/DataProvider/DataProvider';
import { createSlug } from '@/utils';
import TOWN_BOUNDING_BOXES from '../../../../town_bbox.json';
import './TrailMapComponent.module.css';

interface TrailMapComponentProps {
  mapRef: React.RefObject<MapRef>;
  onClick: (e: MapLayerMouseEvent) => void;
}

export function TrailMapComponent({ mapRef, onClick }: TrailMapComponentProps) {
  const { currentData } = useData();
  const [searchParams] = useSearchParams();
  const [popup, setPopup] = useState<PopupData | undefined>(undefined);
  const { colorScheme } = useMantineColorScheme();

  const hoveredSegmentId = useRef<string | null>(null);

  const onContextMenuHandler = (e: MapLayerMouseEvent) => {
    const [lng, lat] = e.lngLat.toArray();
    setPopup({ lng, lat });
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

      <MapPopup popup={popup} onClose={() => setPopup(undefined)} />
    </Map>
  );
}
