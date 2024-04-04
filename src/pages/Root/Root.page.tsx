import { Link, Outlet } from 'react-router-dom';

import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Group, Text } from '@mantine/core';

import Logo from '../../components/Logo/Logo';
import classes from './Root.module.css';

const navLinks = [
  { link: '/', label: 'Trail Map' },
  { link: '/about', label: 'About' },
];

const navButtons = navLinks.map(({ link, label }) => (
  <Link className={classes.link} to={link} key={link}>
    <Text>{label}</Text>
  </Link>
));

export function Root() {
  const [opened, { toggle }] = useDisclosure();

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
            <Link to={'/'}>
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
