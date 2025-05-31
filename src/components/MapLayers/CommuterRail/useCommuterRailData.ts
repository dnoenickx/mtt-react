import { useQuery } from '@tanstack/react-query';
import { FeatureCollection, Point, LineString } from 'geojson';

interface CommuterRailData {
  stations: FeatureCollection<Point>;
  lines: FeatureCollection<LineString>;
}

export const useCommuterRailData = (enabled: boolean) =>
  useQuery<CommuterRailData>({
    queryKey: ['commuterRailData'],
    queryFn: async () => {
      const response = await fetch('/commuter-rail.json');
      if (!response.ok) {
        throw new Error(
          `Failed to fetch commuter rail data: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      data.stations.features = data.stations.features.map((feature: any, index: number) => ({
        ...feature,
        id: index,
      }));
      return data;
    },
    enabled,
  });
