import 'reflect-metadata';

import { Container, Inject, Service } from 'typedi';

import { BackgroundMessangerModule } from '../core/background-messanger';
import { ConfigManagerModule } from '../core/config-manager';
import { SourceManagerModule } from '../core/source-manager';

@Service()
class BackgroundScript {
  constructor(
    @Inject()
    private readonly sourceManager: SourceManagerModule,
    @Inject()
    private readonly configManager: ConfigManagerModule,
    @Inject()
    private readonly backgroundMessanger: BackgroundMessangerModule,
  ) {
    this.backgroundMessanger.addListener();
  }

  public async init(): Promise<void> {
    const configWasChanged = await this.configManager.fetchAndUpdate();

    if (configWasChanged) {
      await this.sourceManager.init();
    }
  }
}

const backgroundScript = Container.get(BackgroundScript);
backgroundScript.init();

console.log('bg');
