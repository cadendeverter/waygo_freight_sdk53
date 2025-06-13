import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { useTheme } from 'react-native-paper';

type ParagraphProps = TextProps & {
  variant?: 'body1' | 'body2' | 'caption' | 'overline';
  children: React.ReactNode;
};

export default function Paragraph({ 
  variant = 'body1', 
  style, 
  children, 
  ...props 
}: ParagraphProps) {
  const theme = useTheme();
  
  const getStyles = () => {
    switch (variant) {
      case 'body1': return styles.body1;
      case 'body2': return styles.body2;
      case 'caption': return styles.caption;
      case 'overline': return styles.overline;
      default: return styles.body1;
    }
  };

  return (
    <Text 
      style={[
        getStyles(),
        { color: theme.colors.onSurface },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body1: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
    opacity: 0.7,
  },
  overline: {
    fontSize: 10,
    lineHeight: 16,
    marginBottom: 4,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
});
