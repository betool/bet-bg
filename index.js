'use strict';

import LRU from 'lru-cache';
import Promise from 'bluebird';
import fetch from 'isomorphic-fetch';
import localforage from 'localforage';
// import Logger from 'bet-logger';


// const log = new Logger('BET:bg');

class BetBackground {

  constructor (app) {
    app = app || {};
    app.ttl = app.ttl || 1000 * 60 * 1;

    this.ttl = app.ttl;
    this.cache = LRU({
      maxAge: app.ttl
    });
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
        if (this.cache.has('config')) {
          console.log('from cache');
          return Promise.resolve(this.cache.get('config'));
        }

        return Promise.resolve()
          .then(() => localforage.getItem('config'))
          .then(config => {
            if (!config) {
              return this.loadConfig();
            }
            let ttl = config.__ttl - new Date().valueOf();

            this.cache.set('config', config, ttl);

            if (this.cache.has('config')) {
              console.log('from ls', ttl);
              return Promise.resolve(this.cache.get('config'));
            }

            return this.loadConfig();
          });
      })
      .then(config => {
        console.log('config', config);
        return Promise.resolve(config);
      });
  }

  loadConfig () {
    return Promise.resolve()
      .then(() => fetch('http://localhost:3000/config.json'))
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then(config => {
        config.__ttl = new Date().valueOf() + this.ttl;
        this.cache.set('config', config, this.ttl);
        console.log('from server');

        return Promise.resolve()
          .then(() => localforage.setItem('config', config))
          .then(() => Promise.resolve(config));
      });
  }

  getModules () {
    return Promise.resolve();
  }
};

export default BetBackground;
