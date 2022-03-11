import type { PluginConfig } from '../../core/config-manager/interfaces';

import { Inject, Service } from 'typedi';
import { HttpClientModule } from '../../core/http-client';

@Service()
export class ApiClient {
  constructor(
    @Inject()
    private readonly httpClient: HttpClientModule,
  ) {}

  public async configRead(): Promise<PluginConfig> {
    try {
      const { data } = await this.httpClient.get<PluginConfig>('config');
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
