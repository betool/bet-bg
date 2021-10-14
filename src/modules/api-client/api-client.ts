import { Service } from 'typedi';

@Service()
export class ApiClient {
  public async fetch() {
    return { version: '1.1.1' };
  }
}
