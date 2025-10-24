import { IconExternalLink } from '@tabler/icons-react';
import { Button, Flex } from '@mantine/core';
import { Link } from '@/types';

export const LinkGroup = ({ links }: { links: Link[] }) => (
  <Flex mt="xs" gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap" py={4}>
    {links.map(({ text, url }) => (
      <a href={url} target="_blank" rel="nofollow noreferrer" key={url}>
        <Button
          size="compact-sm"
          c="dimmed"
          leftSection={<IconExternalLink size={14} />}
          variant="default"
          styles={{
            root: {
              height: 'auto',
              paddingTop: '3px',
              paddingBottom: '3px',
            },
            label: {
              whiteSpace: 'pre-line',
              textAlign: 'left',
              lineHeight: 1.25,
            },
          }}
        >
          {text}
        </Button>
      </a>
    ))}
  </Flex>
);
