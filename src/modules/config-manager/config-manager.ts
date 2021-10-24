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

  public async fetchAndUpdate(): Promise<boolean> {
    const remoteConfig = await this.apiClient.configRead();
    const localConfig = await this.configService.read();

    const configWasChanged = localConfig.version !== remoteConfig.version;

    if (configWasChanged) {
      await this.configService.write(remoteConfig);
    }

    return configWasChanged;
  }
}
