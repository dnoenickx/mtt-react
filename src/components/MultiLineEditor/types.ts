import { Dispatch, RefObject, SetStateAction } from 'react';
import { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import { Feature, LineString } from 'geojson';

export type EditorMode = 'select' | 'split' | 'draw';

export type GeometryEditorState = {
  mapRef: RefObject<MapRef>;
  mode: EditorMode;
  setMode: Dispatch<SetStateAction<EditorMode>>;
  lines: Feature<LineString>[];
  setLines: Dispatch<SetStateAction<Feature<LineString>[]>>;
  selectedLineIds: number[];
  setSelectedLineIds: Dispatch<SetStateAction<number[]>>;
};

export type ModeHook = {
  handleClick?: (e: MapLayerMouseEvent) => void;
  handleMouseMove?: (e: MapLayerMouseEvent) => void;
  handleMouseDown?: (e: MapLayerMouseEvent) => void;
  handleMouseUp?: (e: MapLayerMouseEvent) => void;
  handleContextMenu?: (e: MapLayerMouseEvent) => void;
  render: () => JSX.Element;
};
