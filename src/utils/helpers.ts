import { Platform, Dimensions, Linking, Alert } from 'react-native';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { enUS } from 'date-fns/locale';

// Device info
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isLargeDevice = SCREEN_WIDTH > 768;

// Format date to relative time (e.g., "2 hours ago", "yesterday", "last week")
export const formatRelativeTime = (dateString: string): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (isYesterday(date)) {
    return 'yesterday';
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Day of the week
  }
  
  if (isThisYear(date)) {
    return format(date, 'MMM d'); // Month and day
  }
  
  return format(date, 'MMM d, yyyy'); // Full date
};

// Format date with time
// Example: "Today at 2:30 PM" or "Yesterday at 10:15 AM"
export const formatDateTime = (dateString: string): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE, h:mm a');
  }
  
  if (isThisYear(date)) {
    return format(date, 'MMM d, h:mm a');
  }
  
  return format(date, 'MMM d, yyyy, h:mm a');
};

// Format currency
// Example: formatCurrency(1234.56) => "$1,234.56"
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if the number is valid
  const match = cleaned.match(/^(\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    // Format as (123) 456-7890
    return `(${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  // Return original if format doesn't match
  return phoneNumber;
};

// Open URL in browser
export const openUrl = async (url: string): Promise<void> => {
  // Check if the URL has a protocol, add https:// if not
  const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
  
  // Check if the URL can be opened
  const supported = await Linking.canOpenURL(formattedUrl);
  
  if (supported) {
    await Linking.openURL(formattedUrl);
  } else {
    Alert.alert(`Cannot open URL: ${formattedUrl}`);
  }
};

// Make phone call
export const makePhoneCall = (phoneNumber: string): void => {
  const phoneUrl = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
  
  Linking.canOpenURL(phoneUrl)
    .then(supported => {
      if (!supported) {
        Alert.alert('Phone calls are not supported on this device');
      } else {
        return Linking.openURL(phoneUrl);
      }
    })
    .catch(err => console.error('Error making phone call:', err));
};

// Send email
export const sendEmail = (email: string, subject: string = '', body: string = ''): void => {
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.canOpenURL(url)
    .then(supported => {
      if (!supported) {
        Alert.alert('Email is not configured on this device');
      } else {
        return Linking.openURL(url);
      }
    })
    .catch(err => console.error('Error sending email:', err));
};

// Format file size
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<F>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Generate a unique ID
export const generateId = (): string => {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 15)
  );
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number = 100, ellipsis: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + ellipsis;
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert string to title case
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

// Get initials from name
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  
  return initials;
};

// Parse query parameters from URL
export const parseQueryParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  
  try {
    const queryString = url.split('?')[1];
    if (!queryString) return params;
    
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
  } catch (e) {
    console.error('Error parsing query params:', e);
  }
  
  return params;
};

// Convert object to query string
export const toQueryString = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
};
