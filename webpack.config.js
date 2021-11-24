const path = require('path');
const { IgnorePlugin } = require('webpack');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

const config = {
  target: 'web',
  cache: false,
  entry: {
    bg: path.join(__dirname, './src/modules/bg/bg.ts'),
    cs: path.join(__dirname, './src/modules/cs/cs.ts'),
    test: path.join(__dirname, './src/modules/test/test.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: (pathData) => {
      if (['bg', 'cs', 'test'].includes(pathData.runtime)) {
        return `${pathData.runtime}/[name].js`;
      }
      return '[name].js';
    },
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'svgo-loader'],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: IN_DEVELOPMENT,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new IgnorePlugin({
      resourceRegExp: /^ws$/,
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'src/plugin'),
          to: path.join(__dirname, 'dist'),
          context: 'public',
        },
      ],
    }),
  ],
  externals: ['fs'],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
};
