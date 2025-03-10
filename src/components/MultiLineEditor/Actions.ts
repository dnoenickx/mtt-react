import { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import { MapRef } from 'react-map-gl/maplibre';
import toGeoJSON from '@mapbox/togeojson';
import {
  bbox,
  Feature,
  FeatureCollection,
  LineString,
  simplify,
  featureCollection,
  destination,
  centroid,
} from '@turf/turf';
import { combineLines } from './utils/combineLineUtil';
import { GeometryEditorState } from './types';
import { convertToLines } from './utils/utils';

export function handleCopySelectedLines({ lines, selectedLineIds }: GeometryEditorState) {
  if (selectedLineIds.length === 0) return;

  // Create a GeoJSON feature collection with the selected lines
  const selectedFeatures = lines.filter((line) => selectedLineIds.includes(line.id as number));
  const copyData: FeatureCollection = {
    type: 'FeatureCollection',
    features: selectedFeatures,
  };

  // Convert to JSON string and copy to clipboard
  const jsonStr = JSON.stringify(copyData, null, 2);
  navigator.clipboard.writeText(jsonStr).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to copy to clipboard:', err);
  });
}

export function handlePasteLines({ setLines }: GeometryEditorState) {
  navigator.clipboard
    .readText()
    .then((text) => {
      try {
        const pastedData = JSON.parse(text) as FeatureCollection;
        const newLines = convertToLines(pastedData);

        if (newLines.length > 0) {
          setLines((prev) => [...prev, ...newLines]);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse clipboard data as GeoJSON:', err);
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to read from clipboard:', err);
    });
}

export function handleDeleteSelectedLines({
  setLines,
  selectedLineIds,
  setSelectedLineIds,
}: GeometryEditorState) {
  setLines((prev) => prev.filter((line) => !selectedLineIds.includes(line.id as number)));
  setSelectedLineIds([]);
}

export function handleCombineLines({
  lines,
  setLines,
  selectedLineIds,
  setSelectedLineIds,
}: GeometryEditorState) {
  const selectedLines = lines.filter((line) => selectedLineIds.includes(Number(line.id)));

  const combinedLine = combineLines(selectedLines);
  if (!combinedLine) return;

  setLines((prev) => {
    const remainingLines = prev.filter((line) => !selectedLineIds.includes(line.id as number));
    return [...remainingLines, combinedLine];
  });
  setSelectedLineIds([combinedLine.id as number]);
}

const parseGeoJson = (content: string) => convertToLines(JSON.parse(content) as FeatureCollection);

const parseXml = (content: string, fileType: 'gpx' | 'kml') => {
  const xmlDoc = new DOMParser().parseFromString(content, 'text/xml');
  const convertedGeoJson = fileType === 'gpx' ? toGeoJSON.gpx(xmlDoc) : toGeoJSON.kml(xmlDoc);
  return convertToLines(convertedGeoJson as FeatureCollection);
};

export function handleFileUpload(
  event: ChangeEvent<HTMLInputElement>,
  setLines: Dispatch<SetStateAction<Feature<LineString>[]>>,
  fileInputRef: RefObject<HTMLInputElement>,
  mapRef: RefObject<MapRef>
) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target?.result as string;

    try {
      // Determine file type by extension
      const fileType = file.name.split('.').pop()?.toLowerCase();

      const lineStringFeatures: Feature<LineString>[] =
        fileType === 'json' || fileType === 'geojson'
          ? parseGeoJson(content)
          : fileType === 'gpx' || fileType === 'kml'
            ? parseXml(content, fileType)
            : [];

      const zoomToFeatures = (features: Feature[]) => {
        if (mapRef.current) {
          const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection(features));
          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            {
              padding: { top: 20, bottom: 20, right: 94, left: 20 },
              duration: 1000,
            }
          );
        }
      };

      // Add the new lines to the existing ones
      if (lineStringFeatures.length > 0) {
        setLines((prev) => {
          const newVal = [...prev, ...lineStringFeatures];
          zoomToFeatures(newVal);
          return newVal;
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing file:', error);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  reader.readAsText(file);
}

export function handleSimplifyLine({ lines, setLines, selectedLineIds }: GeometryEditorState) {
  const selectedLines = lines.filter((line) => selectedLineIds.includes(Number(line.id)));

  const fc = featureCollection(selectedLines);
  const referencePoint = centroid(fc);

  const destPoint = destination(referencePoint, 10, 0, { units: 'feet' });
  const latDiff = destPoint.geometry.coordinates[1] - referencePoint.geometry.coordinates[1];

  const simplified = simplify(fc, {
    tolerance: latDiff,
    highQuality: true,
    mutate: true,
  });

  setLines([
    ...lines.filter((line) => !selectedLineIds.includes(Number(line.id))),
    ...simplified.features,
  ]);
}
