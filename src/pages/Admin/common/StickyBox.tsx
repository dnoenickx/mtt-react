import { Box } from '@mantine/core';
import { ReactNode, useEffect, useRef, useState } from 'react';

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
        bg="var(--mantine-color-body)"
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
