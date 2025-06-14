module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for React Native Reanimated
      'react-native-reanimated/plugin',
      // For environment variables
      ["module:react-native-dotenv", {
        moduleName: "@env",
        path: ".env",
        safe: false,
        allowUndefined: true,
      }],
      // Enhanced transform runtime configuration for better ESM compatibility
      ["@babel/plugin-transform-runtime", {
        "helpers": true,
        "regenerator": true,
        "absoluteRuntime": false,
        "version": "^7.22.0"
      }],
      // Add this to fix safe area context and other native modules on web
      process.env.EXPO_TARGET === "web" && ["@babel/plugin-proposal-private-methods", { "loose": true }],
    ].filter(Boolean),
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
