import { ModuleRunOnEnum, ModuleRunInEnum } from '../../constants';

export interface PluginModule {
  run: ModuleRunOnEnum;
  frames: ModuleRunInEnum;
  hosts: string;
  sources: Array<string>;
}
