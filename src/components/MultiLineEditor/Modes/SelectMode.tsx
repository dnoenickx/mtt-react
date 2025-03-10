import { useEffect, useMemo, useRef } from 'react';
import { useHotkeys } from '@mantine/hooks';
import { featureCollection, midpoint, point, Position } from '@turf/turf';
import { MapLayerMouseEvent, Source, Layer } from 'react-map-gl/maplibre';

import { GeometryEditorState, ModeHook } from '../types';
import { ifHovered, updateHover } from '@/mapUtils';
import { handleDeleteSelectedLines } from '../Actions';

export function useSelectMode(props: GeometryEditorState): ModeHook {
  const { mapRef, mode, lines, setLines, selectedLineIds, setSelectedLineIds } = props;
  const hoveredLineId = useRef<number>();
  const hoveredGrabPointId = useRef<number>();
  const grabbedPointInfo = useRef<{
    index: number;
    lineId: number;
  }>();

  useHotkeys([
    ['Backspace', () => handleDeleteSelectedLines(props)],
    ['mod+a', () => setSelectedLineIds(lines.map((line) => line.id as number))],
  ]);

  // Reset state when leaving draw mode
  useEffect(() => {
    if (mode !== 'select') {
      setSelectedLineIds([]);
      hoveredLineId.current = undefined;
      hoveredGrabPointId.current = undefined;
      grabbedPointInfo.current = undefined;
    }
  }, [mode]);

  const grabPoints = useMemo(() => {
    if (selectedLineIds.length !== 1) return featureCollection([]);

    const line = lines.find(({ id }) => id === selectedLineIds[0]);
    if (!line) return featureCollection([]);

    const { coordinates } = line.geometry;
    const points = coordinates.flatMap((coord, index) => {
      const vertice = point(coord, {
        originalIndex: index,
        pointType: 'vertex',
      });

      if (index === 0) return [vertice];

      const mid = midpoint(coordinates[index - 1], coord);
      mid.properties = {
        ...(mid.properties || {}),
        beforeIndex: index - 1,
        afterIndex: index,
        pointType: 'midpoint',
      };

      return [vertice, mid];
    });

    points.forEach((pt, index) => {
      pt.id = index;
    });

    return featureCollection(points);
  }, [selectedLineIds, lines]);

  const modifyVertex = (
    lineId: number,
    vertexIndex: number,
    operation: 'update' | 'insert' | 'delete',
    newPosition?: Position
  ) => {
    setLines((prevLines) => {
      const selectedLine = prevLines.find((line) => line.id === lineId);
      if (!selectedLine) return prevLines;

      const newCoordinates = [...selectedLine.geometry.coordinates];

      switch (operation) {
        case 'update':
          if (!newPosition) return prevLines;
          newCoordinates[vertexIndex] = newPosition;
          break;
        case 'insert':
          if (!newPosition) return prevLines;
          newCoordinates.splice(vertexIndex, 0, newPosition);
          break;
        case 'delete':
          // Don't allow deleting if it would result in less than 2 points
          if (newCoordinates.length <= 2) return prevLines;
          newCoordinates.splice(vertexIndex, 1);
          break;
      }

      const updatedLine = {
        ...selectedLine,
        geometry: {
          ...selectedLine.geometry,
          coordinates: newCoordinates,
        },
      };

      return prevLines.map((line) => (line.id === lineId ? updatedLine : line));
    });
  };

  const handleClick = (e: MapLayerMouseEvent) => {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['lines-hitbox-layer'],
    });

    if (features.length > 0) {
      const clickedId = Number(features[0].id);

      if (e.originalEvent.shiftKey) {
        // Toggle selection
        if (selectedLineIds.includes(clickedId)) {
          setSelectedLineIds(selectedLineIds.filter((id) => id !== clickedId));
        } else {
          setSelectedLineIds([...selectedLineIds, clickedId]);
        }
      } else {
        // Single select
        setSelectedLineIds([clickedId]);
      }
    } else {
      // Clicked empty space - clear selection
      setSelectedLineIds([]);
    }
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    if (!mapRef.current) return;

    // Update line if dragging a point
    if (grabbedPointInfo.current !== undefined) {
      const { index, lineId } = grabbedPointInfo.current;
      const newPoint: Position = [e.lngLat.lng, e.lngLat.lat];

      modifyVertex(lineId, index, 'update', newPoint);
      mapRef.current.getCanvas().style.cursor = 'grabbing';
    }

    updateHover({
      mapRef,
      e,
      source: 'select-line-points-source',
      layers: ['selected-line-vertices-layer', 'selected-line-midpoints-layer'],
      hoveredId: hoveredGrabPointId,
      hoverCursor: 'move',
    });

    updateHover({
      mapRef,
      e,
      source: 'lines-source',
      layers: ['lines-hitbox-layer'],
      hoveredId: hoveredLineId,
    });
  };

  const handleMouseDown = (e: MapLayerMouseEvent) => {
    if (hoveredGrabPointId.current !== undefined && selectedLineIds.length === 1) {
      const grabId = hoveredGrabPointId.current;
      const lineId = selectedLineIds[0];

      const grabbedPoint = grabPoints.features.find((feature) => feature.id === grabId);
      if (!grabbedPoint) return;

      const pointType = grabbedPoint.properties?.pointType;

      // Handle right-click to delete vertex
      if (e.originalEvent.button === 2 && pointType === 'vertex') {
        e.preventDefault();
        const index = grabbedPoint.properties?.originalIndex;
        modifyVertex(lineId, index, 'delete');
        return;
      }

      if (pointType === 'midpoint') {
        // If midpoint, insert new point
        const index = grabbedPoint.properties?.afterIndex as number;
        const newPoint: Position = [e.lngLat.lng, e.lngLat.lat];

        modifyVertex(lineId, index, 'insert', newPoint);
        grabbedPointInfo.current = { index, lineId };
      } else if (pointType === 'vertex') {
        grabbedPointInfo.current = {
          index: grabbedPoint.properties?.originalIndex,
          lineId,
        };
      }

      e.preventDefault();
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = 'grabbing';
      }
    }
  };

  return {
    handleClick,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp: () => {
      grabbedPointInfo.current = undefined;
    },
    render: () => (
      <div key="select">
        {/* Selected lines layer */}
        <Source
          id="selected-lines-source"
          type="geojson"
          data={featureCollection(
            lines.filter((line) => selectedLineIds.includes(line.id as number))
          )}
        >
          <Layer
            id="selected-lines-layer"
            type="line"
            paint={{
              'line-color': '#ffaa00',
              'line-width': 5,
              'line-opacity': 0.8,
            }}
          />
        </Source>

        {/* Vertices layer */}
        <Source id="select-line-points-source" type="geojson" data={grabPoints}>
          <Layer
            id="selected-line-midpoints-layer"
            type="circle"
            filter={['==', ['get', 'pointType'], 'midpoint']}
            paint={{
              'circle-radius': ifHovered(4, 3),
              'circle-color': '#888',
              'circle-stroke-width': ifHovered(2, 1),
              'circle-stroke-color': '#ffffff',
            }}
          />

          <Layer
            id="selected-line-vertices-layer"
            type="circle"
            filter={['==', ['get', 'pointType'], 'vertex']}
            paint={{
              'circle-radius': ifHovered(5, 4),
              'circle-color': '#ff6600',
              'circle-stroke-width': ifHovered(2.5, 2),
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>
      </div>
    ),
  };
}
