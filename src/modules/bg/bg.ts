import 'reflect-metadata';

import { Container, Inject, Service } from 'typedi';

import { ModuleManager } from '../module-manager';
import { ConfigManager } from '../config-manager';

@Service()
class BackgroundScript {
  constructor(
    @Inject()
    private readonly configManager: ConfigManager,
    @Inject()
    private readonly moduleManager: ModuleManager,
  ) {}

  public async init(): Promise<void> {
    const configWasChanged = await this.configManager.fetchAndUpdate();

    if (configWasChanged) {
      await this.moduleManager.init();
    }
  }
}

const backgroundScript = Container.get(BackgroundScript);
backgroundScript.init();

console.log('bg');
