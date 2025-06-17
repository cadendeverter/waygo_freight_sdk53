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
