import { Service } from 'typedi';

@Service()
export class ApiClientModuleMock {
  public read: any = jest.fn();
}
