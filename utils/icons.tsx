import React from 'react';
import { MaterialIcons, FontAwesome5, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Helper function to convert our icon components to IconSource format for React Native Paper
export const iconSource = (IconComponent: React.FC<IconProps>) => 
  ({ color, size }: { color: string; size: number }) => 
    React.createElement(IconComponent, { color, size });

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

export const User: React.FC<IconProps> = ({ size = 24, color = 'currentColor', style = {} }) => (
  <MaterialIcons name="person" size={size} color={color} style={style} />
);

export const Settings: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="settings" size={size} color={color} style={style} />
);

export const FileText: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="file-document" {...props} />;

export const Mail: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="mail" size={size} color={color} style={style} />
);

export const Phone: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="phone" {...props} />;

export const Calendar: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="calendar" {...props} />;

export const CheckCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="check-circle" size={size} color={color} style={style} />
);

export const AlertCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="alert-circle" size={size} color={color} style={style} />
);

export const Navigation: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="navigation" {...props} />;

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
  <Ionicons name="refresh" size={size} color={color} style={style} />
);

export const Bell: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="notifications" size={size} color={color} style={style} />
);

export const Globe: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="globe" size={size} color={color} style={style} />
);

export const Database: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="server" size={size} color={color} style={style} />
);

export const Key: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="key" size={size} color={color} style={style} />
);

export const Save: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="save" size={size} color={color} style={style} />
);

export const Plus: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="add" size={size} color={color} style={style} />
);

export const TrendingUp: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="trending-up" size={size} color={color} style={style} />
);

export const TrendingDown: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="trending-down" size={size} color={color} style={style} />
);

export const Download: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="download" {...props} />;

export const ChevronRight: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="chevron-right" {...props} />;

export const Filter: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="filter" size={size} color={color} style={style} />
);

export const MoreVertical: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="ellipsis-vertical" size={size} color={color} style={style} />
);

export const Edit: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Ionicons name="pencil" size={size} color={color} style={style} />
);

export const Trash: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="trash" size={size} color={color} style={style} />
);

export const Trash2: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="trash-2" size={size} color={color} style={style} />
);

export const Search: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="search" size={size} color={color} style={style} />
);

export const UserPlus: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="user-plus" size={size} color={color} style={style} />
);

export const Activity: React.FC<IconProps> = (props) => (
  <MaterialCommunityIcons name="chart-line" {...props} />
);

export const Thermometer: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="thermometer" {...props} />;
export const Gauge: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="gauge" {...props} />;
export const Wrench: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="wrench" {...props} />;

export const Check: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="check" {...props} />;
export const X: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="close" {...props} />;
export const Camera: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="camera" {...props} />;
export const MessageSquare: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="message-text" {...props} />;
export const MessageCircle: React.FC<IconProps> = MessageSquare;
export const Eye: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="eye" {...props} />;
export const EyeOff: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="eye-off" {...props} />;
export const Star: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="star" {...props} />;
export const Route: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="routes" {...props} />;
export const Send: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="send" {...props} />;
export const Building2: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="office-building" {...props} />;
export const Lock: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="lock" {...props} />;
export const Map: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="map" {...props} />;
export const Award: React.FC<IconProps> = (props) => <MaterialCommunityIcons name="trophy" {...props} />;

export const Upload: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="upload" size={size} color={color} style={style} />
);

export const Calculator: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialIcons name="calculate" size={size} color={color} style={style} />
);

export const Scale: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="scale-balance" size={size} color={color} style={style} />
);

export const BarChart3: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="bar-chart" size={size} color={color} style={style} />
);

export const Users: React.FC<IconProps> = ({ size = 24, color = 'currentColor', style = {} }) => (
  <MaterialIcons name="people" size={size} color={color} style={style} />
);

export const Zap: React.FC<IconProps> = ({ size = 24, color = 'currentColor', style = {} }) => (
  <Feather name="zap" size={size} color={color} style={style} />
);

export const Scan: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} style={style} />
);

export const Heart: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="heart" size={size} color={color} style={style} />
);

export const Flame: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="fire" size={size} color={color} style={style} />
);

export const Car: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <FontAwesome5 name="car" size={size} color={color} style={style} />
);

export const Radio: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="radio" size={size} color={color} style={style} />
);

