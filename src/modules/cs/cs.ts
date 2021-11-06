import { MessageReasonEnum } from 'modules/constants';
import { ControllerMessage } from 'modules/message-controller/interfaces';

console.log('cs');

const message: ControllerMessage = {
  reason: MessageReasonEnum.PING,
};
chrome.runtime.sendMessage(null, message, null, (data) => console.log('cb', data));
