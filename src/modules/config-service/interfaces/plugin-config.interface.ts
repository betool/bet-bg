import type { PluginModule } from './plugin-module.interface';

export interface PluginConfig {
  readonly version: string;
  readonly modules: Array<PluginModule>;
}
