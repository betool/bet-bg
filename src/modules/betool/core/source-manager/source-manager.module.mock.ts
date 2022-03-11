import { Service } from 'typedi';

@Service()
export class SourceManagerModuleMock {
  public getSource: any = jest.fn().mockResolvedValue('(()=>{a=1;})()');
}
