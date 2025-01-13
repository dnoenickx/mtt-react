import { MultiLineString } from '@turf/turf';

const isPosition = (value: any): value is [number, number] =>
  Array.isArray(value) && value.length === 2 && value.every((v) => typeof v === 'number');

export const validateMultiLineString = (value: string): string | null => {
  let parsedValue: any;

  // Parse the JSON string
  try {
    parsedValue = JSON.parse(value);
  } catch (error) {
    return 'Invalid geometry: must be a JSON object';
  }

  // Recursive validation function
  const validateParsedGeometry = (geometry: any): string | null => {
    if (!geometry || typeof geometry !== 'object') {
      return 'Invalid geometry: must be a JSON object';
    }

    // FeatureCollection
    if (geometry.type === 'FeatureCollection') {
      if (
        !Array.isArray(geometry.features) ||
        !geometry.features.every(
          (feature: any) =>
            feature.type === 'Feature' && validateParsedGeometry(feature.geometry) === null
        )
      ) {
        return 'Invalid FeatureCollection';
      }
      return null;
    }

    // Feature
    if (geometry.type === 'Feature') {
      if (!geometry.geometry || validateParsedGeometry(geometry.geometry) !== null) {
        return 'Invalid Feature';
      }
      return null;
    }

    // LineString
    if (geometry.type === 'LineString') {
      if (
        !Array.isArray(geometry.coordinates) ||
        !geometry.coordinates.every((point: any) => isPosition(point))
      ) {
        return 'Invalid LineString';
      }
      return null;
    }

    // MultiLineString
    if (geometry.type === 'MultiLineString') {
      if (
        !Array.isArray(geometry.coordinates) ||
        !geometry.coordinates.every(
          (line: any) => Array.isArray(line) && line.every((point: any) => isPosition(point))
        )
      ) {
        return 'Invalid MultiLineString';
      }
      return null;
    }

    // Position[]
    if (Array.isArray(geometry) && geometry.every((point: any) => isPosition(point))) {
      return null;
    }

    // Position[][]
    if (
      Array.isArray(geometry) &&
      geometry.every(
        (line: any) => Array.isArray(line) && line.every((point: any) => isPosition(point))
      )
    ) {
      return null;
    }

    return 'Invalid geometry: must be a JSON object';
  };

  // Validate the parsed value
  return validateParsedGeometry(parsedValue);
};

export const cleanToMultiLineString = (geometry: any): MultiLineString => {
  if (!geometry || typeof geometry !== 'object') {
    return {
      type: 'MultiLineString',
      coordinates: [],
    };
  }

  // FeatureCollection
  if (geometry.type === 'FeatureCollection') {
    const features = geometry.features.map((feature: any) =>
      cleanToMultiLineString(feature.geometry)
    );
    return {
      type: 'MultiLineString',
      coordinates: features.flatMap((feature: MultiLineString) => feature.coordinates),
    };
  }

  // Feature
  if (geometry.type === 'Feature') {
    return cleanToMultiLineString(geometry.geometry);
  }

  // LineString
  if (geometry.type === 'LineString') {
    return {
      type: 'MultiLineString',
      coordinates: [geometry.coordinates],
    };
  }

  // MultiLineString
  if (geometry.type === 'MultiLineString') {
    return {
      type: 'MultiLineString',
      coordinates: geometry.coordinates,
    };
  }

  // Position[]
  if (Array.isArray(geometry) && geometry.every((point: any) => isPosition(point))) {
    return {
      type: 'MultiLineString',
      coordinates: [geometry],
    };
  }

  // Position[][]
  if (
    Array.isArray(geometry) &&
    geometry.every(
      (line: any) => Array.isArray(line) && line.every((point: any) => isPosition(point))
    )
  ) {
    return {
      type: 'MultiLineString',
      coordinates: geometry,
    };
  }

  return {
    type: 'MultiLineString',
    coordinates: [],
  };
};

export const toGeoJsonIO = (multiLineString: MultiLineString): string => {
  const featureCollection = {
    type: 'FeatureCollection',
    features: multiLineString.coordinates.map((lineCoordinates: any) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: lineCoordinates,
      },
    })),
  };

  return `http://geojson.io/#data=data:application/json,${encodeURIComponent(
    JSON.stringify(featureCollection)
  )}`;
};
