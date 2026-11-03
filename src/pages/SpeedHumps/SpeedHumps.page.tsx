import { useCallback, useMemo, useState } from 'react';
import { ExpressionSpecification } from 'maplibre-gl';
import Map, {
  Layer,
  MapLayerMouseEvent,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from 'react-map-gl/maplibre';
import {
  Anchor,
  Button,
  Checkbox,
  Collapse,
  Paper,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { darkStyle, lightStyle } from '../TrailMap/MapStyle';
import { HumpPopup, RoadPopup } from './SpeedHumpPopups';
import {
  HUMP_COLOR,
  HumpProps,
  RoadProps,
  SPEED_HUMPS_TILEJSON_URL,
  STATUS_CATEGORIES,
} from './speedHumps.config';
import styles from './SpeedHumps.module.css';
import meta from './speedHumps.meta.json';

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('en-US', { timeZone: 'America/New_York', ...opts });
const monthYear = (iso: string) => fmt(iso, { month: 'long', year: 'numeric' });
const fullDate = (iso: string) => fmt(iso, { month: 'short', day: 'numeric', year: 'numeric' });

function SourceNote({ lastUpdated }: { lastUpdated: string }) {
  return (
    <Text size="xs" c="dimmed" mt={4}>
      Source: City of Boston. Data last updated {fullDate(lastUpdated)}; accessed{' '}
      {fullDate(meta.accessedAt)}.
    </Text>
  );
}

const sortKey: ExpressionSpecification = [
  'match',
  ['get', 'PopupLong'],
  ...STATUS_CATEGORIES.flatMap((c): (string | string[] | number)[] => [c.values, c.rank]),
  0,
] as unknown as ExpressionSpecification;

const lineColor: ExpressionSpecification = [
  'match',
  ['get', 'PopupLong'],
  ...STATUS_CATEGORIES.flatMap((c): (string | string[])[] => [c.values, c.color]),
  '#707070',
] as unknown as ExpressionSpecification;

type Selection =
  | { kind: 'road'; lng: number; lat: number; props: RoadProps }
  | { kind: 'hump'; lng: number; lat: number; props: HumpProps };

export function SpeedHumpsPage() {
  const { colorScheme } = useMantineColorScheme();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [showHumps, setShowHumps] = useState(true);
  const [selection, setSelection] = useState<Selection>();
  const [cursor, setCursor] = useState('');
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [legendOpen, setLegendOpen] = useState(true);
  const showLegend = !isMobile || legendOpen;
  const checkboxSize = isMobile ? 'md' : 'xs';

  const roadFilter = useMemo<ExpressionSpecification>(() => {
    const visible = STATUS_CATEGORIES.filter((c) => !hidden.has(c.id)).flatMap((c) => c.values);
    return ['in', ['get', 'PopupLong'], ['literal', visible]];
  }, [hidden]);

  const toggle = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    // Features are ordered top-most first, so a hump wins over the street under it.
    const f = e.features?.[0];
    if (!f) {
      setSelection(undefined);
      return;
    }
    const { lng, lat } = e.lngLat;
    setSelection(
      f.layer.id === 'speed-humps-points'
        ? { kind: 'hump', lng, lat, props: f.properties as HumpProps }
        : { kind: 'road', lng, lat, props: f.properties as RoadProps }
    );
  }, []);

  return (
    <div className={styles.container}>
      <Map
        initialViewState={
          isMobile
            ? { latitude: 42.26053, longitude: -71.0907, zoom: 10.93 }
            : { latitude: 42.31623, longitude: -71.10917, zoom: 12.17 }
        }
        minZoom={9}
        maxZoom={18}
        // @ts-ignore style objects are loosely typed
        mapStyle={colorScheme === 'dark' ? darkStyle : lightStyle}
        interactiveLayerIds={['speed-humps-points', 'speed-humps-roads']}
        onClick={handleClick}
        onMouseMove={(e) => setCursor(e.features?.length ? 'pointer' : '')}
        cursor={cursor}
      >
        <NavigationControl showCompass={false} />
        <ScaleControl unit="imperial" />

        <Source id="speed-humps" type="vector" url={SPEED_HUMPS_TILEJSON_URL}>
          <Layer
            id="speed-humps-roads"
            type="line"
            // First label layer in the base style, so street names draw on top of the lines.
            beforeId="water_waterway_label"
            source-layer="eligibility"
            filter={roadFilter}
            layout={{ 'line-sort-key': sortKey, 'line-cap': 'round', 'line-join': 'round' }}
            paint={{
              'line-color': lineColor,
              'line-opacity': ['case', ['==', ['get', 'PopupLong'], 'Not eligible'], 0.9, 1],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                ['case', ['==', ['get', 'PopupLong'], 'Not eligible'], 0.8, 1.1],
                14,
                ['case', ['==', ['get', 'PopupLong'], 'Not eligible'], 1.6, 2.5],
                17,
                ['case', ['==', ['get', 'PopupLong'], 'Not eligible'], 3.5, 6],
              ],
            }}
          />
          <Layer
            id="speed-humps-points"
            type="circle"
            source-layer="humps"
            layout={{ visibility: showHumps ? 'visible' : 'none' }}
            paint={{
              'circle-color': HUMP_COLOR,
              'circle-stroke-color': '#fff',
              'circle-stroke-width': 1,
              'circle-radius': isMobile
                ? ['interpolate', ['linear'], ['zoom'], 9, 2.5, 12, 3.5, 15, 7, 17, 10]
                : ['interpolate', ['linear'], ['zoom'], 9, 1.5, 12, 2.5, 15, 6, 17, 9],
            }}
          />
        </Source>

        {selection && (
          <Popup
            longitude={selection.lng}
            latitude={selection.lat}
            onClose={() => setSelection(undefined)}
            maxWidth={isMobile ? 'calc(100vw - 32px)' : '300px'}
          >
            {selection.kind === 'hump' ? (
              <HumpPopup hump={selection.props} />
            ) : (
              <RoadPopup road={selection.props} />
            )}
          </Popup>
        )}
      </Map>

      {isMobile && (
        <Button
          className={styles.legendToggle}
          size="sm"
          variant="default"
          onClick={() => setLegendOpen((o) => !o)}
        >
          {legendOpen ? 'Hide layers' : 'Layers'}
        </Button>
      )}
      <Collapse in={showLegend} className={styles.legend}>
        <Stack gap="sm">
          <Paper shadow="md" p="sm" withBorder>
            <Stack gap={6}>
              <Text fw={600} size="sm">
                Speed humps ({monthYear(meta.humps.lastUpdated)})
              </Text>
              <Text size="xs" c="dimmed">
                Current locations
              </Text>
              <Checkbox
                size={checkboxSize}
                color={HUMP_COLOR}
                checked={showHumps}
                onChange={(e) => setShowHumps(e.currentTarget.checked)}
                label="Speed hump installed"
              />
              <SourceNote lastUpdated={meta.humps.lastUpdated} />
            </Stack>
          </Paper>

          <Paper shadow="md" p="sm" withBorder>
            <Stack gap={6}>
              <Text fw={600} size="sm">
                Speed Hump Plan ({monthYear(meta.eligibility.lastUpdated)})
              </Text>
              <Text size="xs" c="dimmed">
                Safety improvements the city{' '}
                <Anchor
                  href="https://mass.streetsblog.org/2023/05/22/wu-admin-announces-safety-surge-of-traffic-calming-for-neighborhood-streets"
                  target="_blank"
                  rel="noopener noreferrer"
                  inherit
                >
                  promised
                </Anchor>
              </Text>
              {STATUS_CATEGORIES.map((c) => (
                <Checkbox
                  key={c.id}
                  size={checkboxSize}
                  color={c.color}
                  checked={!hidden.has(c.id)}
                  onChange={() => toggle(c.id)}
                  label={c.label}
                />
              ))}
              <SourceNote lastUpdated={meta.eligibility.lastUpdated} />
            </Stack>
          </Paper>
        </Stack>
      </Collapse>
    </div>
  );
}
