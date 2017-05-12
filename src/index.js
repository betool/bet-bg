/* global chrome:true */

'use strict';

import LRU from 'lru-cache';
import Promise from 'bluebird';
import fetch from 'isomorphic-fetch';
import localforage from 'localforage';
import BetConnector from 'bet-connector';
import helper from 'bet-helper';
import Logger from 'bet-logger';

const log = new Logger('BET:bg');

class BetBackground {

  constructor (app = {}) {
    app.ttl = app.ttl || 1000 * 60 * 1;
    app.ettl = app.ettl || 1000 * 60 * 1;

    this.ttl = app.ttl;
    this.ettl = app.ettl;

    this.location = helper.buildLocation(app.location);

    this.storage = {
      config: localforage.createInstance({ name: 'config' }),
      modules: localforage.createInstance({ name: 'modules' }),
    };
    this.cache = {
      inner: LRU({ maxAge: 0 }),
      config: LRU({ maxAge: app.ttl }),
      modules: LRU({ maxAge: 0 }),
    };

    if (Array.isArray(app.config)) {
      this.cache.inner.set('inner', app.config);
    }

    this.dealer = new BetConnector('chrome', this);
    this.dealer.addListener();
  }

  get config () {
    let original = [];

    if (this.cache.inner.has('inner')) {
      const inner = this.cache.inner.get('inner');
      original = original.concat(inner);
    }
    if (this.cache.config.has('config')) {
      const config = this.cache.config.get('config').slice();
      config.shift();
      original = original.concat(config);
    }

    return original;
  }

  run () {
    return Promise.resolve()
      .then(() => this.startup())
      .catch((err) => {
        log('Error:', err.stack, err);
      });
  }

  startup () {
    return Promise.resolve()
      .then(() => this.getConfig())
      .then(() => this.getModules())
      .then(() => {
        log('config', this.config);
      });
  }

  getConfig () {
    return Promise.resolve()
      .then(() => this.getConfigCache())
      .then((config) => {
        if (config) {
          return config;
        }

        return this.getConfigStorage();
      })
      .then((config) => {
        if (config) {
          return config;
        }

        return this.loadConfigInternal();
      })
      .then(() => this.config);
  }

  mixInnerConfig (config) {
    if (this.cache.inner.has('inner')) {
      const inner = this.cache.inner.get('inner');
      return inner.concat(config);
    }

    return config;
  }

  getConfigCache () {
    if (this.cache.config.has('config')) {
      log('from cache');
      return Promise.resolve(this.cache.config.get('config'));
    }
  }

  getConfigStorage () {
    return this.storage.config.getItem('config')
      .then((storageConfig) => {
        if (storageConfig) {
          log('from ls');

          const ttl = storageConfig[0].__ttl - new Date().valueOf();
          this.cache.config.set('config', storageConfig, ttl);

          if (this.cache.config.has('config')) {
            return this.getConfigCache();
          }

          return this.loadConfigInternal(storageConfig);
        }
      });
  }

  loadConfigInternal (oldConfig) {
    if (!this.location.config) {
      return [];
    }

    return Promise.resolve()
      .then(() => fetch(this.location.config))
      .then((response) => {
        if (400 <= response.status) {
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then((config) => {
        log('from Internal');

        config[0].__ttl = new Date().valueOf() + this.ttl;

        return Promise.resolve()
          .then(() => this.cache.config.set('config', config, this.ttl))
          .then(() => this.storage.config.setItem('config', config))
          .then(() => {
            if (
              oldConfig
              &&
              (
                oldConfig[0] && config[0]
              )
              &&
              (
                'number' === typeof oldConfig[0].v
                &&
                'number' === typeof config[0].v
              )
              &&
              (
                oldConfig[0].v !== config[0].v
              )
            ) {
              return this.wipeModules();
            }
          })
          .then(() => config);
      });
      // TODO: catch error
  }

  wipeModules () {
    log('wipe!');
    return Promise.resolve()
      .then(() => this.cache.modules.reset())
      .then(() => this.storage.modules.clear())
      .then(() => this.getModules());
  }

  getModules () {
    const parallel = this.config.map(moduleConfig => this.getModule(moduleConfig));
    return Promise.all(parallel);
  }

  getModule (moduleConfig) {
    if (Array.isArray(moduleConfig.l) && moduleConfig.l.length) {
      return this.getModuleElements(moduleConfig.l);
    }

    return Promise.resolve();
  }

  getModuleElements (links) {
    const parallel = links.map(link => this.getModuleElement(link));
    return Promise.all(parallel);
  }

  getModuleElement (link) {
    if (this.cache.modules.has(link)) {
      log(`from cache: ${link}`);
      return Promise.resolve();
    }

    return Promise.resolve()
      .then(() => this.storage.modules.getItem(link))
      .then((text) => {
        // link text not found in storage
        if (!text) {
          return this.loadModuleElement(link);
        }

        this.cache.modules.set(link, text);

        // link text found and fresh
        if (this.cache.modules.has(link)) {
          log(`from ls: ${link}`);
          return Promise.resolve();
        }

        // link text found, but isn`t fresh, load new from server
        return this.loadModuleElement(link);
      });
  }

  loadModuleElement (link) {
    const url = this.extractFullUrl(link);
    return Promise.resolve()
      .then(() => fetch(url))
      .then((response) => {
        if (400 <= response.status) {
          throw new Error('Bad response from server');
        }
        return response.text();
      })
      .then((text) => {
        log(`from server: ${link}`);
        return Promise.resolve()
          .then(() => this.cache.modules.set(link, text))
          .then(() => this.storage.modules.setItem(link, text));
      });
  }

  extractFullUrl (url) {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    if (/^\//.test(url)) {
      // TODO: add all platform polifill
      return chrome.extension.getURL(url);
    }

    const moduleLocation = this.location.ptm ? `${this.location.ptm}/${url}` : url;
    let extracted = `${this.location.protocol}://${this.location.hostname}`;
    if (this.location.port) {
      extracted += `:${this.location.port}`;
    }
    extracted += `/${moduleLocation}`;

    return extracted;
  }
}

export default BetBackground;
