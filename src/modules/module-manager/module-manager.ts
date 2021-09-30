import { ApiClient } from 'modules/api-client';
import { ConfigService } from 'modules/config-service';

export class ModuleManager {
  constructor(private readonly apiClient: ApiClient, private readonly configService: ConfigService) {}

  public async init() {
    const config = this.configService.read();

    if (Array.isArray(config.modules)) {
      for (const pluginModule of config.modules) {
        if (Array.isArray(pluginModule.sources)) {
          for (const source of pluginModule.sources) {
            // TODO: Implement api client methods
            // TODO: Implement LocalStorage wrapper
            await this.apiClient.fetch();
          }
        }
      }
    }
  }
}
