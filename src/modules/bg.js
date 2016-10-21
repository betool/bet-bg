'use strict';

// import Logger from 'bet-logger';
import BetBg from '../..';


// const log = new Logger('BET:bg');

if (chrome.runtime.onMessage) {
  console.log('bg script start');
  new BetBg().run();
}
