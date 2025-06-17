import React from 'react';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Truck: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <FontAwesome5 name="truck" size={size} color={color} style={style} />
);

export const MapPin: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="map-pin" size={size} color={color} style={style} />
);

export const Clock: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="clock" size={size} color={color} style={style} />
);

export const Package: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="package" size={size} color={color} style={style} />
);

export const DollarSign: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="dollar-sign" size={size} color={color} style={style} />
);

export const User: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="user" size={size} color={color} style={style} />
);

export const Settings: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="settings" size={size} color={color} style={style} />
);

export const FileText: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="file-text" size={size} color={color} style={style} />
);

export const Mail: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="mail" size={size} color={color} style={style} />
);

export const Phone: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="phone" size={size} color={color} style={style} />
);

export const Calendar: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="calendar" size={size} color={color} style={style} />
);

export const CheckCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="check-circle" size={size} color={color} style={style} />
);

export const AlertCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="alert-circle" size={size} color={color} style={style} />
);

export const Navigation: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="navigation" size={size} color={color} style={style} />
);

export const BarChart: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="bar-chart" size={size} color={color} style={style} />
);

export const PieChart: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="pie-chart" size={size} color={color} style={style} />
);

export const Home: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="home" size={size} color={color} style={style} />
);

export const Fuel: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialIcons name="local-gas-station" size={size} color={color} style={style} />
);

export const Shield: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="shield" size={size} color={color} style={style} />
);

export const Archive: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="archive" size={size} color={color} style={style} />
);

export const AlertTriangle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="alert-triangle" size={size} color={color} style={style} />
);

export const XCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="x-circle" size={size} color={color} style={style} />
);

export const Play: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="play" size={size} color={color} style={style} />
);

export const Pause: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="pause" size={size} color={color} style={style} />
);

export const Square: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="square" size={size} color={color} style={style} />
);

export const RefreshCw: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="refresh-cw" size={size} color={color} style={style} />
);

export const Bell: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="bell" size={size} color={color} style={style} />
);

export const Globe: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="globe" size={size} color={color} style={style} />
);

export const Database: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="database" size={size} color={color} style={style} />
);

export const Key: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="key" size={size} color={color} style={style} />
);

export const Save: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="save" size={size} color={color} style={style} />
);

export const Plus: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="plus" size={size} color={color} style={style} />
);

export const TrendingUp: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="trending-up" size={size} color={color} style={style} />
);

export const TrendingDown: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="trending-down" size={size} color={color} style={style} />
);

export const Download: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="download" size={size} color={color} style={style} />
);

export const ChevronRight: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="chevron-right" size={size} color={color} style={style} />
);

export const Search: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="search" size={size} color={color} style={style} />
);

export const UserPlus: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="user-plus" size={size} color={color} style={style} />
);

// Export all icons as a single object for convenience
export const Icons = {
  Truck,
  MapPin,
  Clock,
  Package,
  DollarSign,
  User,
  Settings,
  FileText,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Navigation,
  BarChart,
  PieChart,
  Home,
  Fuel,
  Shield,
  Archive,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Square,
  RefreshCw,
  Bell,
  Globe,
  Database,
  Key,
  Save,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  ChevronRight,
  Search,
  UserPlus
};

export default Icons;
