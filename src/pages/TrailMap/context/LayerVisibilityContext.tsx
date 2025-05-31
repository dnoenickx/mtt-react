import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MapRef } from 'react-map-gl/maplibre';

export interface LayerInfo {
  id: string;
  label: string;
  visible: boolean;
  layerIds: string[];
}

interface LayerVisibilityContextType {
  layers: Record<string, LayerInfo>;
  toggleLayer: (id: string) => void;
  isLayerVisible: (id: string) => boolean;
  setMapRef: (mapRef: React.RefObject<MapRef>) => void;
}

const LayerVisibilityContext = createContext<LayerVisibilityContextType | undefined>(undefined);

interface LayerVisibilityProviderProps {
  children: ReactNode;
}

export function LayerVisibilityProvider({ children }: LayerVisibilityProviderProps) {
  const [mapRef, setMapRefState] = useState<React.RefObject<MapRef> | null>(null);
  const [layers, setLayers] = useState<Record<string, LayerInfo>>({
    subway: {
      id: 'subway',
      label: 'Subway',
      visible: false,
      layerIds: ['subway_lines_layer', 'subway_stations_layer', 'subway_stations_hover_layer'],
    },
    commuterRail: {
      id: 'commuterRail',
      label: 'Commuter Rail',
      visible: false,
      layerIds: ['commuter_rail_lines_layer', 'commuter_rail_stations_layer', 'commuter_rail_stations_hover_layer'],
    },
    bikeShare: {
      id: 'bikeShare',
      label: 'Bluebikes',
      visible: false,
      layerIds: ['bike_share_layer'],
    },
  });

  const setMapRef = (ref: React.RefObject<MapRef>) => {
    setMapRefState(ref);
  };

  const toggleLayer = (id: string) => {
    setLayers((prev) => {
      if (!prev[id]) return prev;
      
      const newVisible = !prev[id].visible;
      
      // Update map layer visibility directly if map is available
      if (mapRef?.current) {
        const map = mapRef.current.getMap();
        const visibility = newVisible ? 'visible' : 'none';
        
        // Set visibility for all layer IDs associated with this layer
        prev[id].layerIds.forEach(layerId => {
          if (map && map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
          }
        });
      }
      
      return {
        ...prev,
        [id]: {
          ...prev[id],
          visible: newVisible,
        },
      };
    });
  };

  const isLayerVisible = (id: string) => {
    return layers[id]?.visible || false;
  };

  return (
    <LayerVisibilityContext.Provider value={{ layers, toggleLayer, isLayerVisible, setMapRef }}>
      {children}
    </LayerVisibilityContext.Provider>
  );
}

export function useLayerVisibility() {
  const context = useContext(LayerVisibilityContext);
  if (context === undefined) {
    throw new Error('useLayerVisibility must be used within a LayerVisibilityProvider');
  }
  return context;
}