export const ArrowRight: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="arrow-right" size={size} color={color} style={style} />
);

export const ArrowLeft: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="arrow-left" size={size} color={color} style={style} />
);

export const Warehouse: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="warehouse" size={size} color={color} style={style} />
);

export const ShoppingCart: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="shopping-cart" size={size} color={color} style={style} />
);

export const Target: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="target" size={size} color={color} style={style} />
);

export const Bookmark: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="bookmark" size={size} color={color} style={style} />
);

export const List: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="list" size={size} color={color} style={style} />
);

export const Menu: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="menu" size={size} color={color} style={style} />
);

export const Copy: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="copy" size={size} color={color} style={style} />
);

export const ExternalLink: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="external-link" size={size} color={color} style={style} />
);

export const WiFi: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="wifi" size={size} color={color} style={style} />
);

export const WifiOff: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="wifi-off" size={size} color={color} style={style} />
);

export const Layers: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="layers" size={size} color={color} style={style} />
);

export const Grid: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="grid" size={size} color={color} style={style} />
);

export const ChevronUp: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="chevron-up" size={size} color={color} style={style} />
);

export const ChevronDown: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="chevron-down" size={size} color={color} style={style} />
);

export const ChevronLeft: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="chevron-left" size={size} color={color} style={style} />
);

export const RotateCcw: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="rotate-ccw" size={size} color={color} style={style} />
);

export const Volume2: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="volume-2" size={size} color={color} style={style} />
);

export const VolumeX: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="volume-x" size={size} color={color} style={style} />
);

export const Mic: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="mic" size={size} color={color} style={style} />
);

export const MicOff: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="mic-off" size={size} color={color} style={style} />
);

export const Clipboard: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="clipboard" size={size} color={color} style={style} />
);

export const Paperclip: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="paperclip" size={size} color={color} style={style} />
);

export const Image: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="image" size={size} color={color} style={style} />
);

export const File: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="file" size={size} color={color} style={style} />
);

export const Info: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="info" size={size} color={color} style={style} />
);

export const HelpCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="help-circle" size={size} color={color} style={style} />
);

export const Monitor: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="monitor" size={size} color={color} style={style} />
);

export const Smartphone: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="smartphone" size={size} color={color} style={style} />
);

export const Tablet: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="tablet" size={size} color={color} style={style} />
);

export const Server: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="server" size={size} color={color} style={style} />
);

export const HardDrive: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="hard-drive" size={size} color={color} style={style} />
);

export const Link: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="link" size={size} color={color} style={style} />
);

export const Unlink: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="link-2" size={size} color={color} style={style} />
);

export const Power: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="power" size={size} color={color} style={style} />
);

export const LogOut: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="log-out" size={size} color={color} style={style} />
);

export const LogIn: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="log-in" size={size} color={color} style={style} />
);

export const Crown: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="crown" size={size} color={color} style={style} />
);

export const CreditCard: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="credit-card" size={size} color={color} style={style} />
);

export const Gift: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="gift" size={size} color={color} style={style} />
);

export const Maximize: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="maximize" size={size} color={color} style={style} />
);

export const Minimize: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="minimize" size={size} color={color} style={style} />
);

export const MoreHorizontal: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="more-horizontal" size={size} color={color} style={style} />
);

export const Printer: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="printer" size={size} color={color} style={style} />
);

export const Share: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="share" size={size} color={color} style={style} />
);

export const Tag: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="tag" size={size} color={color} style={style} />
);

export const Wifi: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="wifi" size={size} color={color} style={style} />
);

export const Bluetooth: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="bluetooth" size={size} color={color} style={style} />
);

export const Battery: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="battery" size={size} color={color} style={style} />
);

export const Signal: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="signal" size={size} color={color} style={style} />
);

export const Anchor: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="anchor" size={size} color={color} style={style} />
);

export const Aperture: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="aperture" size={size} color={color} style={style} />
);

export const AtSign: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="at-sign" size={size} color={color} style={style} />
);

export const Briefcase: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="briefcase" size={size} color={color} style={style} />
);

export const Coffee: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="coffee" size={size} color={color} style={style} />
);

export const Compass: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="compass" size={size} color={color} style={style} />
);

