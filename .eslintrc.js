module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: { presets: ['babel-preset-expo'] },
  },
  extends: ['react-native', 'eslint:recommended'],
  root: true,
  extends: 'react-native',
};
