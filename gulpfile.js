'use strict';

const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');


function clean () {
  return del(['build']);
}

function copy () {
  return gulp.src('./src/plugins/chrome/**')
    .pipe(gulp.dest('./build'));
}

gulp.task('webpack:server', cb => {
  let compiler = webpack(webpackConfig);

  new WebpackDevServer(
    compiler,
    {
      contentBase: `${__dirname}/src/public`,
      publicPath: '/brex',
      stats: {
        colors: true
      }
    }
  )
    .listen(3000, 'localhost', err => {
      if (err) {
        throw new gutil.PluginError('webpack-dev-server', err);
      }

      gutil.log('[webpack-dev-server]', 'http://localhost:3000/webpack-dev-server/index.html');
    });
});

gulp.task('webpack:build', cb => {
  webpack(Object.create(webpackConfig), (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    };

    gutil.log('[webpack]', stats.toString({colors: true}));
    cb();
  });
});

const build = gulp.series(
  clean,
  copy,
  'webpack:build',
  'webpack:server'
);

gulp.task('default', build);
