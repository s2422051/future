module.exports = {
  name: "TrainLiveInfo",
  slug: "trainliveinfo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "trainliveinfo",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.namboshunsuke.trainliveinfo",
    config: {
      usesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.namboshunsuke.trainliveinfo"
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-router",
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
      }
    ]
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "b6a30291-04ce-45fb-a282-ca4bf7a2e08f"
    }
  },
  owner: "namboshunsuke",
  updates: {
    url: "https://u.expo.dev/b6a30291-04ce-45fb-a282-ca4bf7a2e08f"
  },
  runtimeVersion: {
    policy: "appVersion"
  }
};