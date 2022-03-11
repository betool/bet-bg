import type { PluginConfig } from './interfaces';

import { Inject, Service } from 'typedi';
import { ConfigManagerRepository } from './config-manager.repository';
import { ModuleRunInEnum, ModuleRunOnEnum } from '../../constants';

const DEFAULT_CONFIG: PluginConfig = {
  version: '0.0.1',
  modules: [
    {
      run: ModuleRunOnEnum.RUN_ON_IMMEDIATELY,
      frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
      hosts: '.',
      sources: ['./demo.js'],
    },
  ],
};

@Service()
export class ConfigManagerService {
  private readonly configKey: string = 'CONFIG_KEY';
  private readonly defaultConfig: PluginConfig = DEFAULT_CONFIG;

  constructor(
    @Inject()
    private readonly configManagerRepository: ConfigManagerRepository,
  ) {}

  public async read(): Promise<PluginConfig> {
    let config: PluginConfig = this.defaultConfig;

    try {
      const configFromStorage = await this.configManagerRepository.getItem<PluginConfig>(this.configKey);
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
    await this.configManagerRepository.setItem(this.configKey, config);
    console.log('write', config);
  }
}
