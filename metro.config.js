const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    // Some deps (e.g. @rn-primitives/portal) ship separate CJS/ESM builds that each
    // instantiate their own module-level singleton (zustand store). Without this,
    // `import` and `require()` of the same package can resolve to different files,
    // producing two disconnected singleton instances — e.g. Select's dropdown writing
    // into a portal store that PortalHost never reads from.
    unstable_enablePackageExports: false,
  },
});

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
