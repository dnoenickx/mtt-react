/// <reference types="geojson" />

declare module '@mapbox/togeojson' {
  import {
    FeatureCollection,
    Feature,
    Geometry,
    GeometryCollection,
    Point,
    LineString,
    Polygon,
    MultiLineString,
  } from 'geojson';

  // Main export object
  const toGeoJSON: {
    /**
     * Converts KML to GeoJSON
     * @param doc - XML DOM Document containing KML
     * @returns GeoJSON FeatureCollection
     */
    kml: (doc: Document) => FeatureCollection;

    /**
     * Converts GPX to GeoJSON
     * @param doc - XML DOM Document containing GPX
     * @returns GeoJSON FeatureCollection
     */
    gpx: (doc: Document) => FeatureCollection;
  };

  // Export extended Feature interface to include additional properties
  // that toGeoJSON might add to standard GeoJSON
  interface ToGeoJSONFeature extends Feature {
    properties: {
      name?: string;
      description?: string;
      address?: string;
      styleUrl?: string;
      styleHash?: string;
      styleMapHash?: string;
      stroke?: string;
      'stroke-opacity'?: number;
      'stroke-width'?: number;
      fill?: string;
      'fill-opacity'?: number;
      visibility?: string;
      icon?: string;
      cmt?: string;
      desc?: string;
      type?: string;
      time?: string;
      keywords?: string;
      timespan?: {
        begin: string;
        end: string;
      };
      timestamp?: string;
      coordTimes?: string[] | string[][];
      heartRates?: number[] | number[][];
      links?: {
        href: string;
        text?: string;
        type?: string;
      }[];
      [key: string]: any;
    };
  }

  // Extend FeatureCollection to use our extended Feature
  interface ToGeoJSONFeatureCollection extends Omit<FeatureCollection, 'features'> {
    features: ToGeoJSONFeature[];
  }

  export = toGeoJSON;
}
