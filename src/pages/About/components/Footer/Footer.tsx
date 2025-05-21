import { Text, Container } from '@mantine/core';
import Logo from '../../../../components/Logo/Logo';
import classes from './Footer.module.css';

type Link = {
  label: string;
  link: string;
};

type Category = {
  title: string;
  links: Link[];
};

const data: Category[] = [];

export function Footer() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<'a'>
        key={index}
        className={classes.link}
        component="a"
        href={link.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Logo h={36} />
          {/* <Text size="xs" c="dimmed" className={classes.description}></Text> */}
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © {new Date().getFullYear()} masstrailtracker.com. All rights reserved.
        </Text>

        {/* <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <a href="https://twitter.com/masstrails" target="_blank" rel="noopener noreferrer">
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandTwitter style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </ActionIcon>
          </a>
        </Group> */}
      </Container>
    </footer>
  );
}
