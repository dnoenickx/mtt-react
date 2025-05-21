import React, { useMemo } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Checkbox,
  darken,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  Space,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBulb, IconQuestionMark } from '@tabler/icons-react';
import { formatDistance } from 'date-fns';
import { SegmentStates, SEGMENT_STATES } from '../../TrailMap.config';
import classes from './WelcomePanel.module.css';
import { useData } from '../../../../components/DataProvider/DataProvider';

export interface LayerOption {
  label: string;
  visible: boolean;
  toggle: () => void;
}

interface WelcomePanelProps {
  segmentStates: SegmentStates;
  toggleSegmentStateVisibility: (value: string) => void;
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
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { lastUpdated } = useData();
  const { colorScheme } = useMantineColorScheme();
  const isDarkMode = colorScheme === 'dark';

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
        <Title order={4} my="md" c="var(--mantine-color-trail-green-text)">
          Trails
        </Title>
        <ActionIcon
          variant="light"
          onClick={open}
          radius="xl"
          title="Show status explanations"
          aria-label="Show status explanations"
        >
          <IconQuestionMark style={{ width: '70%', height: '70%' }} stroke={2} />
        </ActionIcon>
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
            color={isDarkMode ? darken(color, 0.2) : color}
            label={label}
            checked={visible}
            onChange={() => toggleTrailState(value)}
            wrapperProps={{ onClick: () => toggleTrailState(value) }}
            styles={checkboxOutlineStyle(visible, style)}
          />
        ))}
      </Flex>
      <Divider size="xs" mt="xl" mb="md" />
      <Title order={4} my="md" c="var(--mantine-color-trail-green-text)">
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
      <Space h="xl" />
      <Alert variant="light" title="Tip" icon={<IconBulb />}>
        Right-click a location on the map to open it in Google Maps, Apple Maps, or Strava Heatmap
      </Alert>
      <Space h="xl" />
      <Text c="dimmed" size="xs" ta="center">
        Last Updated: {formatDistance(lastUpdated, new Date(), { addSuffix: true })}
      </Text>
      <Text c="dimmed" size="xs" ta="center" td="underline">
        mass.trail.tracker@gmail.com
      </Text>
    </>
  );
};

export default WelcomePanel;
