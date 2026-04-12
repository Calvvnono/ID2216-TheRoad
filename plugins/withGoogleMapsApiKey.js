const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withGoogleMapsApiKey(config, { apiKey }) {
  if (!apiKey) return config;
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (!app) return mod;
    if (!app['meta-data']) app['meta-data'] = [];
    const existing = app['meta-data'].find(
      (m) => m.$?.['android:name'] === 'com.google.android.geo.API_KEY',
    );
    if (existing) {
      existing.$['android:value'] = apiKey;
    } else {
      app['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': apiKey,
        },
      });
    }
    return mod;
  });
};
