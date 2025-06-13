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
module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'db',
      'sqlite',
      'mp3',
      'ttf',
      'otf',
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
      'woff',
      'woff2',
      'cjs',
      'mjs',
    ],
    sourceExts: [
      ...(process.env.EXPO_TARGET === 'web' ? ['web.js', 'web.ts', 'web.tsx'] : []),
      ...defaultConfig.resolver.sourceExts,
    ],
    resolverMainFields: [
      'sbmodern',
      ...(process.env.EXPO_TARGET === 'web' ? ['browser'] : []),
      'module',
      'main',
      'react-native',
    ],
    // Add this to handle Node.js core modules
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (typeof name !== 'string') return target[name];
          return path.join(process.cwd(), `node_modules/${name}`);
        },
      }
    ),
  },
  // Workaround for Metro issue with symlinks
  watchFolders: [
    __dirname,
    path.join(__dirname, 'node_modules'),
  ],
  // Set the project root
  projectRoot: __dirname,
  // Add this for better source map support
  server: {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Fix MIME type for JS files
        if (req.url.endsWith('.bundle') || req.url.includes('bundle?platform=')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        return middleware(req, res, next);
      };
    },
  },
};
