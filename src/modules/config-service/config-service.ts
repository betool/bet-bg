import type { PluginConfig } from './interfaces';

import { Service } from 'typedi';

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
  private readonly defaultConfigString: string;

  constructor() {
    this.defaultConfigString = JSON.stringify(this.defaultConfig);
  }

  public read(): PluginConfig {
    const configValue = window.localStorage.getItem(this.configKey) ?? this.defaultConfigString;

    let config: PluginConfig = this.defaultConfig;

    try {
      config = JSON.parse(configValue);
    } catch (error: unknown) {
      console.log('Config error', error);
    }

    console.log('read', config);

    return config;
  }

  public write(config: PluginConfig): void {
    console.log('write', config);
    const configValue = JSON.stringify(config);
    window.localStorage.setItem(this.configKey, configValue);
  }
}
