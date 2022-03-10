import 'reflect-metadata';

import { Container, Inject, Service } from 'typedi';

import { MessageController } from '../core/message-controller';
import { ModuleManager } from '../core/module-manager';
import { ConfigManager } from '../core/config-manager';

@Service()
class BackgroundScript {
  constructor(
    @Inject()
    private readonly configManager: ConfigManager,
    @Inject()
    private readonly moduleManager: ModuleManager,
    @Inject()
    private readonly messageController: MessageController,
  ) {
    this.messageController.addListener();
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