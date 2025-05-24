import { useQuery } from '@tanstack/react-query';
import type { FeatureCollection, Point, LineString } from 'geojson';

interface SubwayData {
  stations: FeatureCollection<Point>;
  lines: FeatureCollection<LineString>;
}

export const useSubwayData = (enabled: boolean) => {
  return useQuery<SubwayData>({
    queryKey: ['subwayData'],
    queryFn: async () => {
      const response = await fetch('/subway.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch subway data: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled,
  });
};
