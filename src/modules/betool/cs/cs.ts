import 'reflect-metadata';

import { Container, Service } from 'typedi';
import { MessageReasonEnum } from '../constants';
import { ControllerMessage } from '../../message-controller/interfaces';

const message: ControllerMessage = {
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
