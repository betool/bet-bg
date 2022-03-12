import { Service } from 'typedi';

import { BetMessage } from '../interfaces';
import { MessageReasonEnum } from '../../constants';

@Service()
export class ContentMessengerModule {
  public sendMessage(message: BetMessage): Promise<unknown> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (data: unknown) => resolve(data));
    });
  }

  public getSources() {
    const message: BetMessage = { reason: MessageReasonEnum.GET_SOURCES };
    return this.sendMessage(message);
  }
}
