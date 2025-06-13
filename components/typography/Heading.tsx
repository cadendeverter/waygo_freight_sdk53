import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { useTheme } from 'react-native-paper';

type HeadingProps = TextProps & {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
};

export default function Heading({ 
  variant = 'h1', 
  style, 
  children, 
  ...props 
}: HeadingProps) {
  const theme = useTheme();
  
  const getStyles = () => {
    switch (variant) {
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'h4': return styles.h4;
      case 'h5': return styles.h5;
      case 'h6': return styles.h6;
      default: return styles.h1;
    }
  };

  return (
    <Text 
      style={[
        getStyles(),
        { color: theme.colors.onBackground },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 8,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 6,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 6,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 4,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 4,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 4,
  },
});
