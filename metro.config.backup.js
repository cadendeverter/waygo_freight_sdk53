const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get default Expo Metro config
const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration for React Native with Web support
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
// Update to properly extend expo's config
const config = getDefaultConfig(__dirname);

// Customizations to the default config
config.server = {
  ...config.server,
  hmrEnabled: false // Disable HMR to avoid client errors
};
// Setup transformer
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

// Add polyfills for better module interoperability
config.serializer = {
  ...config.serializer,
  getPolyfills: () => [
    ...require('metro-config/src/defaults/polyfills')(),
    path.resolve(__dirname, 'node_modules/core-js/stable'),
  ],
};

// Update resolver with asset extensions
config.resolver = {
  ...config.resolver,
  assetExts: [
    ...config.resolver.assetExts.filter(ext => ext !== 'svg'),
    'db',
    'sqlite',
    'mp3',
    'lproj',
    'ttf',
    'png',
    'jpg',
    'obj',
  ],
  sourceExts: [...config.resolver.sourceExts, 'svg', 'jsx', 'js', 'ts', 'tsx', 'json'],
  // Add debug logging for troubleshooting
  extraNodeModules: new Proxy(
    {},
    {
      get(target, name) {
        if (target[name]) {
          return target[name];
        }
        return path.resolve(__dirname, `node_modules/${name}`);
      }
    }
  ),
};

// Workaround for Metro issue with symlinks
config.watchFolders = [
  path.resolve(__dirname, './node_modules'),
];

// Export the properly extended config
module.exports = config;
