var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    './src/js/heyModal.js'
  ],
  output: {
    path: path.join(__dirname, 'dist/js'),
    filename: 'heyModal.min.js',
    publicPath: '/dist/js',
    library: 'heyModal',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      }
    ]
  }
};
