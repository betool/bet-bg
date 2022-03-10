import { MessageReasonEnum } from '../constants';

export interface ControllerMessage {
  readonly reason: MessageReasonEnum;
  // TODO: Add generic
  readonly payload?: unknown;
}
