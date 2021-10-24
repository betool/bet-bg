import { Service, Inject } from 'typedi';

import { HttpClient } from 'modules/http-client';
import { ConfigService } from 'modules/config-service';
import { StorageManager } from 'modules/storage-manager';

@Service()
export class ModuleManager {
  constructor(
    @Inject()
    private readonly httpClient: HttpClient,
    @Inject()
    private readonly configService: ConfigService,
    @Inject()
    private readonly storageManager: StorageManager,
  ) {}

  public async init(): Promise<void> {
    const config = await this.configService.read();

    if (Array.isArray(config.modules)) {
      for (const pluginModule of config.modules) {
        if (Array.isArray(pluginModule.sources)) {
          for (const source of pluginModule.sources) {
            await this.fetchAndStoreSource(source);
          }
        }
      }
    }
  }

  public async fetchAndStoreSource(source: string) {
    console.log(source);

    const sourceUrl: string = /^((https?)|(ftps?))/.test(source)
      ? source
      : // @ts-ignore
        `chrome-extension://${chrome.app.getDetails().id}/bg/bg.js`;

    console.log(sourceUrl);

    const client = this.httpClient.createHttpClient();
    const { data } = await client.get(sourceUrl);

    await this.storageManager.setItem(sourceUrl, data);
  }
}
