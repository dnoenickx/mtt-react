import React from 'react';
import {
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  Indicator,
  Select,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { SegmentStates } from '../../pages/TrailMap/TrailMap.config';
import classes from './WelcomePanel.module.css';
import { IconInfoCircle, IconInfoSquareRounded } from '@tabler/icons-react';

interface LayerOption {
  label: string;
  visible: boolean;
  toggle: () => void;
}

interface WelcomePanelProps {
  segmentStates: SegmentStates;
  toggleSegmentStateVisibility: (value: string) => void;
  baseMap: string;
  setBaseMap: React.Dispatch<React.SetStateAction<string>>;
  layers: LayerOption[];
  // setLayers: React.Dispatch<React.SetStateAction<MapLayer[]>>
}

function checkboxOutlineStyle(checked: boolean, style: string) {
  if (!checked || style === 'solid') {
    return {};
  }
  return {
    root: {
      outlineStyle: 'dashed',
      outlineColor: 'white',
      outlineWidth: '1.5px',
      outlineOffset: '-3px',
    },
  };
}

const WelcomePanel: React.FC<WelcomePanelProps> = ({
  segmentStates: trailStates,
  toggleSegmentStateVisibility: toggleTrailState,
  layers,
  baseMap,
  setBaseMap,
}) => (
  <>
    <Text>
      Welcome! Configure the map settings below and select a trail on the map to learn more.
    </Text>
    <Title order={4} style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}>
      Trails
    </Title>
    <Flex gap="sm" justify="flex-start" align="center" direction="row" wrap="wrap">
      {Object.entries(trailStates).map(([value, { label, color, visible, description, style }]) =>
        description ? (
          <Indicator
            key={value}
            inline
            withBorder
            label="?"
            size={16}
            color="gray"
            styles={{
              indicator: {
                userSelect: 'none',
                fontSize: '0.5rem',
                fontWeight: 'bolder',
                borderWidth: 'thin',
              },
            }}
          >
            <Tooltip
              label={description}
              multiline
              w={180}
              withArrow
              transitionProps={{ duration: 200 }}
              openDelay={300}
              refProp="rootRef"
            >
              <Checkbox
                id={value}
                classNames={classes}
                color={color}
                label={label}
                checked={visible}
                onChange={() => toggleTrailState(value)}
                wrapperProps={{ onClick: () => toggleTrailState(value) }}
                styles={checkboxOutlineStyle(visible, style)}
              />
            </Tooltip>
          </Indicator>
        ) : (
          <Checkbox
            id={value}
            key={value}
            classNames={classes}
            color={color}
            label={label}
            checked={visible}
            onChange={() => toggleTrailState(value)}
            wrapperProps={{ onClick: () => toggleTrailState(value) }}
            styles={checkboxOutlineStyle(visible, style)}
          />
        )
      )}
    </Flex>
    <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
    <Title order={4} style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}>
      Layers
    </Title>
    <Grid>
      {layers.map(({ label, visible, toggle }) => (
        <Grid.Col span={6} key={label}>
          <Checkbox
            id={label}
            key={label}
            classNames={classes}
            color="slate"
            label={label}
            checked={visible || false}
            onChange={toggle}
            wrapperProps={{ onClick: toggle }}
          />
        </Grid.Col>
      ))}
    </Grid>
    <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
    <Title order={4} style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}>
      Base Map
    </Title>
    <Select
      data={[
        { value: 'mapbox://styles/dnoen/clp8rwblo001001p84znz9viw', label: 'Outdoors' },
        { value: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite Streets' },
        { value: 'mapbox://styles/mapbox/satellite-v9', label: 'Satellite' },
        { value: 'mapbox://styles/mapbox/light-v11', label: 'Light' },
        { value: 'mapbox://styles/mapbox/dark-v11', label: 'Dark' },
      ]}
      value={baseMap}
      onChange={(value) => {
        if (value) setBaseMap(value);
      }}
    />
  </>
);

export default WelcomePanel;
