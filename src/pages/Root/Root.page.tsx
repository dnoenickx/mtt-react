import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, Text } from '@mantine/core';
import Logo from '../../components/Logo/Logo';
import classes from './Root.module.css';
import { useData } from '@/data/DataContext';
import { filterObject, simpleDiff, submitChanges } from '@/utils';

const navLinks = [
  { link: '/', label: 'Trail Map' },
  { link: '/about', label: 'About' },
];
declare global {
  interface Window {
    clearChanges: () => void;
  }
}

export function Root() {
  const [opened, { toggle }] = useDisclosure();
  const { state } = useData();

  useEffect(() => {
    if (Object.values(state.trails.new).length !== 0) {
      const diff = simpleDiff(
        filterObject(state.trails.original, Object.keys(state.trails.new)),
        state.trails.new
      );
      submitChanges({ trails: diff });
    }
  }, [state.trails.new]);

  useEffect(() => {
    if (Object.values(state.segments.new).length !== 0) {
      const diff = simpleDiff(
        filterObject(state.segments.original, Object.keys(state.segments.new)),
        state.segments.new
      );
      submitChanges({ segments: diff });
    }
  }, [state.segments.new]);

  useEffect(() => {
    if (Object.values(state.newsflashes.new).length !== 0) {
      const diff = simpleDiff(
        filterObject(state.newsflashes.original, Object.keys(state.newsflashes.new)),
        state.newsflashes.new
      );
      submitChanges({ newsflashes: diff });
    }
  }, [state.newsflashes.new]);

  const navButtons = navLinks.map(({ link, label }) => (
    <Link className={classes.link} to={link} key={link} onClick={toggle}>
      <Text>{label}</Text>
    </Link>
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            <Link to="/">
              <Logo height={36} className={classes.logo} />
            </Link>
            <Group ml={50} gap={5} visibleFrom="sm">
              {navButtons}
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        {navButtons}
      </AppShell.Navbar>

      <AppShell.Main style={{ padding: '60px 0 0 0' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
