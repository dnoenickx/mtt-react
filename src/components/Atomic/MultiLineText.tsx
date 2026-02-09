import { TextProps, Text } from '@mantine/core';

export interface MultiLineTextProps extends TextProps {
  text: string;
}

export const MultiLineText = ({ text, ...rest }: MultiLineTextProps) => (
  <>
    {text.split('\n').map((str, index) => (
      <Text mb={'xs'} key={index} {...rest}>
        {str}
      </Text>
    ))}
  </>
);
