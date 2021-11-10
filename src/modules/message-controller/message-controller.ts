import { MessageReasonEnum } from 'modules/constants';
import { Service } from 'typedi';

import { ControllerMessage } from './interfaces';

@Service()
export class MessageController {
  public async addListener() {
    console.log('addListener');
    chrome.runtime.onMessage.addListener(this.listenerHandler);
  }

  private listenerHandler(
    message: ControllerMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): boolean {
    console.log('listenerHandler message', message);
    console.log('listenerHandler sender', sender);

    if (typeof message?.reason !== 'string') {
      console.log('Unknown message', message);
    }

    switch (message?.reason) {
      case MessageReasonEnum.PING:
        console.log('Message PING');
        sendResponse('PONG');
        break;
      default:
        console.log('Unknown reason', message?.reason);
        break;
    }

    return true;
  }
}