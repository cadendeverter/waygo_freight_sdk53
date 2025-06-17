import React from 'react';
import { View, Text, Platform } from 'react-native';

// Type definitions for compatibility
export interface MapViewProps {
  children?: React.ReactNode;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChange?: (region: any) => void;
  onRegionChangeComplete?: (region: any) => void;
  style?: any;
  [key: string]: any;
}

export interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  [key: string]: any;
}

export interface PolylineProps {
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  strokeColor?: string;
  strokeWidth?: number;
  [key: string]: any;
}

// Conditional components that render native maps on mobile, fallback on web
export const ConditionalMapView: React.FC<MapViewProps> = ({ children, style, ...props }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[{ 
        backgroundColor: '#e0e0e0', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 200,
      }, style]}>
        <Text style={{ color: '#666', fontSize: 16 }}>
          Map View (Web Preview)
        </Text>
        {children}
      </View>
    );
  }

  // Import react-native-maps dynamically on native platforms
  const MapView = require('react-native-maps').default;
  return <MapView style={style} {...props}>{children}</MapView>;
};

export const ConditionalMarker: React.FC<MarkerProps> = (props) => {
  if (Platform.OS === 'web') {
    return (
      <View style={{ 
        position: 'absolute',
        backgroundColor: 'red',
        width: 10,
        height: 10,
        borderRadius: 5,
        top: '50%',
        left: '50%',
        transform: [{ translateX: -5 }, { translateY: -5 }]
      }}>
        {props.children}
      </View>
    );
  }

  const { Marker } = require('react-native-maps');
  return <Marker {...props} />;
};

export const ConditionalPolyline: React.FC<PolylineProps> = (props) => {
  if (Platform.OS === 'web') {
    return (
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderColor: props.strokeColor || '#007AFF',
        borderStyle: 'dashed',
      }} />
    );
  }

  const { Polyline } = require('react-native-maps');
  return <Polyline {...props} />;
};

// Default export as MapView for metro alias compatibility
const MapView: React.FC<MapViewProps> = ConditionalMapView;

// Named exports for direct usage
export { MapView };

// Export all react-native-maps components with web fallbacks
export const Marker = ConditionalMarker;
export const Polyline = ConditionalPolyline;

// Additional exports for full compatibility
export const Circle = (props: any) => Platform.OS === 'web' ? <View /> : require('react-native-maps').Circle(props);
export const Polygon = (props: any) => Platform.OS === 'web' ? <View /> : require('react-native-maps').Polygon(props);
export const Overlay = (props: any) => Platform.OS === 'web' ? <View /> : require('react-native-maps').Overlay(props);
export const Callout = (props: any) => Platform.OS === 'web' ? <View /> : require('react-native-maps').Callout(props);

// Default export for metro alias
export default MapView;
