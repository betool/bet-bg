import 'reflect-metadata';

import { Container, Inject, Service } from 'typedi';

import { MessageManager } from '../message-manager';
import { ModuleManager } from '../module-manager';
import { ConfigManager } from '../config-manager';

@Service()
class BackgroundScript {
  constructor(
    @Inject()
    private readonly configManager: ConfigManager,
    @Inject()
    private readonly moduleManager: ModuleManager,
    @Inject()
    private readonly messageManager: MessageManager,
  ) {
    this.messageManager.addListener();
  }

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
