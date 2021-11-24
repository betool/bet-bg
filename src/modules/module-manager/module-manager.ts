import { Service, Inject } from 'typedi';
import extensionizer from 'extensionizer';

import { HttpClient } from '../http-client';
import { ConfigService } from '../config-service';
import { StorageManager } from '../storage-manager';

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

    /**
     * TODO: Implement
     * | {http,ftp}s? | - direct
     * | /some/path.js | - related chrome-extension
     * | some/path.js | - related static-server
     */
    const sourceUrl: string = /^((https?)|(ftps?))/.test(source) ? source : extensionizer.runtime.getURL(source);

    console.log(sourceUrl);

    const client = this.httpClient.createHttpClient();
    const { data } = await client.get(sourceUrl);

    await this.storageManager.setItem(sourceUrl, data);
  }

  public getSource(source: string): Promise<string | null> {
    const sourceUrl: string = /^((https?)|(ftps?))/.test(source) ? source : extensionizer.runtime.getURL(source);
    return this.storageManager.getItem<string>(sourceUrl);
  }
}
