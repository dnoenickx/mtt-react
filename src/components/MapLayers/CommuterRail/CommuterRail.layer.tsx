import React, { useEffect } from 'react';
import { featureCollection } from '@turf/turf';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { useCommuterRailData } from './useCommuterRailData';
import { useLayerVisibility } from '@/pages/TrailMap/context/LayerVisibilityContext';
import { CommuterRailPopup } from './CommuterRailPopup';
import { ifHovered } from '@/mapUtils';

interface CommuterRailLayerProps {
  mapRef: React.RefObject<MapRef>;
}

export function CommuterRailLayer({ mapRef }: CommuterRailLayerProps) {
  const { isLayerVisible, registerToggle, registerHoverHandler, setPopup } = useLayerVisibility();
  const visible = isLayerVisible('commuterRail');
  const visibility = visible ? 'visible' : 'none';

  const { data } = useCommuterRailData(visible);
  const stations = data?.stations ?? featureCollection([]);
  const lines = data?.lines ?? featureCollection([]);

  useEffect(() => {
    // register toggle with context
    registerToggle({
      id: 'commuterRail',
      label: 'Commuter Rail',
      visible,
      layerIds: [
        'commuter_rail_lines_layer',
        'commuter_rail_stations_layer',
      ],
    });


    // register hover handler with context
    registerHoverHandler('commuter_rail_stations_layer', (e, featureId, isEntering) => {
      if (!mapRef.current || !featureId) {
        return;
      }
      const map = mapRef.current.getMap();
      
      if (isEntering) {
        // Set popup
        const [lng, lat] = e.lngLat.toArray();
        const stationName = e.features?.[0].properties?.STATION;
        setPopup({ lng, lat, content: <CommuterRailPopup stationName={stationName} /> , source: 'hover'});
        // Set hover
        map.setFeatureState({ source: 'commuter_rail_stations_source', id: featureId }, { hover: true });
        map.getCanvas().style.cursor = 'pointer';
      } else {
        // Clear popup
        setPopup(undefined);
        // Clear hover
        map.setFeatureState({ source: 'commuter_rail_stations_source', id: featureId }, { hover: false });
        map.getCanvas().style.cursor = 'grab';
      }
    });
  }, []);

  return (
    <>
      <Source id="commuter_rail_lines_source" type="geojson" data={lines}>
        <Layer
          id="commuter_rail_lines_layer"
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            'line-color': '#B3439E',
          }}
        />
      </Source>

      <Source id="commuter_rail_stations_source" type="geojson" data={stations}>
        <Layer
          id="commuter_rail_stations_layer"
          type="circle"
          layout={{ visibility }}
          paint={{
            'circle-radius': ifHovered(5, 3),
            'circle-color': '#B3439E',
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
      </Source>
    </>
  );
}
