const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withGoogleMapsApiKey(config, { apiKey }) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (item) => item.$['android:name'] !== 'com.google.android.geo.API_KEY',
    );
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': apiKey,
      },
    });
    return config;
  });
};
