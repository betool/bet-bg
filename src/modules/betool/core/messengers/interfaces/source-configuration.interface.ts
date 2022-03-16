import { MillisecondsDelay } from '../../config-manager';
import { ModuleMountEnum } from '../../constants';

export interface SourceConfiguration {
  sources: Array<string>;
  mount: ModuleMountEnum;
  delay?: MillisecondsDelay;
}
