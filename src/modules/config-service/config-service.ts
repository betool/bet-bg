import type { PluginConfig } from './interfaces';

import { Inject, Service } from 'typedi';
import { StorageManager } from 'modules/storage-manager';

const DEFAULT_CONFIG: PluginConfig = {
  version: '0.0.1',
  modules: [
    {
      run: 1,
      frames: 1,
      hosts: '.',
      sources: ['./demo.js'],
    },
  ],
};

@Service()
export class ConfigService {
  private readonly configKey: string = 'CONFIG_KEY';
  private readonly defaultConfig: PluginConfig = DEFAULT_CONFIG;

  constructor(
    @Inject()
    private readonly storageManager: StorageManager,
  ) {}

  public async read(): Promise<PluginConfig> {
    let config: PluginConfig = this.defaultConfig;

    try {
      const configFromStorage = await this.storageManager.getItem<PluginConfig>(this.configKey);
      if (configFromStorage !== null) {
        config = configFromStorage;
      }
    } catch (error) {
      console.log('Config error', error);
    }

    console.log('read', config);

    return config;
  }

  public async write(config: PluginConfig): Promise<void> {
    await this.storageManager.setItem(this.configKey, config);
    console.log('write', config);
  }
}
