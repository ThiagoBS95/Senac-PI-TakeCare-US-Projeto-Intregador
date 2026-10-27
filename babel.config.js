// Sem este arquivo o preset do Expo não é aplicado, e o plugin do
// react-native-worklets — exigido pelo react-native-reanimated 4 — fica de fora.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