export const Headphones: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="headphones" size={size} color={color} style={style} />
);

export const Music: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="music" size={size} color={color} style={style} />
);

export const Video: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="video" size={size} color={color} style={style} />
);

export const VideoOff: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="video-off" size={size} color={color} style={style} />
);

export const PhoneCall: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="phone-call" size={size} color={color} style={style} />
);

export const PhoneIncoming: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="phone-incoming" size={size} color={color} style={style} />
);

export const PhoneOutgoing: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="phone-outgoing" size={size} color={color} style={style} />
);

export const Repeat: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="repeat" size={size} color={color} style={style} />
);

export const Shuffle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="shuffle" size={size} color={color} style={style} />
);

export const SkipBack: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="skip-back" size={size} color={color} style={style} />
);

export const SkipForward: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="skip-forward" size={size} color={color} style={style} />
);

export const StopCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="stop-circle" size={size} color={color} style={style} />
);

export const PauseCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="pause-circle" size={size} color={color} style={style} />
);

export const PlayCircle: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="play-circle" size={size} color={color} style={style} />
);

export const FastForward: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="fast-forward" size={size} color={color} style={style} />
);

export const Rewind: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="rewind" size={size} color={color} style={style} />
);

export const Folder: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="folder" size={size} color={color} style={style} />
);

export const FolderOpen: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="folder-open" size={size} color={color} style={style} />
);

export const FolderPlus: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="folder-plus" size={size} color={color} style={style} />
);

export const Book: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="book" size={size} color={color} style={style} />
);

export const Bug: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="bug" size={size} color={color} style={style} />
);

export const Layers3: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="layers-triple" size={size} color={color} style={style} />
);

export const Cpu: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="cpu" size={size} color={color} style={style} />
);

export const Receipt: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="file-text" size={size} color={color} style={style} />
);

export const Building: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <MaterialCommunityIcons name="office-building" size={size} color={color} style={style} />
);

export const BellOff: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="bell-off" size={size} color={color} style={style} />
);

export const Flag: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="flag" size={size} color={color} style={style} />
);

export const GraduationCap: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <FontAwesome5 name="graduation-cap" size={size} color={color} style={style} />
);

export const BookOpen: React.FC<IconProps> = ({ size = 24, color = '#000', style }) => (
  <Feather name="book-open" size={size} color={color} style={style} />
);

// Export all icons as a single object for convenience
export const Icons = {
  Truck,
  MapPin,
  Clock,
  Package,
  DollarSign,
  User,
  Users,
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
  Filter,
  MoreVertical,
  Edit,
  Trash,
  Trash2,
  Search,
  UserPlus,
  Activity,
  Thermometer,
  Gauge,
  Wrench,
  Check,
  X,
  Camera,
  MessageSquare,
  MessageCircle,
  Eye,
  EyeOff,
  Star,
  Route,
  Send,
  Building2,
  Lock,
  Map,
  Award,
  Upload,
  Calculator,
  Scale,
  BarChart3,
  Zap,
  Scan,
  Heart,
  Flame,
  Car,
  Radio,
  ArrowRight,
  ArrowLeft,
  Warehouse,
  ShoppingCart,
  Target,
  Bookmark,
  List,
  Menu,
  Copy,
  ExternalLink,
  WiFi,
  WifiOff,
  Layers,
  Grid,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Clipboard,
  Paperclip,
  Image,
  File,
  Info,
  HelpCircle,
  Monitor,
  Smartphone,
  Tablet,
  Server,
  HardDrive,
  Link,
  Unlink,
  Power,
  LogOut,
  LogIn,
  Crown,
  CreditCard,
  Gift,
  Maximize,
  Minimize,
  MoreHorizontal,
  Printer,
  Share,
  Tag,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Anchor,
  Aperture,
  AtSign,
  Briefcase,
  Coffee,
  Compass,
  Headphones,
  Music,
  Video,
  VideoOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  StopCircle,
  PauseCircle,
  PlayCircle,
  FastForward,
  Rewind,
  Folder,
  FolderOpen,
  FolderPlus,
  Book,
  Bug,
  Layers3,
  Cpu,
  Building,
  BellOff,
  Flag,
  Receipt,
  GraduationCap,
  BookOpen
};

export default Icons;
