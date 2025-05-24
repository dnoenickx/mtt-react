import React, { RefObject, useRef } from 'react';
import { Layer, Source, MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import { lines, stations } from './CommuterRail';
import { updateHover } from '@/mapUtils';
import { LayerHook } from '@/pages/TrailMap/context/MapContext';

export const COMMUTER_RAIL_LINES_SOURCE = 'commuter_rail_lines_source';
export const COMMUTER_RAIL_STATIONS_SOURCE = 'commuter_rail_stations_source';

export const COMMUTER_RAIL_LINES_LAYER = 'commuter_rail_lines_layer';
export const COMMUTER_RAIL_STATIONS_LAYER = 'commuter_rail_stations_layer';
export const COMMUTER_RAIL_STATIONS_HOVER_LAYER = 'commuter_rail_stations_hover_layer';

interface CommuterRailLayerProps {
  mapRef: RefObject<MapRef>;
  visible?: boolean;
}

export function useCommuterRailLayer({
  mapRef,
  visible = true,
}: CommuterRailLayerProps): LayerHook {
  const hoveredStationId = useRef<number | undefined>(undefined);
  const visibility = visible ? 'visible' : 'none';

  const handleClick = (e: MapLayerMouseEvent): void => {
    const features = e.features;
    if (!features) return;

    const [matchingFeature] = features.filter(
      (feature) => feature.layer.id === COMMUTER_RAIL_STATIONS_HOVER_LAYER
    );

    if (matchingFeature) {
      console.log(matchingFeature.properties?.STATION);
    }
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    updateHover({
      mapRef,
      e,
      source: COMMUTER_RAIL_STATIONS_SOURCE,
      layers: [COMMUTER_RAIL_STATIONS_HOVER_LAYER],
      hoveredId: hoveredStationId,
      defaultCursor: '',
      hoverCursor: 'pointer',
    });
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
    handleClick,
    handleMouseMove,
    interactiveLayerIds: [COMMUTER_RAIL_STATIONS_HOVER_LAYER],
    render,
  };
}
