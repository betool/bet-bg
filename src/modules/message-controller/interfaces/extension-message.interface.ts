import { MessageReasonEnum } from 'modules/constants';

export interface ExtensionMessage {
  readonly reason: MessageReasonEnum;
  // TODO: Add generic
  readonly payload?: unknown;
}
