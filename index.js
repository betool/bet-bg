import ctor from 'bet-ctor';
import helper from 'bet-helper';
import Logger from 'bet-logger';
import Talker from 'bet-talker';


const log = new Logger('BET:bg');

class Configuration {
  constructor (remote, local) {
    if (Array.isArray(remote)) {
      this.cfg = remote;
    } else {
      this.cfg = ctor.array(ctor.object({v: 0, k: ''}));
    }

    if (Array.isArray(local)) {
      this.cfg = this.cfg.concat(local);
    }

    return this.cfg;
  }

}


export default class BetBackground {

  constructor (app) {
    log('constructor run with: ', app);

    this.host = app.host;
    this.path = app.path;
    this.pid = app.pluginId;
    this.timeout = app.timeout;
    this.ptm = app.pathToModule;
    this.ptc = app.pathToConfig;
    this.protocol = app.protocol;
    this.errTimeout = app.errTimeout;
    this.localModules = app.localModules || ctor.array();

    this.modules = ctor.object();
    this.talker = new Talker(this.pid);
    this.talker.addListener();


    this.config = this.getConfigurationFromCache(true);
  }


  load () {
    log('load');

    // this.loadConfiguration(this.setReady.bind(this));
  }


  setReady (ready = true) {
    log('setReady', this);

    this.talker.ready = ready;
    this.talker.cfg = this.config;
    this.talker.modules = this.modules;

    for (propName in this.talker.onReadyCbs) {
      this.talker.onReadyCbs[propName]();
    }
  }


  loadConfiguration (cb) {
    log('loadConfiguration');

    let now = ctor.number(helper.getCurrentTime());

    if (this.config.ttl > now) {
      log(`ttl is OK ${this.config.ttl} > ${now}`);

      return this.loadModulesFromCache(cb);
    }

    log(`ttl is BAD ${this.config.ttl} > ${now}`);

    this.loadConfigurationFromServer(cb);
  }


  loadConfigurationFromServer (cb) {
    log('loadConfigurationFromServer');

    this.talker.api.ajax.get({
      url: `${this.protocol}:\/\/${this.host}/${this.ptc}`,
      parse: 'json'
    }, (res) => {
      log('loadConfigurationFromServer res', res);

      if (res.err) {
        log('loadConfigurationFromServer res err', res.err);

        this.config.ttl = ctor.number(helper.getCurrentTime() + this.errTimeout);
        this.talker.api.localStorage.set(`${this.pid}ttl`, ctor.string(this.config.ttl));

        log('loadConfigurationFromServer set err ttl', this.config.ttl);

        return cb(false);
      }

      let newConfiguration = res.value;

      log('loadConfigurationFromServer newConfiguration', newConfiguration);

      if (!newConfiguration) {
        log('loadConfigurationFromServer res.value is empty');

        this.config.ttl = ctor.number(helper.getCurrentTime() + this.errTimeout);
        this.talker.api.localStorage.set(`${this.pid}ttl`, ctor.string(this.config.ttl));

        log('loadConfigurationFromServer set err ttl', this.config.ttl);

        return cb();
      }

      let newConfigurationVersion = newConfiguration[0].v;
      newConfiguration = newConfiguration.concat(this.localModules);

      log('loadConfigurationFromServer newConfigurationVersion %d', newConfigurationVersion);

      if (newConfigurationVersion !== this.config.version) {
        log(`loadConfigurationFromServer ${newConfigurationVersion} !== ${this.config.version}`);

        let ttl = ctor.string(helper.getCurrentTime() + this.timeout);
        this.talker.api.localStorage.set(`${this.pid}ttl`, ttl);
        this.talker.api.localStorage.set(`${this.pid}cfg`, newConfiguration);

        log('loadConfigurationFromServer set ttl', ttl);

        this.config = this.getConfigurationFromCache(false);
        return this.loadModulesFromServer(newConfiguration, cb);
      }

      log(`loadConfigurationFromServer ${newConfigurationVersion} === ${this.config.version}`);

      let ttl = ctor.string(helper.getCurrentTime() + this.timeout);
      this.talker.api.localStorage.set(`${this.pid}ttl`, ttl);

      log('loadConfigurationFromServer set ttl', ttl);

      return this.loadModulesFromCache(cb);
    })
  }


