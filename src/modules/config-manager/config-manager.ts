import { ApiClient } from 'modules/api-client';
import { ConfigService } from 'modules/config-service';

export class ConfigManager {
  constructor(private readonly apiClient: ApiClient, private readonly configService: ConfigService) {}

  public async fetchAndUpdate() {
    const remoteConfig = await this.apiClient.fetch();
    const localConfig = this.configService.read();

    if (localConfig.version !== remoteConfig.version) {
      this.configService.write(remoteConfig);
    }
  }
}
