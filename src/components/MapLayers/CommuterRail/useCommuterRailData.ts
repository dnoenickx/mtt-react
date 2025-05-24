import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection, Point, LineString } from 'geojson';

interface CommuterRailData {
  stations: FeatureCollection<Point>;
  lines: FeatureCollection<LineString>;
}

export const useCommuterRailData = (enabled: boolean) => {
  return useQuery<CommuterRailData>({
    queryKey: ['commuterRailData'],
    queryFn: async () => {
      const response = await fetch('/commuter-rail.json');
      if (!response.ok) {
        throw new Error(
          `Failed to fetch commuter rail data: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    },
    enabled,
  });
};
