import { Layer, Source } from 'react-map-gl';
import { lines, stations } from './Subway';

export interface SubwayProps {
  visible: boolean;
}

const colorMatch: mapboxgl.Expression = [
  'match',
  ['get', 'LINE'],
  'RED',
  '#F5403B',
  'GREEN',
  '#2C975F',
  'ORANGE',
  '#F79517',
  'BLUE',
  '#2A68CA',
  /* other */ '#ccc',
];

export default function Subway({ visible }: SubwayProps) {
  const visibility = visible ? 'visible' : 'none';

  return (
    <>
      {/*
      // @ts-ignore */}
      <Source type="geojson" data={lines}>
        <Layer
          type="line"
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            'line-color': colorMatch,
          }}
        />
      </Source>
      {/*
      // @ts-ignore */}
      <Source type="geojson" data={stations}>
        <Layer
          type="circle"
          layout={{ visibility }}
          paint={{
            'circle-radius': 2.75,
            'circle-color': colorMatch,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
      </Source>
    </>
  );
}
