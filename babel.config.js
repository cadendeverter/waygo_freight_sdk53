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
      }]
    ],
  };
};
