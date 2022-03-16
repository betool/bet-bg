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
    bg: path.join(__dirname, './src/modules/betool/bg/bg.ts'),
    cs: path.join(__dirname, './src/modules/betool/cs/cs.ts'),
    app: path.join(__dirname, './src/modules/app/app.ts'),
    'delay-5-1': path.join(__dirname, './src/modules/app/delay-5-1.ts'),
    'delay-5-2': path.join(__dirname, './src/modules/app/delay-5-2.ts'),
    'delay-10': path.join(__dirname, './src/modules/app/delay-10.ts'),
    immediately: path.join(__dirname, './src/modules/app/immediately.ts'),
    random: path.join(__dirname, './src/modules/app/random.ts'),
    ready: path.join(__dirname, './src/modules/app/ready.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: (pathData) => {
      console.log(pathData);
      if (['bg', 'cs', 'app'].includes(pathData.runtime)) {
        return `${pathData.runtime}/[name].js`;
      }
      if (['delay-5-1', 'delay-5-2', 'delay-10', 'immediately', 'random', 'ready'].includes(pathData.runtime)) {
        return `app/[name].js`;
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
