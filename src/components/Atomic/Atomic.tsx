import { Link } from '@/types';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, Flex, TextProps, Text } from '@mantine/core';

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
  <Flex gap={5} justify="flex-start" align="center" direction="row" wrap="wrap" py={4}>
    {links.map(({ label, url }) => (
      <a href={url} target="_blank" rel="nofollow noreferrer" key={url}>
        <Button
          size="compact-sm"
          c="dimmed"
          leftSection={<IconExternalLink size={14} />}
          variant="default"
        >
          {label}
        </Button>
      </a>
    ))}
  </Flex>
);