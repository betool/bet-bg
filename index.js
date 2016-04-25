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

    this.pid = app.pluginId;

    this.config = {
      local: app.localModules || ctor.array()
    };

    this.t = {
      e: app.errTimeout,
      n: app.timeout
    };

    this.location = {
      protocol: app.protocol,
      host: app.host,
      path: app.path,
      ptm: app.pathToModule,
      ptc: app.pathToConfig
    };

    this.modules = ctor.object();
    this.missingModules = ctor.object();
    this.talker = new Talker(this.pid);
    this.talker.addListener();

    this.config.all = this.getConfigurationFromCache();
  }


  load () {
    log('load');

    this.loadConfiguration(() => {
      this.loadModules(() => {
        this.setReady();
      });
    });
  }


  setReady (ready = true) {
    log('setReady', this);

    this.talker.ready = ready;
    this.talker.cfg = this.config.all;
    this.talker.modules = this.modules;

    for (propName in this.talker.onReadyCbs) {
      this.talker.onReadyCbs[propName]();
    }
  }


  loadConfiguration (cb) {
    log('loadConfiguration');

    let now = ctor.number(helper.getCurrentTime());

    if (this.config.all.ttl > now) {
      log(`ttl is OK ${this.config.all.ttl} > ${now}`);

      return cb();

      // return this.loadModulesFromCache(cb);
    }

    log(`ttl is BAD ${this.config.all.ttl} > ${now}`);

    this.loadConfigurationFromServer(cb);
  }


  loadConfigurationFromServer (cb) {
    log('loadConfigurationFromServer');

    this.talker.api.ajax.get(
      {
        url: `${this.location.protocol}:\/\/${this.location.host}/${this.location.ptc}`,
        parse: 'json'
      },
      res => {
        log('loadConfigurationFromServer res', res);

        if (res.err) {
          log('loadConfigurationFromServer res err', res.err);

          this.config.all.ttl = ctor.number(helper.getCurrentTime() + this.t.e);
          this.talker.api.localStorage.set(`${this.pid}ttl`, ctor.string(this.config.all.ttl));

          return cb();
        }

        let newConfiguration = res.value;

        log('loadConfigurationFromServer newConfiguration', newConfiguration);

        if (!newConfiguration) {
          log('loadConfigurationFromServer res.value is empty');

          this.config.all.ttl = ctor.number(helper.getCurrentTime() + this.t.e);
          this.talker.api.localStorage.set(`${this.pid}ttl`, ctor.string(this.config.all.ttl));

          log('loadConfigurationFromServer set err ttl', this.config.all.ttl);

          return cb();
        }

        let newConfigurationVersion = newConfiguration[0].v;
        newConfiguration = newConfiguration.concat(this.config.local);

        log('loadConfigurationFromServer newConfigurationVersion %d', newConfigurationVersion);

        if (newConfigurationVersion !== this.config.all.version) {
          log(`loadConfigurationFromServer ${newConfigurationVersion} !== ${this.config.all.version}`);

          let ttl = ctor.string(helper.getCurrentTime() + this.t.n);
          this.talker.api.localStorage.set(`${this.pid}ttl`, ttl);
          this.talker.api.localStorage.set(`${this.pid}cfg`, newConfiguration);

          log('loadConfigurationFromServer set ttl', ttl);

          this.config.all = this.getConfigurationFromCache();

          return cb();
        }

        log(`loadConfigurationFromServer ${newConfigurationVersion} === ${this.config.all.version}`);

        let ttl = ctor.string(helper.getCurrentTime() + this.t.n);
        this.talker.api.localStorage.set(`${this.pid}ttl`, ttl);

        log('loadConfigurationFromServer set ttl', ttl);

        return cb();
      }
    );
  }


  getConfigurationFromCache () {
    log('getConfigurationFromCache');

    let rawConfiguration = this.talker.api.localStorage.get(`${this.pid}cfg`);
    let configuration = helper.parseJson(rawConfiguration);

    if(!configuration) {
      configuration = new Configuration(null, this.config.local);
      this.talker.api.localStorage.set(`${this.pid}cfg`, configuration);
      this.talker.api.localStorage.set(`${this.pid}ttl`, 0);
      this.config.global = ctor.array(ctor.object({v: 0, k: ''}));
    } else {
      this.config.global = configuration;
      configuration = new Configuration(configuration, this.config.local);
    }

    return {
      key: configuration[0].k,
      ttl: ctor.number(this.talker.api.localStorage.get(`${this.pid}ttl`) || 0),
      version: configuration[0].v,
      modules: [],
      raw: configuration
    }
  }


  loadModules (cb) {
    this.loadModulesFromCache();
    this.loadModulesFromServer()
  }


  loadModulesFromServer (cb) {
    log('loadModulesFromServer');

    if (!this.missingModules.length) {
      return cb();
    }

    Promise.resolve()
      .then(() => {
        let modulesPromise = [];
        let __ttl = ctor.number(miss.ttl);

        this.missingModules.forEach((miss) => {
          // TODO !!!!
          if (
            !Number.isNaN(__ttl)
            &&
            (helper.getCurrentTime() + this.t.n) > __ttl
          ) {

          }

          modulesPromise.push(this.downloadModule(miss.url));
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

          return this.saveModuleToStorage(url, ctor.number(helper.getCurrentTime() + this.t.e))
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

  loadModulesFromCache () {
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
      let __ttl = ctor.number(module);
      let module = this.talker.api.localStorage.get(`${this.pid}${__key}`);

      if (Number.isNaN(__ttl) && typeof module === 'string') {
        log('loadModulesFromCache module from LS key: %s, len: %d', __key, module.length);

        this.modules[__key] = module;
      } else {
        log('loadModulesFromCache module from LS key: %s, value: %s', __key, module);

        this.missingModules.push(
          ctor.object({url: __key, ttl: __ttl})
        );
      }
    });
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

    let moduleLocation = (this.location.ptm ? `${this.location.ptm}\/${url}` : url);
    let extracted = `${this.location.protocol}:\/\/${this.location.host}\/${moduleLocation}`;

    log('extractFullUrl pass: %s extract %s', url, extracted);

    return extracted;
  }
};
