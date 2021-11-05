import { MessageReasonEnum } from 'modules/constants';
import { ExtensionMessage } from 'modules/message-manager/interfaces';

console.log('cs');

const message: ExtensionMessage = {
  reason: MessageReasonEnum.PING,
};
chrome.runtime.sendMessage(null, message, null, (data) => console.log('cb', data));
