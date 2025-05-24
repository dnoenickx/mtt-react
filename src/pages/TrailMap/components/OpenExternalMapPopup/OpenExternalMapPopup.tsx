import React from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { IconBrandApple, IconBrandGoogleMaps, IconBrandStrava } from '@tabler/icons-react';
import './OpenExternalMapPopup.module.css';

interface OpenExternalMapPopupProps {
  lat: number;
  lng: number;
}

export function OpenExternalMapPopup({ lat, lng }: OpenExternalMapPopupProps) {
  return (
    <Stack gap={0}>
      <Text size="xs" ta="center" c="dimmed">
        Open in
      </Text>
      <Button.Group orientation="vertical">
        <Button
          leftSection={<IconBrandGoogleMaps size={14} />}
          variant="subtle"
          component="a"
          target="_blank"
          justify="left"
          href={`https://maps.google.com/?q=${lat},${lng}`}
        >
          Google Maps
        </Button>
        <Button
          leftSection={<IconBrandApple size={14} />}
          variant="subtle"
          component="a"
          target="_blank"
          justify="left"
          href={`https://maps.apple.com/?ll=${lat},${lng}&q=Dropped%20Pin`}
        >
          Apple Maps
        </Button>
        <Button
          leftSection={<IconBrandStrava size={14} />}
          variant="subtle"
          component="a"
          target="_blank"
          justify="left"
          href={`https://www.strava.com/maps/global-heatmap?sport=Ride&style=dark&terrain=false&labels=true&poi=false&cPhotos=false&gColor=hot&gOpacity=100#14/${lat}/${lng}`}
        >
          Strava Heatmap
        </Button>
      </Button.Group>
    </Stack>
  );
}
