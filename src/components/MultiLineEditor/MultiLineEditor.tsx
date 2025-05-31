import { useRef, useState } from 'react';
import { useHotkeys } from '@mantine/hooks';
import { Box, Button, Flex, Group, Modal, useMantineColorScheme } from '@mantine/core';
import Map, { MapRef, Source, Layer } from 'react-map-gl/maplibre';
import { bbox, FeatureCollection, featureCollection, LineString } from '@turf/turf';

import { darkStyle, lightStyle } from '@/pages/TrailMap/MapStyle';
import { convertToLines } from './utils/utils';
import { EditorMode, GeometryEditorState } from './types';
import { useSelectMode } from './Modes/SelectMode';
import { useSplitMode } from './Modes/SplitMode';
import { useDrawMode } from './Modes/DrawMode';
import { EditorSidebar } from './EditorSidebar';
import { ifHovered } from '@/mapUtils';
import { DEFAULT_VIEW_STATE } from '@/constants';

interface MultiLineEditorProps {
  opened: boolean;
  onClose: (value: FeatureCollection<LineString> | undefined) => void;
  initialGeojson: FeatureCollection;
  id: number;
}

function MultiLineEditor({
  opened,
  onClose,
  initialGeojson = featureCollection([]),
  id,
}: MultiLineEditorProps) {
  const mapRef = useRef<MapRef>(null);
  const { colorScheme } = useMantineColorScheme();
  const mapStyle = colorScheme === 'dark' ? darkStyle : lightStyle;

  // Shared state
  const [mode, setMode] = useState<EditorMode>('select');
  const [lines, setLines] = useState(convertToLines(initialGeojson));
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);

  useHotkeys([
    ['s', () => setMode('select')],
    ['d', () => setMode('draw')],
    ['x', () => setMode('split')],
  ]);

  const lineFeatures = featureCollection(lines);
  const [minLng, minLat, maxLng, maxLat] = bbox(lineFeatures);

  const geometryEditorState: GeometryEditorState = {
    mapRef,
    mode,
    setMode,
    lines,
    setLines,
    selectedLineIds,
    setSelectedLineIds,
  };

  // Initialize modes with shared state
  const selectMode = useSelectMode(geometryEditorState);
  const drawMode = useDrawMode(geometryEditorState);
  const splitMode = useSplitMode(geometryEditorState);

  const modes = {
    select: selectMode,
    split: splitMode,
    draw: drawMode,
  };

  const currentMode = modes[mode];

  return (
    <Modal
      fullScreen
      closeOnEscape={false}
      opened={opened}
      onClose={() => onClose(featureCollection(lines))}
      withCloseButton={false}
    >
      <Flex h="90vh" w="100%" direction="column">
        <Group justify="flex-end" py="xs">
          <Group>
            <Button variant="outline" onClick={() => onClose(undefined)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onClose(featureCollection(lines));
              }}
            >
              Save
            </Button>
          </Group>
        </Group>

        <Box style={{ width: '100%', height: '100%', position: 'relative' }}>
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
            interactiveLayerIds={[
              'lines-layer',
              'selected-vertices-layer',
              'selected-midpoints-layer',
              'draw-line-vertices-layer',
            ]}
            onClick={currentMode.handleClick}
            onMouseMove={currentMode.handleMouseMove}
            onMouseDown={currentMode.handleMouseDown}
            onMouseUp={currentMode.handleMouseUp}
            onContextMenu={currentMode.handleContextMenu}
            style={{ width: '100%', height: '100%' }}
            initialViewState={
              lineFeatures.features.length > 0
                ? {
                    bounds: [
                      [minLng, minLat],
                      [maxLng, maxLat],
                    ],
                    fitBoundsOptions: {
                      padding: {
                        top: 20,
                        bottom: 20,
                        right: 94,
                        left: 20,
                      },
                    },
                  }
                : DEFAULT_VIEW_STATE
            }
          >
            {/* Base rendering of all lines */}
            <Source id="lines-source" type="geojson" data={lineFeatures}>
              <Layer
                id="lines-layer"
                type="line"
                paint={{
                  'line-color': ifHovered('#44aaff', '#0080ff'),
                  'line-width': ifHovered(5, 3),
                  'line-opacity': ifHovered(0.9, 1),
                }}
              />

              <Layer
                id="lines-hitbox-layer"
                type="line"
                paint={{
                  'line-color': 'rgba(0,0,0,0)',
                  'line-width': 18,
                  'line-opacity': 0,
                }}
              />
            </Source>

            {/* Mode-specific rendering */}
            {currentMode.render()}

            {/* {Object.values(modes).map((m) => m.render())} */}

            {/* {segmentsLayer.render()} */}

            <EditorSidebar
              {...geometryEditorState}
              reset={() => setLines(convertToLines(initialGeojson))}
            />
          </Map>
        </Box>
      </Flex>
    </Modal>
  );
}
export default MultiLineEditor;
