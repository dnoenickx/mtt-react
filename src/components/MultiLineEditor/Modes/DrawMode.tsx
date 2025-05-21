import { useState, useEffect, useRef } from 'react';
import { MapLayerMouseEvent, Source, Layer } from 'react-map-gl/maplibre';
import { useHotkeys } from '@mantine/hooks';
import { Position, lineString, featureCollection, point } from '@turf/turf';

import { generateUniqueId, getMousePoint } from '../utils/utils';
import { GeometryEditorState, ModeHook } from '../types';
import { updateHover } from '@/mapUtils';

export function useDrawMode({ mapRef, mode, setLines, setMode }: GeometryEditorState): ModeHook {
  const [coordinates, setCoordinates] = useState<Position[]>([]);
  const [mouseLocation, setMouseLocation] = useState<Position>();
  const hoveredVertexId = useRef<number>();

  // Reset state when leaving draw mode
  useEffect(() => {
    if (mode !== 'draw') {
      setCoordinates([]);
      setMouseLocation(undefined);
      hoveredVertexId.current = undefined;
    }
  }, [mode]);

  const drawnLine = coordinates.length >= 2 ? lineString(coordinates) : undefined;

  const [lastPoint] = coordinates.slice(-1);
  const previewLine =
    lastPoint && mouseLocation
      ? featureCollection([lineString([lastPoint, mouseLocation])])
      : featureCollection([]);

  const finishLine = () => {
    if (!drawnLine) return;
    setLines((prev) => [...prev, { ...drawnLine, id: generateUniqueId() }]);
    setCoordinates([]);
  };

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = 'crosshair';
  }, [mapRef.current]);

  // TODO: parent modal is preventing escape key from reaching this useHotkeys
  useHotkeys([
    ['esc', () => setMode('select')],
    ['mod+z', () => setCoordinates((prev) => (prev.length > 0 ? prev.slice(0, -1) : []))],
    ['Enter', finishLine],
  ]);

  const handleClick = (e: MapLayerMouseEvent) => {
    if (!mapRef.current) return;

    // Stop drawing if last point clicked
    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['draw-line-vertices-layer'],
    });
    if (features.length > 0) {
      const clickedId = Number(features[0].id);
      if (clickedId === coordinates.length - 1) {
        finishLine();
        return;
      }
    }

    // Otherwise add point
    setCoordinates((prev) => [...prev, getMousePoint(e)]);
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    setMouseLocation(getMousePoint(e));
    updateHover({
      mapRef,
      e,
      source: 'draw-line-vertices-source',
      layers: ['draw-line-vertices-layer'],
      hoveredId: hoveredVertexId,
      defaultCursor: 'crosshair',
    });
  };

  return {
    handleClick,
    handleMouseMove,
    handleContextMenu: finishLine,
    render: () => (
      <div key="draw">
        {/* Drawn line layer */}
        <Source
          id="drawn-line-source"
          type="geojson"
          data={featureCollection(drawnLine ? [drawnLine] : [])}
        >
          <Layer
            id="drawn-line-layer"
            type="line"
            paint={{
              'line-color': '#ffaa00',
              'line-width': 5,
              'line-opacity': 0.8,
            }}
          />
        </Source>

        {/* Preview line layer */}
        <Source id="draw-line-preview-source" type="geojson" data={previewLine}>
          <Layer
            id="preview-line-layer"
            type="line"
            paint={{
              'line-color': '#ffaa00',
              'line-width': 5,
              'line-opacity': 0.8,
              'line-dasharray': [3, 3],
            }}
          />
        </Source>

        {/* Vertex layer */}
        <Source
          id="draw-line-vertices-source"
          type="geojson"
          data={featureCollection(
            lastPoint ? [{ ...point(lastPoint), id: coordinates.length - 1 }] : []
          )}
        >
          <Layer
            id="draw-line-vertices-layer"
            type="circle"
            paint={{
              'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 7, 5],
              'circle-color': '#ff6600',
              'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 2],
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>
      </div>
    ),
  };
}
