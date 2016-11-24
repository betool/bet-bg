'use strict';

import LRU from 'lru-cache';
import Promise from 'bluebird';
import fetch from 'isomorphic-fetch';
import localforage from 'localforage';
import BetConnector from 'bet-connector';
// import Logger from 'bet-logger';


// const log = new Logger('BET:bg');

class BetBackground {

  constructor (app) {
    app = app || {};
    app.ttl = app.ttl || 1000 * 60 * 1;

    this.ttl = app.ttl;
    this.storage = {
      config: localforage.createInstance({ name: 'config' }),
      modules: localforage.createInstance({ name: 'modules' })
    };
    this.cache = {
      config: LRU({ maxAge: app.ttl}),
      modules: LRU({ maxAge: 1000 * 60 * 60 * 24 })
    };

    this.connector = new BetConnector('chrome');
    this.connector.addListener();
  }

  run () {
    return Promise.resolve()
      .then(() => this.startup())
      .catch(err => {
        console.log('Error:', err.stack, err);
      });
  }

  startup () {
    return Promise.resolve()
      .then(() => this.getConfig())
      .then(config => this.getModules(config));
  }

  getConfig () {
    return Promise.resolve()
      .then(() => {
        if (this.cache.config.has('config')) {
          console.log('from cache');
          return Promise.resolve(this.cache.config.get('config'));
        }

        return Promise.resolve()
          .then(() => this.storage.config.getItem('config'))
          .then(config => {
            // config not found in storage
            if (!config) {
              return this.loadConfig();
            }
            let ttl = config.__ttl - new Date().valueOf();

            this.cache.config.set('config', config, ttl);

            // config found and fresh
            if (this.cache.config.has('config')) {
              console.log('from ls', ttl);
              return Promise.resolve(this.cache.config.get('config'));
            }

            // config found, but isn`t fresh, load new from server
            return this.loadConfig(config);
          });
      })
      .then(config => {
        console.log('config', config);
        return Promise.resolve(config);
      });
  }

  loadConfig (oldConfig) {
    return Promise.resolve()
      .then(() => fetch('http://localhost:3000/config.json'))
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then(config => {
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
          return this.wipeModules(config);
        }

        return Promise.resolve(config);
      })
      .then(config => {
        return Promise.resolve()
          .then(() => {
            config.__ttl = new Date().valueOf() + this.ttl;
            this.cache.config.set('config', config, this.ttl);
            console.log('from server');
            return Promise.resolve();
          })
          .then(() => this.storage.config.setItem('config', config))
          .then(() => Promise.resolve(config));
      });
  }

  wipeModules (config) {
    console.log('wipe!');
    return Promise.resolve()
      .then(() => this.cache.modules.reset())
      .then(() => this.storage.modules.clear())
      .then(() => Promise.resolve(config));
  }

  getModules (config) {
    return Promise.resolve()
      .then(() => {
        // remove system config element
        config.shift();
        const parallel = config.map(moduleConfig => this.getModule(moduleConfig));
        return Promise.all(parallel);
      });
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
      console.log(`from cache: ${link}`);
      return Promise.resolve();
    }

    return Promise.resolve()
      .then(() => this.storage.modules.getItem(link))
      .then(text => {
        // link text not found in storage
        if (!text) {
          return this.loadModuleElement(link);
        }

        this.cache.modules.set(link, text);

        // link text found and fresh
        if (this.cache.modules.has(link)) {
          console.log(`from ls: ${link}`);
          return Promise.resolve();
        }

        // link text found, but isn`t fresh, load new from server
        return this.loadModuleElement(link);
      });
  }

  loadModuleElement (link) {
    return Promise.resolve()
      .then(() => fetch(link))
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.text();
      })
      .then(text => {
        console.log(`from server: ${link}`);
        return Promise.resolve()
          .then(() => this.cache.modules.set(link, text))
          .then(() => this.storage.modules.setItem(link, text));
      });
  }
};

export default BetBackground;
