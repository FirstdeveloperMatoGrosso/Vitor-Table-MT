const webpack = require('webpack');

module.exports = function override(config) {
  // Adicionar fallback para módulos do Node.js
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    buffer: false,
  };

  // Adicionar alias para React Native
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Adicionar extensões
  config.resolve.extensions = [
    '.web.js',
    '.js',
    '.web.jsx',
    '.jsx',
    '.json',
    '.web.ts',
    '.ts',
    '.web.tsx',
    '.tsx',
  ];

  return config;
};
