import type { PluginModule } from './plugin-module.interface';

export interface PluginConfig {
  version: string;
  modules: Array<PluginModule>;
}
