import { Service, Inject } from 'typedi';

import { BetMessage } from '../interfaces';
import { MessageReasonEnum } from '../../constants';
import { BackgroundMessengerService } from './background-messenger.service';

@Service()
export class BackgroundMessengerModule {
  constructor(
    @Inject()
    public readonly backgroundMessengerService: BackgroundMessengerService,
  ) {}
  public addListener() {
    chrome.runtime.onMessage.addListener(this.listenerHandler.bind(this));
  }

  private listenerHandler(
    message: BetMessage,
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
        this.backgroundMessengerService
          .ping()
          .then((response) => sendResponse(response))
          .catch((error) => {
            console.error(error);
            sendResponse({ error });
          });
        break;
      case MessageReasonEnum.GET_SOURCES:
        this.backgroundMessengerService
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
