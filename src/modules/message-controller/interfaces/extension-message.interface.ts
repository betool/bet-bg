import { MessageReasonEnum } from 'modules/constants';

export interface ControllerMessage {
  readonly reason: MessageReasonEnum;
  // TODO: Add generic
  readonly payload?: unknown;
}
