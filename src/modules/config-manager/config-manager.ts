import { Service, Inject } from 'typedi';
import { ApiClient } from 'modules/api-client';
import { ConfigService } from 'modules/config-service';

@Service()
export class ConfigManager {
  constructor(
    @Inject()
    private readonly apiClient: ApiClient,
    @Inject()
    private readonly configService: ConfigService,
  ) {}

  public async fetchAndUpdate() {
    const remoteConfig = await this.apiClient.configRead();
    const localConfig = this.configService.read();

    if (localConfig.version !== remoteConfig.version) {
      // TODO: rm ignore, fix type
      // @ts-ignore
      this.configService.write(remoteConfig);
    }
  }
}
