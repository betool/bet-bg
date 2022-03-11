import { Service, Inject } from 'typedi';

import { MessageReasonEnum } from '../constants';
import { BackgroundMessage } from './interfaces';
import { BackgroundMessangerService } from './background-messanger.service';

@Service()
export class BackgroundMessangerModule {
  constructor(
    @Inject()
    public readonly backgroundMessangerService: BackgroundMessangerService,
  ) {}
  public addListener() {
    chrome.runtime.onMessage.addListener(this.listenerHandler.bind(this));
  }

  private listenerHandler(
    message: BackgroundMessage,
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
        this.backgroundMessangerService
          .ping()
          .then((response) => sendResponse(response))
          .catch((error) => {
            console.error(error);
            sendResponse({ error });
          });
        break;
      case MessageReasonEnum.GET_SOURCES:
        this.backgroundMessangerService
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
