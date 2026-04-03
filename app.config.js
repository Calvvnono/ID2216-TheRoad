export default {
  expo: {
    name: 'The Road Goes Ever On',
    slug: 'the-road-goes-ever-on',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'theroad',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kth.theroadgoeseveron',
    },
    android: {
      package: 'com.kth.theroadgoeseveron',
      adaptiveIcon: {
        backgroundColor: '#0A0E1A',
      },
      edgeToEdgeEnabled: true,
      permissions: ['android.permission.RECORD_AUDIO'],
      config: {
        googleMaps: {
          apiKey: 'AIzaSyAPVllwYXp7o5MUaravqS7wx1yMocC2iN4',
        },
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
    },
    plugins: [
      'expo-router',
      'expo-image-picker',
      [
        './plugins/withGoogleMapsApiKey',
        { apiKey: 'AIzaSyAPVllwYXp7o5MUaravqS7wx1yMocC2iN4' },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: 'f0ac63ea-687d-4156-93b9-325d1cac87a3',
      },
    },
  },
};
