import { Service, Inject } from 'typedi';

import { ControllerMessage } from './interfaces';
import { MessageReasonEnum } from '../constants';
import { MessageService } from '../message-service';

@Service()
export class MessageController {
  constructor(
    @Inject()
    public readonly messageService: MessageService,
  ) {}
  public addListener() {
    console.log('addListener');
    chrome.runtime.onMessage.addListener(this.listenerHandler.bind(this));
  }

  private listenerHandler(
    message: ControllerMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ): boolean {
    console.log('listenerHandler message', message);
    console.log('listenerHandler sender', sender);

    if (typeof message?.reason !== 'number') {
      console.log('Unknown message', message);
    }

    switch (message?.reason) {
      case MessageReasonEnum.PING:
        this.messageService
          .ping()
          .then((response) => sendResponse(response))
          .catch((error) => {
            console.error(error);
            sendResponse({ error });
          });
        break;
      case MessageReasonEnum.GET_SOURCES:
        this.messageService
          .getSources(sender)
          .then((response) => sendResponse(response))
          .catch((error) => {
            console.error(error);
            sendResponse({ error });
          });
        break;
      default:
        console.log('Unknown reason', message?.reason);
        break;
    }

    return true;
  }
}
