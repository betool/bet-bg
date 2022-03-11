import { Service } from 'typedi';
import { PluginConfig } from './interfaces';
import { ModuleRunInEnum, ModuleRunOnEnum } from '../../constants';

const defaultConfig: PluginConfig = {
  version: '0.0.1',
  modules: [
    {
      run: ModuleRunOnEnum.RUN_ON_IMMEDIATELY,
      frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
      hosts: '.',
      sources: ['./a.js'],
    },
  ],
};

export const MockValues = {
  config: defaultConfig,
};
export const MockHandlers = {
  read: jest.fn().mockResolvedValue(MockValues.config),
};

@Service()
export class ConfigManagerServiceMock {
  public read = MockHandlers.read;
}
