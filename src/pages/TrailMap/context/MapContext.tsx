import { PositionAnchor } from 'maplibre-gl';
import React, { createContext, useContext, useState, RefObject, ReactElement } from 'react';
import { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';

export interface PopupData {
  lng: number;
  lat: number;
  content?: ReactElement;
  anchor?: PositionAnchor;
}

export interface LayerHook {
  handleClick?: (e: MapLayerMouseEvent) => void;
  handleMouseMove?: (e: MapLayerMouseEvent) => void;
  interactiveLayerIds?: string[];
  render: () => JSX.Element;
  visible?: boolean;
}

type LayerHookFn<T = {}> = (
  props: {
    mapRef: RefObject<MapRef>;
    visible?: boolean;
    setPopup?: (popup: PopupData | undefined) => void;
  } & T
) => LayerHook;

export interface LayerConfig<T = {}> {
  id: string;
  label: string;
  visible: boolean;
  canToggle: boolean;
  hook: LayerHookFn<T>;
  params?: T;
}

interface MapContextType {
  mapRef: RefObject<MapRef>;
  layers: LayerConfig[];
  toggleLayer: (id: string) => void;
  isLayerVisible: (id: string) => boolean;
  layerHooks: LayerHook[];
  interactiveLayerIds: string[];
  visibleLayers: LayerHook[];
  popup: PopupData | undefined;
  setPopup: (popup: PopupData | undefined) => void;
}

const MapContext = createContext<MapContextType | null>(null);

interface MapProviderProps {
  children: React.ReactNode;
  initialLayers: LayerConfig[];
  mapRef: RefObject<MapRef>;
}

export function MapProvider({ children, initialLayers, mapRef }: MapProviderProps) {
  const [layers, setLayers] = useState<LayerConfig[]>(initialLayers);
  const [popup, setPopup] = useState<PopupData | undefined>(undefined);

  const toggleLayer = (id: string) => {
    setLayers((currentLayers) =>
      currentLayers.map((layer) =>
        layer.id === id && layer.canToggle ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const isLayerVisible = (id: string) => {
    return layers.find((layer) => layer.id === id)?.visible ?? false;
  };

  const layerHooks = layers.map((layer) =>
    layer.hook({
      mapRef,
      visible: layer.visible,
      setPopup,
      ...layer.params,
    })
  );

  const visibleLayers = layerHooks.filter((layer) => layer.visible !== false);

  const interactiveLayerIds = visibleLayers
    .filter((layer) => layer.interactiveLayerIds)
    .flatMap((layer) => layer.interactiveLayerIds!);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        layers,
        toggleLayer,
        isLayerVisible,
        layerHooks,
        interactiveLayerIds,
        visibleLayers,
        popup,
        setPopup,
        }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
