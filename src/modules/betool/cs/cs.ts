import type { BackgroundMessage } from '../core/background-messanger';

import 'reflect-metadata';
import { Container, Service } from 'typedi';
import { MessageReasonEnum } from '../core/constants';

const message: BackgroundMessage = {
  reason: MessageReasonEnum.GET_SOURCES,
};

@Service()
class ContentScript {
  public async init(): Promise<void> {
    chrome.runtime.sendMessage(null, message, null, (data) => {
      const scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = data[0];
      document.body.appendChild(scriptTag);
    });
  }
}

const contentScript = Container.get(ContentScript);
contentScript.init();

console.log('cs');
