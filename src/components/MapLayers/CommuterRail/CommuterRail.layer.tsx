import React, { RefObject, useRef } from 'react';
import { Layer, Source, MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import type { Feature, Point } from 'geojson';
import { updateHover } from '@/mapUtils';
import { LayerHook, PopupData } from '@/pages/TrailMap/context/MapContext';
import { useCommuterRailData } from './useCommuterRailData';
import { featureCollection } from '@turf/turf';

export const COMMUTER_RAIL_LINES_SOURCE = 'commuter_rail_lines_source';
export const COMMUTER_RAIL_STATIONS_SOURCE = 'commuter_rail_stations_source';

export const COMMUTER_RAIL_LINES_LAYER = 'commuter_rail_lines_layer';
export const COMMUTER_RAIL_STATIONS_LAYER = 'commuter_rail_stations_layer';
export const COMMUTER_RAIL_STATIONS_HOVER_LAYER = 'commuter_rail_stations_hover_layer';

interface CommuterRailLayerProps {
  mapRef: RefObject<MapRef>;
  visible?: boolean;
  setPopup?: (popup: PopupData | undefined) => void;
}

export function useCommuterRailLayer({
  mapRef,
  visible = true,
  setPopup,
}: CommuterRailLayerProps): LayerHook {
  const hoveredStationId = useRef<number | undefined>(undefined);
  const visibility = visible ? 'visible' : 'none';

  const { data } = useCommuterRailData(visible);
  const stations = data?.stations ?? featureCollection([]);
  const lines = data?.lines ?? featureCollection([]);

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    const [feature] = updateHover({
      mapRef,
      e,
      source: COMMUTER_RAIL_STATIONS_SOURCE,
      layers: [COMMUTER_RAIL_STATIONS_HOVER_LAYER],
      hoveredId: hoveredStationId,
      defaultCursor: '',
      hoverCursor: 'pointer',
    });

    // show popup showing station name
    if (setPopup) {
      if (feature && feature.geometry.type === 'Point') {
        const stationName = feature.properties?.STATION;
        if (stationName) {
          const pointFeature = feature as Feature<Point>;
          setPopup({
            lng: pointFeature.geometry.coordinates[0],
            lat: pointFeature.geometry.coordinates[1],
            content: <div>{stationName}</div>,
            anchor: 'bottom',
          });
        }
      } else {
        // Clear popup when not hovering over a station
        setPopup(undefined);
      }
    }
  };

  const render = () => (
    <>
      <Source id={COMMUTER_RAIL_LINES_SOURCE} type="geojson" data={lines}>
        <Layer
          id={COMMUTER_RAIL_LINES_LAYER}
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            'line-color': '#B3439E',
          }}
        />
      </Source>

      <Source id={COMMUTER_RAIL_STATIONS_SOURCE} type="geojson" data={stations}>
        <Layer
          id={COMMUTER_RAIL_STATIONS_LAYER}
          type="circle"
          layout={{ visibility }}
          paint={{
            'circle-radius': 2.75,
            'circle-color': '#B3439E',
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
        <Layer
          id={COMMUTER_RAIL_STATIONS_HOVER_LAYER}
          type="circle"
          layout={{ visibility }}
          paint={{ 'circle-radius': 5, 'circle-opacity': 0 }}
        />
      </Source>
    </>
  );

  return {
    handleMouseMove,
    interactiveLayerIds: [COMMUTER_RAIL_STATIONS_HOVER_LAYER],
    render,
  };
}
