import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Platform-specific Maps imports and fallbacks
let MapView: any = ({ style, children, ...props }: any) => (
  <View style={[styles.mapFallback, style]} {...props}>
    <Text style={styles.mapText}>Map view not available on web</Text>
    {children}
  </View>
);

let Marker: any = ({ children, ...props }: any) => (
  <View style={styles.markerFallback} {...props}>
    <Text style={styles.markerText}>📍</Text>
    {children}
  </View>
);

let Callout: any = ({ children, ...props }: any) => (
  <View style={styles.calloutFallback} {...props}>
    {children}
  </View>
);

let Circle: any = ({ ...props }: any) => (
  <View style={styles.circleFallback} {...props} />
);

let Polyline: any = ({ ...props }: any) => (
  <View style={styles.polylineFallback} {...props} />
);

let PROVIDER_GOOGLE = 'google';

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Callout = maps.Callout;
    Circle = maps.Circle;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('React Native Maps not available');
  }
}

const styles = StyleSheet.create({
  mapFallback: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  markerFallback: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 20,
  },
  calloutFallback: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  circleFallback: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  polylineFallback: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
});

export { MapView, Marker, Callout, Circle, Polyline, PROVIDER_GOOGLE };
export default MapView;
