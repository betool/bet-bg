import { MessageReasonEnum } from '../constants';
import { ControllerMessage } from '../message-controller/interfaces';

console.log('cs');

const message: ControllerMessage = {
  reason: MessageReasonEnum.GET_SOURCES,
};
chrome.runtime.sendMessage(null, message, null, (data) => {
  const scriptTag = document.createElement('script');
  scriptTag.type = 'text/javascript';
  scriptTag.text = data[0];
  document.body.appendChild(scriptTag);
});
