import type { PluginConfig } from '../config-service/interfaces';

import { Inject, Service } from 'typedi';
import { HttpClient } from '../http-client';

@Service()
export class ApiClient {
  constructor(
    @Inject()
    private readonly httpClient: HttpClient,
  ) {}

  public async configRead() {
    try {
      const { data } = await this.httpClient.get<PluginConfig>('config');
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
