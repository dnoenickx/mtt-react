import { PositionAnchor } from 'maplibre-gl';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  ReactElement,
} from 'react';
import { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';

interface LayerToggleInfo {
  id: string;
  label: string;
  visible: boolean;
  layerIds: string[];
}

interface PopupData {
  lng: number;
  lat: number;
  content?: ReactElement;
  anchor?: PositionAnchor;
  source?: 'click' | 'hover';
}

interface LayerHandlers {
  click: Record<string, (e: MapLayerMouseEvent) => void>;
  hover: Record<
    string,
    (e: MapLayerMouseEvent, featureId: string | number, isEntering: boolean) => void
  >;
}

interface LayerManagerContextType {
  mapRef: React.RefObject<MapRef>;
  layerToggles: Record<string, LayerToggleInfo>;
  toggleLayer: (id: string) => void;
  isLayerVisible: (id: string) => boolean;
  registerToggle: (layer: LayerToggleInfo) => void;
  registerClickHandler: (layerId: string, handler: (e: MapLayerMouseEvent) => void) => void;
  registerHoverHandler: (
    layerId: string,
    handler: (e: MapLayerMouseEvent, featureId: string | number, isEntering: boolean) => void
  ) => void;
  handleClick: (e: MapLayerMouseEvent) => void;
  handleMouseMove: (e: MapLayerMouseEvent) => void;
  popup: PopupData | undefined;
  setPopup: (popup: PopupData | undefined) => void;
  interactiveLayerIds: string[];
}

const LayerManagerContext = createContext<LayerManagerContextType | undefined>(undefined);

interface LayerManagerProviderProps {
  mapRef: React.RefObject<MapRef>;
  children: ReactNode;
}

export function LayerManagerProvider({ mapRef, children }: LayerManagerProviderProps) {
  const [popup, setPopup] = useState<PopupData | undefined>(undefined);
  const [layerToggles, setLayerToggles] = useState<Record<string, LayerToggleInfo>>({});
  const [handlers, setHandlers] = useState<LayerHandlers>({
    click: {},
    hover: {},
  });

  const [currentHover, setCurrentHover] = useState<{
    layerId: string;
    featureId: string | number;
  } | null>(null);

  const interactiveLayerIds = useMemo(
    () => Array.from(new Set([...Object.keys(handlers.click), ...Object.keys(handlers.hover)])),
    [handlers]
  );

  const toggleLayer = useCallback((id: string) => {
    setLayerToggles((prev) => ({
      ...prev,
      [id]: { ...prev[id], visible: !prev[id]?.visible },
    }));
  }, []);

  const isLayerVisible = useCallback(
    (id: string) => layerToggles[id]?.visible ?? false,
    [layerToggles]
  );

  const registerToggle = useCallback((layer: LayerToggleInfo) => {
    setLayerToggles((prev) => ({
      ...prev,
      [layer.id]: { ...prev[layer.id], ...layer },
    }));
  }, []);

  const registerHandler = useCallback(
    <K extends keyof LayerHandlers>(type: K, layerId: string, handler: any) => {
      setHandlers((prev) => ({
        ...prev,
        [type]: { ...prev[type], [layerId]: handler },
      }));
    },
    []
  );

  const registerClickHandler = useCallback(
    (layerId: string, handler: (e: MapLayerMouseEvent) => void) =>
      registerHandler('click', layerId, handler),
    [registerHandler]
  );

  const registerHoverHandler = useCallback(
    (
      layerId: string,
      handler: (e: MapLayerMouseEvent, fid: string | number, entering: boolean) => void
    ) => registerHandler('hover', layerId, handler),
    [registerHandler]
  );

  /**
   * Calls handler for topmost feature with a click handler.
   * Iterates through features from top to bottom until it finds one with a registered click handler.
   */
  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!e.features?.length) return;

      // Find the first feature that has a registered click handler
      const feature = e.features.find((f) => handlers.click[f.layer.id]);
      if (!feature) return;

      // Call the handler for the matching layer
      handlers.click[feature.layer.id](e);
    },
    [handlers.click]
  );

  /**
   * Manages hover states for interactive layers.
   * Tracks the currently hovered feature and updates hover states accordingly.
   */
  const handleMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];

      // If no feature is hovered, clear existing hover state
      if (!feature) {
        if (currentHover) {
          const { layerId, featureId } = currentHover;
          handlers.hover[layerId]?.(e, featureId, false);
          setCurrentHover(null);
        }
        return;
      }

      const featureId = feature.id as string | number;
      const isNewHover =
        !currentHover ||
        currentHover.layerId !== feature.layer.id ||
        currentHover.featureId !== featureId;

      // If hovered layer has a handler and it's different from the current hover
      if (handlers.hover[feature.layer.id] && isNewHover) {
        // Remove previous hover, if it exists
        if (currentHover) {
          handlers.hover[currentHover.layerId]?.(e, currentHover.featureId, false);
        }

        // Add new hover
        handlers.hover[feature.layer.id](e, featureId, true);
        setCurrentHover({ layerId: feature.layer.id, featureId });
      }
    },
    [currentHover, handlers.hover]
  );

  const contextValue = {
    mapRef,
    layerToggles,
    toggleLayer,
    isLayerVisible,
    registerToggle,
    registerClickHandler,
    registerHoverHandler,
    handleClick,
    handleMouseMove,
    popup,
    setPopup,
    interactiveLayerIds,
  };

  return (
    <LayerManagerContext.Provider value={contextValue}>{children}</LayerManagerContext.Provider>
  );
}

export const useLayerManager = () => {
  const context = useContext(LayerManagerContext);
  if (!context) {
    throw new Error('useLayerManager must be used within a LayerVisibilityProvider');
  }
  return context;
};
