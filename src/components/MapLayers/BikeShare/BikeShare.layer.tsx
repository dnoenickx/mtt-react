import React, { useEffect } from 'react';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { featureCollection } from '@turf/turf';
import { useBikeShareData } from './useBikeShareData';
import { useLayerVisibility } from '@/pages/TrailMap/context/LayerVisibilityContext';
import { BikeSharePopup } from './BikeSharePopup';
import { ifHovered } from '@/mapUtils';

interface BikeShareLayerProps {
  mapRef: React.RefObject<MapRef>;
}

export function BikeShareLayer({ mapRef }: BikeShareLayerProps) {
  const { isLayerVisible, registerToggle, registerClickHandler, registerHoverHandler, setPopup } =
    useLayerVisibility();
  const visible = isLayerVisible('bikeShare');
  const visibility = visible ? 'visible' : 'none';

  const { data } = useBikeShareData(visible);
  const stations = data ?? featureCollection([]);

  useEffect(() => {
    // register toggle with context
    registerToggle({
      id: 'bikeShare',
      label: 'Bike Share',
      visible,
      layerIds: ['bike_share_layer'],
    });

    // register click handler with context
    registerClickHandler('bike_share_layer', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const { name, num_bikes_available, num_ebikes_available, num_docks_available } =
        feature.properties;

      const [lng, lat] = e.lngLat.toArray();

      console.log('opening popup');
      setPopup({
        lng,
        lat,
        content: (
          <BikeSharePopup
            name={name}
            numBikesAvailable={num_bikes_available}
            numEBikesAvailable={num_ebikes_available}
            numDocksAvailable={num_docks_available}
          />
        ),
        anchor: 'bottom',
        source: 'click',
      });
    });

    // register hover handler with context
    registerHoverHandler('bike_share_layer', (e, featureId, isEntering) => {
      if (!mapRef.current || !featureId) {
        return;
      }
      const map = mapRef.current.getMap();

      if (isEntering) {
        map.setFeatureState({ source: 'bike_share_source', id: featureId }, { hover: true });
        map.getCanvas().style.cursor = 'pointer';
      } else {
        map.setFeatureState({ source: 'bike_share_source', id: featureId }, { hover: false });
        map.getCanvas().style.cursor = 'grab';
      }
    });
  }, []);

  return (
    <Source id="bike_share_source" type="geojson" data={stations}>
      <Layer
        id="bike_share_layer"
        type="circle"
        layout={{ visibility }}
        paint={{
          'circle-radius': ifHovered(8, 5),
          'circle-color': '#4A90E2',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.8,
        }}
      />
    </Source>
  );
}
