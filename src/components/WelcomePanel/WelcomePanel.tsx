import React, { useMemo } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  Pill,
  Select,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { SegmentStates, SEGMENT_STATES } from '../../pages/TrailMap/TrailMap.config';
import classes from './WelcomePanel.module.css';

export interface LayerOption {
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
}) => {
  const [opened, { open, close }] = useDisclosure(false);

  const trailExplanation = useMemo(
    () => (
      <>
        {Object.entries(SEGMENT_STATES).map(
          ([value, { label, color, description, style }], index, array) => (
            <Box key={value}>
              <Group gap="xs" align="baseline">
                <Text c={color} fw={700}>
                  {label}
                </Text>
                <Text size="xs" c="dimmed">
                  {style === 'dashed' ? '(dashed line)' : ''}
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {description}
              </Text>
              {index < array.length - 1 && <Divider size="xs" my="sm" />}
            </Box>
          )
        )}
      </>
    ),
    []
  );

  return (
    <>
      <Text>
        Welcome! Configure the map settings below and select a trail on the map to learn more.
      </Text>
      <Group gap="sm">
        <Title order={4} style={{ margin: '15px 0', color: 'var(--mantine-color-trail-green-8)' }}>
          Trails
        </Title>
        <Pill c="dimmed" onClick={open}>
          ?
        </Pill>
        <Modal
          opened={opened}
          onClose={close}
          title="Explaination of trail statuses"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 2,
          }}
          styles={{
            title: {
              color: 'var(--mantine-color-dark-4)',
            },
          }}
        >
          {trailExplanation}
        </Modal>
      </Group>
      <Flex gap="sm" justify="flex-start" align="center" direction="row" wrap="wrap">
        {Object.entries(trailStates).map(([value, { label, color, visible, style }]) => (
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
        ))}
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
};

export default WelcomePanel;
