import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type LoadingStateProps = {
  /**
   * Whether the content is loading
   */
  isLoading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string | null;
  
  /**
   * Custom loading message
   */
  loadingMessage?: string;
  
  /**
   * Custom error message title
   */
  errorTitle?: string;
  
  /**
   * Callback when retry button is pressed
   */
  onRetry?: () => void;
  
  /**
   * Whether to show a retry button when there's an error
   */
  showRetryButton?: boolean;
  
  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the loading container
   */
  loadingContainerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the error container
   */
  errorContainerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the loading text
   */
  loadingTextStyle?: StyleProp<TextStyle>;
  
  /**
   * Custom style for the error title
   */
  errorTitleStyle?: StyleProp<TextStyle>;
  
  /**
   * Custom style for the error message
   */
  errorMessageStyle?: StyleProp<TextStyle>;
  
  /**
   * Custom style for the retry button
   */
  retryButtonStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the retry button text
   */
  retryButtonTextStyle?: StyleProp<TextStyle>;
  
  /**
   * Size of the loading indicator
   */
  size?: 'small' | 'large';
  
  /**
   * Color of the loading indicator
   */
  color?: string;
  
  /**
   * Children to render when not loading and no error
   */
  children?: React.ReactNode;
};

/**
 * A component that handles loading and error states with a consistent UI.
 * It can display a loading indicator, an error message, or the child content
 * based on the current state.
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading = false,
  error = null,
  loadingMessage = 'Loading...',
  errorTitle = 'Something went wrong',
  onRetry,
  showRetryButton = true,
  style,
  loadingContainerStyle,
  errorContainerStyle,
  loadingTextStyle,
  errorTitleStyle,
  errorMessageStyle,
  retryButtonStyle,
  retryButtonTextStyle,
  size = 'large',
  color,
  children,
}) => {
  const { theme } = useTheme();
  
  // If we have an error, show the error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style, errorContainerStyle]}>
        <View style={styles.content}>
          <Text
            style={[
              styles.errorTitle,
              { color: theme.colors.error },
              errorTitleStyle,
            ]}
          >
            {errorTitle}
          </Text>
          <Text
            style={[
              styles.errorMessage,
              { color: theme.colors.textSecondary },
              errorMessageStyle,
            ]}
          >
            {error}
          </Text>
          
          {showRetryButton && onRetry && (
            <View style={[styles.retryButton, { borderColor: theme.colors.primary }, retryButtonStyle]}>
              <Text
                style={[
                  styles.retryButtonText,
                  { color: theme.colors.primary },
                  retryButtonTextStyle,
                ]}
                onPress={onRetry}
              >
                Retry
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
  
  // If we're loading, show the loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style, loadingContainerStyle]}>
        <View style={styles.content}>
          <ActivityIndicator
            size={size}
            color={color || theme.colors.primary}
            style={styles.loadingIndicator}
          />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.textSecondary },
              loadingTextStyle,
            ]}
          >
            {loadingMessage}
          </Text>
        </View>
      </View>
    );
  }
  
  // Otherwise, render the children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoadingState;
