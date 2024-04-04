import { Layer, Source } from 'react-map-gl';
import { lines, stations } from './CommuterRail';


export interface CommuterRailProps {
  visible: boolean;
}

export default function CommuterRailLayer({ visible }: CommuterRailProps) {

  const visibility = visible ? 'visible' : 'none';

  return (
    <>
      {/*
      // @ts-ignore */}
      <Source type="geojson" data={lines}>
        <Layer
          type={'line'}
          layout={{ visibility }}
          paint={{
            'line-width': 1.5,
            'line-color': '#B3439E',
          }}
        />
      </Source>
      {/*
      // @ts-ignore */}
      <Source type="geojson" data={stations}>
        <Layer
          type={'circle'}
          layout={{ visibility }}
          paint={{
            'circle-radius': 2.75,
            'circle-color': '#B3439E',
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 0.5,
          }}
        />
      </Source>
    </>
  );
}
