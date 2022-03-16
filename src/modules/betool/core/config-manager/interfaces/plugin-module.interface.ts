import { ModuleRunOnEnum, ModuleRunInEnum, ModuleMountEnum } from '../../constants';

export interface MillisecondsDelay {
  // If only min specified - work as random
  // If min,max specified - work as delay
  min: number;
  max?: number;
}
export interface PluginModule {
  run: ModuleRunOnEnum;
  frames: ModuleRunInEnum;
  mount: ModuleMountEnum;
  hosts: string;
  sources: Array<string>;
  delay?: MillisecondsDelay;
}
