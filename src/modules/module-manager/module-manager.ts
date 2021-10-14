import { Service, Inject } from 'typedi';

import { ApiClient } from 'modules/api-client';
import { ConfigService } from 'modules/config-service';

@Service()
export class ModuleManager {
  constructor(
    @Inject()
    private readonly apiClient: ApiClient,
    @Inject()
    private readonly configService: ConfigService,
  ) {}

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
