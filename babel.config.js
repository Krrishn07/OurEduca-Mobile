module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          "root": ["./"],
          "alias": {
            "@": "./src",
            "@context": "./src/context",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@utils": "./src/utils",
            "@constants": "./src/constants",
            "@screens": "./src/screens",
            "@lib": "./src/lib",
            "@navigation": "./src/navigation",
            "@navbar": "./src/navbar"
          }
        }
      ]
    ],
  };
};
