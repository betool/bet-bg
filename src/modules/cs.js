'use strict';

import BetCs from 'bet-cs';

if (chrome.runtime.onMessage) {
  console.log('cs script start');
  const betBg = new BetCs();
  betBg.load();
}
