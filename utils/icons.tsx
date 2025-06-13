import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

interface IconProps {
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}

// User Management Icons
export const Users = ({ size, color, style }: IconProps) => (
  <MaterialIcons name="people" size={size} color={color} style={style} />
);

// Fleet Management Icons
export const Truck = ({ size, color, style }: IconProps) => (
  <FontAwesome5 name="truck" size={size} color={color} style={style} />
);

// Compliance Icons
export const FileBadge = ({ size, color, style }: IconProps) => (
  <MaterialCommunityIcons name="file-document-edit" size={size} color={color} style={style} />
);

// Reports Icons
export const BarChart3 = ({ size, color, style }: IconProps) => (
  <Feather name="bar-chart-2" size={size} color={color} style={style} />
);

// Settings Icons
export const Settings = ({ size, color, style }: IconProps) => (
  <Feather name="settings" size={size} color={color} style={style} />
);

// Additional Icons for Future Use
export const Plus = ({ size, color, style }: IconProps) => (
  <Feather name="plus" size={size} color={color} style={style} />
);

export const Edit = ({ size, color, style }: IconProps) => (
  <Feather name="edit" size={size} color={color} style={style} />
);

export const Trash = ({ size, color, style }: IconProps) => (
  <Feather name="trash-2" size={size} color={color} style={style} />
);

export const Search = ({ size, color, style }: IconProps) => (
  <Feather name="search" size={size} color={color} style={style} />
);

export const Filter = ({ size, color, style }: IconProps) => (
  <Feather name="filter" size={size} color={color} style={style} />
);

export const ChevronRight = ({ size, color, style }: IconProps) => (
  <Feather name="chevron-right" size={size} color={color} style={style} />
);

export const AlertCircle = ({ size, color, style }: IconProps) => (
  <Feather name="alert-circle" size={size} color={color} style={style} />
);

export const CheckCircle = ({ size, color, style }: IconProps) => (
  <Feather name="check-circle" size={size} color={color} style={style} />
);

// Export all icons as a single object for convenience
export const Icons = {
  Users,
  Truck,
  FileBadge,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle,
};

export default Icons;
