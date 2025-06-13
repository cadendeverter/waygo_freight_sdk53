import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type ScreenWrapperProps = {
  children: ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  safeArea?: boolean;
};

export default function ScreenWrapper({
  children,
  style,
  scrollable = true,
  safeArea = true,
}: ScreenWrapperProps) {
  const theme = useTheme();
  
  const Container = safeArea ? SafeAreaView : View;
  
  return (
    <Container 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.background },
        style
      ]}
    >
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.scrollContent}>
          {children}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});
