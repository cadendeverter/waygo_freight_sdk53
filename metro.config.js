// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for more file extensions
config.resolver.assetExts.push(
  // Adds support for `.db` files for SQLite databases
  'db',
  'sqlite',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ttf',
  'otf',
  'woff',
  'woff2'
);

module.exports = config;
