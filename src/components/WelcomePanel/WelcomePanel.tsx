import React, { forwardRef } from 'react';

import { theme } from '@/theme';
import { Button, Checkbox, Divider, Flex, Grid, Text, Title, Tooltip } from '@mantine/core';
import { useState } from 'react';

import classes from './WelcomePanel.module.css';

import { BaseMap, BASE_MAPS, SegmentStates } from '../../pages/TrailMap/TrailMap.config';
import { string } from 'prop-types';

// https://mantine.dev/core/button/#custom-variants

interface LayerOption {
  label: string;
  visible: boolean;
  toggle: () => void;
}

interface WelcomePanelProps {
  segmentStates: SegmentStates;
  toggleSegmentStateVisibility: (value: string) => void;
  // baseMap: string;
  // setBaseMap: React.Dispatch<React.SetStateAction<string>>;
  layers: LayerOption[];
  // setLayers: React.Dispatch<React.SetStateAction<MapLayer[]>>
}

const WelcomePanel: React.FC<WelcomePanelProps> = ({
  segmentStates: trailStates,
  toggleSegmentStateVisibility: toggleTrailState,
  layers,
}) => {
  return (
    <>
      <Text>
        Welcome! Configure the map settings below and select a trail on the map to learn more.
      </Text>
      <Title order={4} style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}>
        Trails
      </Title>
      <Flex gap="sm" justify="flex-start" align="center" direction="row" wrap="wrap">
        {Object.entries(trailStates).map(([value, { label, color, visible, description }]) =>
          description ? (
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
                key={value}
                classNames={classes}
                color={color}
                label={label}
                checked={visible}
                onChange={() => toggleTrailState(value)}
                wrapperProps={{ onClick: () => toggleTrailState(value) }}
              />
            </Tooltip>
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
              classNames={classes}
              color={'slate'}
              label={label}
              checked={visible || false}
              onChange={toggle}
              wrapperProps={{ onClick: toggle }}
            />
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
};

export default WelcomePanel;

{
  /* <Divider size="xs" style={{ marginTop: 30, marginBottom: 7 }} />
      <Title order={4} style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}>
        Base Map
      </Title>
      <Grid>
        {BASE_MAPS.map(({ value, label }) => (
          <Grid.Col span={6}>
            <Checkbox
              id={value}
              key={value}
              classNames={classes}
              color={'slate'}
              label={label}
              checked={value === baseMap}
              onChange={() => setBaseMap(value)}
              wrapperProps={{
                onClick: () => setBaseMap(value),
              }}
            />
          </Grid.Col>
        ))}
      </Grid> */
}
