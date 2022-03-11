import { MessageReasonEnum } from '../../../constants';

export interface BackgroundMessage {
  readonly reason: MessageReasonEnum;
  // TODO: Add generic
  readonly payload?: unknown;
}
