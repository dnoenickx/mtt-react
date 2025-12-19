import React, { useEffect } from 'react';
import { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { ifHovered } from '../../../mapUtils';
import { useLayerManager } from '@/pages/TrailMap/context/LayerManagerContext';
import { DistrictPopup } from './DistrictPopup';
import { DistrictType, useDistrictsData } from './useDistrictsData';

interface DistrictsLayerProps {
  mapRef: React.RefObject<MapRef>;
  districtType: DistrictType;
}

export function DistrictsLayer({ mapRef, districtType }: DistrictsLayerProps) {
  const { isLayerVisible, registerToggle, registerClickHandler, registerHoverHandler, setPopup } =
    useLayerManager();
  const visible = isLayerVisible(`${districtType}Districts`);
  const visibility = visible ? 'visible' : 'none';

  const { data } = useDistrictsData(visible, districtType);

  useEffect(() => {
    // register toggle with context
    registerToggle({
      id: `${districtType}Districts`,
      label: `${districtType.charAt(0).toUpperCase() + districtType.slice(1)} Districts`,
      visible,
      layerIds: [`${districtType}_districts_outline`, `${districtType}_districts_fill`],
    });

    // register hover handler with context
    registerHoverHandler(`${districtType}_districts_fill`, (e, featureId, isEntering) => {
      if (!mapRef.current || !featureId) {
        return;
      }
      const map = mapRef.current.getMap();

      if (isEntering) {
        map.setFeatureState(
          { source: `${districtType}_districts_source`, id: featureId },
          { hover: true }
        );
        map.getCanvas().style.cursor = 'pointer';

        const feature = e.features?.[0];
        if (!feature) return;
        const { SENATOR, SEN_DIST, REP, REP_DIST, URL } = feature.properties;

        const [lng, lat] = e.lngLat.toArray();

        setPopup({
          lng,
          lat,
          content: (
            <DistrictPopup
              name={districtType === 'senate' ? SENATOR : REP}
              district={districtType === 'senate' ? SEN_DIST : REP_DIST}
              url={URL}
            />
          ),
          anchor: 'bottom',
          source: 'click',
        });
      } else {
        map.setFeatureState(
          { source: `${districtType}_districts_source`, id: featureId },
          { hover: false }
        );
        map.getCanvas().style.cursor = 'grab';
        setPopup(undefined);
      }
    });
  }, []);

  if (!data) return null;
  // Basic style, can be customized
  return (
    <Source id={`${districtType}_districts_source`} type="geojson" data={data}>
      <Layer
        id={`${districtType}_districts_outline`}
        type="line"
        layout={{ visibility }}
        paint={{
          'line-color': '#AAA',
          'line-width': 1.5,
        }}
      />
      <Layer
        id={`${districtType}_districts_fill`}
        type="fill"
        layout={{ visibility }}
        paint={{
          'fill-color': ifHovered(
            districtType === 'senate' ? '#2A68CA33' : '#F5403B33',
            '#AAAAAA00'
          ),
        }}
      />
    </Source>
  );
}
