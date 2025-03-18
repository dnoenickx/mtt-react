import { useEffect, useState, ReactNode, useRef } from 'react';
import { IconCopy, IconExternalLink } from '@tabler/icons-react';
import {
  Button,
  Flex,
  TextProps,
  Text,
  Skeleton,
  SkeletonProps,
  CopyButton,
  Box,
} from '@mantine/core';
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

interface SkeletonParagraphProps extends SkeletonProps {
  lines: number;
}

export const SkeletonParagraph: React.FC<SkeletonParagraphProps> = ({ lines, ...props }) => {
  const skeletonLines = [];

  for (let i = 0; i < lines - 1; i += 1) {
    skeletonLines.push(<Skeleton key={`line-${i}`} {...props} />);
  }

  skeletonLines.push(<Skeleton key={`line-${lines - 1}`} {...props} width="70%" />);

  return <>{skeletonLines}</>;
};

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

interface StickyBoxProps {
  children: ReactNode;
  shadowFadeLimit?: number;
  shadowMaxOpacity?: number;
}

export const StickyBox: React.FC<StickyBoxProps> = ({ children, shadowMaxOpacity = 0.3 }) => {
  const [shadowOpacity, setShadowOpacity] = useState(shadowMaxOpacity);
  const boxRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current || !ghostRef.current) return undefined;

    const checkPositions = () => {
      const boxRect = boxRef.current?.getBoundingClientRect();
      const ghostRect = ghostRef.current?.getBoundingClientRect();

      if (boxRect && ghostRect) {
        const isDifferentPosition = boxRect.top < ghostRect.top;
        setShadowOpacity(isDifferentPosition ? shadowMaxOpacity : 0);
      }
    };

    window.addEventListener('scroll', checkPositions);
    checkPositions();

    return () => window.removeEventListener('scroll', checkPositions);
  }, [shadowMaxOpacity]);

  return (
    <>
      <div
        ref={ghostRef}
        style={{
          position: 'relative',
          height: '20px',
          width: '100%',
          pointerEvents: 'none',
          // backgroundColor: 'green',
          // opacity: 0.3,
          // zIndex: 1000,
        }}
      />
      <Box
        ref={boxRef}
        py="md"
        bg="white"
        pos="sticky"
        bottom={0}
        style={{
          boxShadow: `0 -4px 10px rgba(0, 0, 0, ${shadowOpacity})`,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {children}
      </Box>
    </>
  );
};
