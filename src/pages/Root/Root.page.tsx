import { Link, Outlet } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, AppShell, Burger, Group, Text, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import cx from 'clsx';
import { Logo } from '../../components/Atomic';
import classes from './Root.module.css';
import SubmitEditsBanner from '@/components/SubmitEditsBanner/SubmitEditsBanner';
import { useEmbedded } from '@/hooks/useEmbedded';

export function Root() {
  const isEmbedded = useEmbedded();
  const [opened, { toggle }] = useDisclosure();
  const { toggleColorScheme } = useMantineColorScheme();

  const navLinks = [
    { link: '/', label: 'Map' },
    { link: '/about', label: 'About' },
    { link: '/admin', label: 'Contribute' },
  ];

  const navButtons = navLinks.map(({ link, label }) => (
    <Link className={classes.link} to={link} key={link} onClick={toggle}>
      <Text>{label}</Text>
    </Link>
  ));

  const colorToggle = (
    <ActionIcon
      onClick={toggleColorScheme}
      variant="transparent"
      size="xl"
      aria-label="Toggle color scheme"
    >
      <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
      <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
    </ActionIcon>
  );

  return (
    <AppShell
      header={isEmbedded ? undefined : { height: { base: 45, sm: 60 } }}
      navbar={
        isEmbedded
          ? undefined
          : { width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }
      }
    >
      {!isEmbedded && (
        <>
          <AppShell.Header>
            <Group h="100%" px="md">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Group justify="space-between" style={{ flex: 1 }} visibleFrom="sm">
                <Link to="/">
                  <Logo h={{ base: 30, sm: 36 }} />
                </Link>
                <Group ml={50} gap={15}>
                  {colorToggle}
                  {[...navButtons].reverse()}
                </Group>
              </Group>
              <Group justify="space-around" style={{ flex: 1 }} hiddenFrom="sm" pr={44}>
                <Link to="/">
                  <Logo h={{ base: 30, sm: 36 }} />
                </Link>
              </Group>
            </Group>
          </AppShell.Header>
          <AppShell.Navbar py="md" px={4}>
            {navButtons}
            {colorToggle}
          </AppShell.Navbar>
        </>
      )}

      <AppShell.Main>
        <div className={classes['outlet-container']}>
          <SubmitEditsBanner />
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
