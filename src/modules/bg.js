import Logger from 'bet-logger';
import Brex from '../..';


const log = new Logger('Brex:bg');

if(chrome.runtime.onMessage) {
  log('bg script start');

  var brex = new Brex({
    protocol : 'http',
    host: 'localhost:8080',
    pathToConfig: 'config.json',
    pathToModule: '',
    path: '/',
    timeout: 3000,
    errTimeout: 30000,
    pluginId: 'plugin1',
    localModules: [{
      f: 0,
      r: 0,
      h: '.+',
      a: 1,
      l: ['/module.js']
    }]
  });

  brex.load();
  chrome.contextMenus.create(
    {
      title: 'Установить обои',
      contexts: ['image'],
      onclick: setWallpaper
    }
  );

  function setWallpaper (info) {
    brex.talker.api.localStorage.set(`plugin1d2wp`, info.srcUrl);
  }
}
