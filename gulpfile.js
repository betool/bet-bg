'use strict';

const del = require('delete');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const run = require('gulp-run-command').default;
const { series, parallel, src, dest } = require('gulp');

const tsProject = ts.createProject('tsconfig.build.json');

const config = {
  src: 'src',
  dest: 'build',
  get modules() {
    return `${this.src}/**/{bg,cs}.ts`;
  },
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

function build() {
  return series(clean, parallel(copy, run(`npx parcel build src/modules/bg/bg.ts src/modules/cs/cs.ts --out-dir ${config.dest}`)));
}

exports.clean = clean;
exports.copy = copy;

exports.default = build();
