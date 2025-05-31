import React from 'react';
import { Text } from '@mantine/core';

interface CommuterRailPopupProps {
  stationName: string;
}

export function CommuterRailPopup({ stationName }: CommuterRailPopupProps) {
  return (
    <div>
      <Text fw={500}>{stationName}</Text>
    </div>
  );
}