  getConfigurationFromCache () {
    log('getConfigurationFromCache');

    let rawConfiguration = this.talker.api.localStorage.get(`${this.pid}cfg`);
    let configuration = helper.parseJson(rawConfiguration);

    if(!configuration) {
      configuration = new Configuration(null, this.localModules);
      this.talker.api.localStorage.set(`${this.pid}cfg`, configuration);
      this.talker.api.localStorage.set(`${this.pid}ttl`, 0);
    } else {
      configuration = new Configuration(configuration, this.localModules);
    }

    return {
      key: configuration[0].k,
      ttl: ctor.number(this.talker.api.localStorage.get(`${this.pid}ttl`) || 0),
      version: configuration[0].v,
      modules: [],
      raw: configuration
    }
  }


  loadModulesFromServer (cfg, cb) {
    log('loadModulesFromServer');

    let [key, ...modules]= cfg;
    let urls = [];
    modules.forEach((m) => {
      m.l.forEach((l) => {
        log('loadModulesFromServer module %s', l);

        urls.push(l);
      });
    });

    Promise.resolve()
      .then(() => {
        let modulesPromise = urls.map((url) => {
          return this.downloadModule(url);
        });
        return Promise.all(modulesPromise)
          .then(() => {
            log('loadModulesFromServer done');

            return cb();
          });
      })
      .catch((err) => {
        log('loadModulesFromServer err', err);

        return cb(false);
      })
  }

  downloadModule (url) {
    log('downloadModule %s', url);

    return new Promise((resolve, reject) => {
      this.talker.api.ajax.get({
        url: this.extractFullUrl(url)
      }, (res) => {
        log('downloadModule res', res);

        if (res.err || (res.value && res.value.status)) {
          log('downloadModule err');

          return this.saveModuleToStorage(url, ctor.number(helper.getCurrentTime() + this.errTimeout))
            .then((module) => {
              return resolve(module);
            });
        }
        return this.saveModuleToStorage(url, res.value)
          .then((module) => {
            return resolve(module);
          });
      });
    })
  }

  saveModuleToStorage (key, module) {
    log('saveModuleToStorage');

    if (typeof module === 'string') {
      log('saveModuleToStorage added module to Brex.module %s', key);

      this.modules[key] = module;
    }

    log('saveModuleToStorage module saved to LS %s', key);

    return Promise.resolve(this.talker.api.localStorage.set(`${this.pid}${key}`, module));
  }

  loadModulesFromCache (cb) {
    log('loadModulesFromCache');

    let [key, ...modules]= this.config.raw;
    let keys = [];
    modules.forEach((m) => {
      m.l.forEach((l) => {
        log('loadModulesFromCache module %s', l);

        keys.push(l);
      });
    });

    keys.forEach((__key) => {
      let module = this.talker.api.localStorage.get(`${this.pid}${__key}`);

      if (Number.isNaN(ctor.number(module)) && typeof module === 'string') {
        log('loadModulesFromCache module from LS key: %s, len: %d', __key, module.length);

        this.modules[__key] = module;
      } else {
        log('loadModulesFromCache module from LS key: %s, value: %s', __key, module);
      }
    });

    cb();
  }

  extractFullUrl (url) {
    log('extractFullUrl %s', url);

    if (/^https?:\/\//i.test(url)) {
      log('extractFullUrl pass = extract %s', url);

      return url;
    }
    if (/^\//.test(url)) {
      return chrome.extension.getURL(url);
    }

    let moduleLocation = (this.ptm ? `${this.ptm}\/${url}` : url);
    let extracted = `${this.protocol}:\/\/${this.host}\/${moduleLocation}`;

    log('extractFullUrl pass: %s extract %s', url, extracted);

    return extracted;
  }
};
