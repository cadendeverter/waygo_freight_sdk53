const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase compatibility fixes for Expo SDK 53
// This resolves "Component auth has not been registered yet" error
config.resolver = {
  ...config.resolver,
  // Add CJS support for Firebase packages
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  // Disable package exports to fix Firebase JS SDK compatibility
  unstable_enablePackageExports: false,
  // SVG support
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  // Platform-specific extensions
  platforms: ['ios', 'android', 'native', 'web'],
  // Block native-only modules on web
  blockList: [
    /.*\/node_modules\/@stripe\/stripe-react-native\/.*NativeCard.*\.js$/,
    /.*\/node_modules\/react-native-maps\/.*Native.*\.js$/,
  ],
  alias: {
    // Platform-specific aliases for web
    ...(process.env.EXPO_PLATFORM === 'web' ? {
      '@stripe/stripe-react-native': require.resolve('./utils/stripe.tsx'),
      'react-native-maps': require.resolve('./utils/maps.tsx'),
      'expo-location': require.resolve('./utils/location.tsx'),
    } : {}),
  },
};

// Add SVG transformer support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Add svg to source extensions
config.resolver.sourceExts.push('svg');

module.exports = config;
