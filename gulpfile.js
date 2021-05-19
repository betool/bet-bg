'use strict';

const del = require('delete');
const { series, src, dest } = require('gulp');

const config = {
  src: 'src',
  dest: 'build',
  get plugin() {
    return `${this.src}/plugin`;
  },
};

function clean(cb) {
  del([config.dest], cb);
}

function copy() {
  const pluginStaticPath = src(`${config.plugin}/**`);
  const buildPath = dest(config.dest);

  return pluginStaticPath.pipe(buildPath);
}

function build(cb) {
  cb();
}

exports.clean = clean;
exports.copy = copy;
exports.build = build;

exports.default = series(clean, copy, build);
