'use strict';

const NODE_ENV = process.env.NODE_ENV || 'production';

const path = require('path');
const webpack = require('webpack');

const envPlugin = new webpack.DefinePlugin({
  ENV_BROWSER: JSON.stringify('chrome')
});

module.exports = {
  context: path.join(__dirname + '/src'),
  entry: {
    bg: './modules/bg.js',
    cs: './modules/cs.js'
    // module: './tests/testModule.js'
  },
  output: {
    path: path.join(__dirname + '/build'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [
            'es2015'
          ]
        }
      }
    ],
    noParse: [new RegExp('node_modules/localforage/dist/localforage.js')]
  },
  plugins: [
    envPlugin
  ],
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js'],
    fallback: path.join(__dirname, 'node_modules')
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
    modulesDirectories: ['node_modules'],
    moduleTemplates: ['*-loader', '*'],
    extensions: ['', '.js']
  },
  devtool: NODE_ENV === 'development' ? 'source-map' : null,
  watch: NODE_ENV === 'development',
  watchOptions: {
    aggregateTimeout: 100
  }
};

if (NODE_ENV === 'production') {
  module.exports.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: true,
          unsafe: true
        }
      })
  );
}
