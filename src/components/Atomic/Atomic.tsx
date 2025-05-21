import { IconCopy, IconExternalLink } from '@tabler/icons-react';
import { Button, Flex, TextProps, Text, CopyButton } from '@mantine/core';
import { Link } from '@/types';

export interface MultiLineTextProps extends TextProps {
  text: string;
}

export const MultiLineText = ({ text, ...rest }: MultiLineTextProps) => (
  <>
    {text.split('\n').map((str, index) => (
      <Text m={0} key={index} {...rest}>
        {str}
      </Text>
    ))}
  </>
);

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

export const EmailButton = () => (
  <CopyButton value="mass.trail.tracker@gmail.com" timeout={2000}>
    {({ copied, copy }) => (
      <Button
        variant="outline"
        color={copied ? 'green' : 'gray'}
        onClick={copy}
        leftSection={<IconCopy style={{ width: '75%', height: '75%' }} />}
        size="xs"
      >
        {copied ? 'Email copied' : 'mass.trail.tracker@gmail.com'}
      </Button>
    )}
  </CopyButton>
);
