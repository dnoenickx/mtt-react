import { useQuery } from '@tanstack/react-query';
import { point, featureCollection } from '@turf/turf';

interface BikeStation {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
}

interface BikeStationStatus {
  station_id: string;
  num_bikes_available: number;
  num_ebikes_available: number;
  num_docks_available: number;
}

interface BikeStationResponse {
  data: {
    stations: BikeStation[];
  };
}

interface BikeStationStatusResponse {
  data: {
    stations: BikeStationStatus[];
  };
}

export const useBikeShareData = (enabled: boolean) => {
  // Fetch station information (static)
  const stationInfo = useQuery<BikeStationResponse>({
    queryKey: ['bikeStationInfo'],
    queryFn: async () => {
      const response = await fetch(
        'https://gbfs.lyft.com/gbfs/1.1/bos/en/station_information.json'
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch bike station info: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    },
    enabled,
    staleTime: Infinity, // Never becomes stale since this data is static
  });

  // Fetch station status (updates every minute)
  const stationStatus = useQuery<BikeStationStatusResponse>({
    queryKey: ['bikeStationStatus'],
    queryFn: async () => {
      const response = await fetch('https://gbfs.lyft.com/gbfs/1.1/bos/en/station_status.json');
      if (!response.ok) {
        throw new Error(
          `Failed to fetch bike station status: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    },
    enabled,
    refetchInterval: 60000, // Refetch every minute
  });

  // Merge station info and status into GeoJSON
  const stations = stationInfo.data?.data.stations.map((station, index) => {
    const status = stationStatus.data?.data.stations.find(
      (s) => s.station_id === station.station_id
    );

    return point(
      [station.lon, station.lat],
      {
        name: station.name,
        station_id: station.station_id,
        num_bikes_available: status?.num_bikes_available ?? 0,
        num_ebikes_available: status?.num_ebikes_available ?? 0,
        num_docks_available: status?.num_docks_available ?? 0,
      },
      {
        id: index,
      }
    );
  });

  return {
    data: stations ? featureCollection(stations) : featureCollection([]),
    dataUpdatedAt: stationStatus.dataUpdatedAt,
  };
};
