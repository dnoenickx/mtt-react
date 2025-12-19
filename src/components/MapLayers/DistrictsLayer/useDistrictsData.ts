import { useQuery } from '@tanstack/react-query';

export type DistrictType = 'senate' | 'house';

const urlMap: Record<DistrictType, string> = {
  senate: '/senate_districts_2021.geojson',
  house: '/house_districts_2021.geojson',
};

export function useDistrictsData(enabled: boolean, type: DistrictType) {
  return useQuery({
    queryKey: ['districts', type],
    enabled: enabled,
    queryFn: async () => {
      const res = await fetch(urlMap[type]);
      if (!res.ok) throw new Error('Failed to fetch districts');
      return res.json();
    },
  });
}
