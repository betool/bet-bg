/// <reference types="chrome"/>

import { ApiClient } from '../api-client';
import { ModuleManager } from '../module-manager';
import { ConfigManager } from '../config-manager';
import { ConfigService } from '../config-service';

class BackgroundScript {
  private readonly configManager: ConfigManager;
  private readonly moduleManager: ModuleManager;

  constructor() {
    const apiClient = new ApiClient();
    const configService = new ConfigService();
    this.configManager = new ConfigManager(apiClient, configService);
    this.moduleManager = new ModuleManager(apiClient, configService);
  }

  public async init(): Promise<void> {
    await this.configManager.fetchAndUpdate();
    await this.moduleManager.init();
  }
}

const backgroundScript = new BackgroundScript();
backgroundScript.init();

console.log('bg');
