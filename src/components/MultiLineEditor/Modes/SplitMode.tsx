import { useState } from 'react';
import { MapLayerMouseEvent, Source, Layer } from 'react-map-gl/maplibre';
import {
  featureCollection,
  nearestPointOnLine,
  LineString,
  Point,
  Feature,
  lineSplit,
} from '@turf/turf';
import { useHotkeys } from '@mantine/hooks';

import { GeometryEditorState, ModeHook } from '../types';
import { generateUniqueId } from '../utils/utils';

interface NearestPointOnLine extends Feature<Point> {
  properties: {
    index?: number;
    dist?: number;
    location?: number;
    [key: string]: any;
  };
}

export function useSplitMode({
  mapRef,
  setMode,
  lines,
  setLines,
  setSelectedLineIds,
}: GeometryEditorState): ModeHook {
  const [snappedPoint, setSnappedPoint] = useState<NearestPointOnLine | null>(null);

  useHotkeys([['esc', () => setMode('select')]]);

  const handleClick = () => {
    if (!snappedPoint) return;

    // Find the line
    const { lineId } = snappedPoint.properties;
    const lineToSplit = lines.find((line) => line.id === lineId);
    if (!lineToSplit) return;

    // Split the line
    const splitLines = lineSplit(lineToSplit, snappedPoint);
    const newLines = splitLines.features.map((segment) => ({
      ...segment,
      id: generateUniqueId(),
    }));

    // Replace the line with the new segments
    setLines((prev) => prev.filter((line) => line.id !== lineId).concat(newLines));

    // Reset and switch mode
    setSnappedPoint(null);
    setMode('select');
    setSelectedLineIds([newLines[0].id]);
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['lines-hitbox-layer'],
    });

    if (features.length > 0) {
      // Set snap point if hovering a line
      const { id, geometry } = features[0];
      const nearestPoint = nearestPointOnLine(geometry as LineString, [e.lngLat.lng, e.lngLat.lat]);
      nearestPoint.properties.lineId = id;

      setSnappedPoint(nearestPoint);
      mapRef.current.getCanvas().style.cursor = 'none';
    } else {
      // Clear snap point if not hovering a line
      setSnappedPoint(null);
      mapRef.current.getCanvas().style.cursor = 'grab';
    }
  };

  return {
    handleClick,
    handleMouseMove,
    handleMouseDown: undefined,
    handleMouseUp: undefined,
    render: () => (
      <div key="split">
        {/* Snapped point */}
        <Source
          id="snapped-point-source"
          type="geojson"
          data={snappedPoint ? featureCollection([snappedPoint]) : featureCollection([])}
        >
          <Layer
            id="snapped-point-layer"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#ff3300',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>
      </div>
    ),
  };
}
