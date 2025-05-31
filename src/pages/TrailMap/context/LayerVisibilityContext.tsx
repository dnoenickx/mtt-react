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
  contextMenu: Record<string, (e: MapLayerMouseEvent) => void>;
}

interface LayerVisibilityContextType {
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
  registerContextMenuHandler: (layerId: string, handler: (e: MapLayerMouseEvent) => void) => void;
  handleClick: (e: MapLayerMouseEvent) => void;
  handleMouseMove: (e: MapLayerMouseEvent) => void;
  handleContextMenu: (e: MapLayerMouseEvent) => void;
  popup: PopupData | undefined;
  setPopup: (popup: PopupData | undefined) => void;
  interactiveLayerIds: string[];
}

const LayerVisibilityContext = createContext<LayerVisibilityContextType | undefined>(undefined);

interface LayerVisibilityProviderProps {
  mapRef: React.RefObject<MapRef>;
  children: ReactNode;
}

export function LayerVisibilityProvider({ mapRef, children }: LayerVisibilityProviderProps) {
  const [popup, setPopup] = useState<PopupData | undefined>(undefined);
  const [layerToggles, setLayerToggles] = useState<Record<string, LayerToggleInfo>>({});
  const [handlers, setHandlers] = useState<LayerHandlers>({
    click: {},
    hover: {},
    contextMenu: {},
  });

  const [currentHover, setCurrentHover] = useState<{
    layerId: string;
    featureId: string | number;
  } | null>(null);

  const interactiveLayerIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.keys(handlers.click),
          ...Object.keys(handlers.hover),
          ...Object.keys(handlers.contextMenu),
        ])
      ),
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

  const registerContextMenuHandler = useCallback(
    (layerId: string, handler: (e: MapLayerMouseEvent) => void) =>
      registerHandler('contextMenu', layerId, handler),
    [registerHandler]
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || !handlers.click[feature.layer.id]) return;
      handlers.click[feature.layer.id](e);
    },
    [handlers.click]
  );

  const handleMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];

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

      if (handlers.hover[feature.layer.id] && isNewHover) {
        if (currentHover) {
          handlers.hover[currentHover.layerId]?.(e, currentHover.featureId, false);
        }
        handlers.hover[feature.layer.id](e, featureId, true);
        setCurrentHover({ layerId: feature.layer.id, featureId });
      }
    },
    [currentHover, handlers.hover]
  );

  const handleContextMenu = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.find((f) => handlers.contextMenu[f.layer.id]);
      if (feature) {
        handlers.contextMenu[feature.layer.id](e);
      }
    },
    [handlers.contextMenu]
  );

  const contextValue = useMemo(
    () => ({
      mapRef,
      layerToggles,
      toggleLayer,
      isLayerVisible,
      registerToggle,
      registerClickHandler,
      registerHoverHandler,
      registerContextMenuHandler,
      handleClick,
      handleMouseMove,
      handleContextMenu,
      popup,
      setPopup,
      interactiveLayerIds,
    }),
    [
      mapRef,
      layerToggles,
      isLayerVisible,
      registerToggle,
      registerClickHandler,
      registerHoverHandler,
      registerContextMenuHandler,
      handleClick,
      handleMouseMove,
      handleContextMenu,
      popup,
      interactiveLayerIds,
    ]
  );

  return (
    <LayerVisibilityContext.Provider value={contextValue}>
      {children}
    </LayerVisibilityContext.Provider>
  );
}

export const useLayerVisibility = () => {
  const context = useContext(LayerVisibilityContext);
  if (!context) {
    throw new Error('useLayerVisibility must be used within a LayerVisibilityProvider');
  }
  return context;
};
