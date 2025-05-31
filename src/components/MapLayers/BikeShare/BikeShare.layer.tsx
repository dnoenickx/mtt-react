import React from 'react';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { featureCollection } from '@turf/turf';
import { useBikeShareData } from './useBikeShareData';
import { useLayerVisibility } from '@/pages/TrailMap/context/LayerVisibilityContext';

export const BIKE_SHARE_SOURCE_ID = 'bike_share_source';
export const BIKE_SHARE_INTERACTIVE_LAYER_ID = 'bike_share_interactive_layer';


export const BIKE_SHARE_LAYER_TO_SOURCE = {
  [BIKE_SHARE_INTERACTIVE_LAYER_ID]: BIKE_SHARE_SOURCE_ID,
};

interface BikeShareLayerProps {
  mapRef: React.RefObject<MapRef>;
}

export function BikeShareLayer({ mapRef }: BikeShareLayerProps) {
  const { isLayerVisible } = useLayerVisibility();
  const visible = isLayerVisible('bikeShare');
  const visibility = visible ? 'visible' : 'none';

  const { data, dataUpdatedAt } = useBikeShareData(visible);
  const stations = data ?? featureCollection([]);

  return (
    <Source id={BIKE_SHARE_SOURCE_ID} type="geojson" data={stations}>
      <Layer
        id={BIKE_SHARE_INTERACTIVE_LAYER_ID}
        type="circle"
        layout={{ visibility }}
        paint={{
          'circle-radius': 5,
          'circle-color': '#4A90E2',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.8,
        }}
      />
    </Source>
  );
}
