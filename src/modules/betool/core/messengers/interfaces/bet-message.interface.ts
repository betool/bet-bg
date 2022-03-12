import { MessageReasonEnum } from '../../constants';

export interface BetMessage {
  readonly reason: MessageReasonEnum;
  // TODO: Add generic
  readonly payload?: unknown;
}
