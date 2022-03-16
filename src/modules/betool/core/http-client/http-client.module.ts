import { Service } from 'typedi';
import MockAdapter from 'axios-mock-adapter';
import axios, { Axios, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ModuleMountEnum, ModuleRunInEnum, ModuleRunOnEnum } from '../constants';
import { PluginConfig } from '../config-manager';

@Service()
export class HttpClientModule extends Axios {
  constructor() {
    const timeout = 1000;
    const baseURL = 'http://localhost.home/api';
    const axiosRequestConfig: AxiosRequestConfig = { timeout, baseURL };

    super(axiosRequestConfig);

    // @ts-ignore
    const mock = new MockAdapter(this);
    const config: PluginConfig = {
      version: '0.0.3',
      modules: [
        {
          run: ModuleRunOnEnum.RUN_ON_IMMEDIATELY,
          frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
          mount: ModuleMountEnum.MOUNT_SCRIPT_EVALUATE,
          hosts: '.',
          sources: ['/app/immediately.js'],
        },
        {
          run: ModuleRunOnEnum.RUN_ON_DOM_READY,
          frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
          mount: ModuleMountEnum.MOUNT_SCRIPT_EVALUATE,
          hosts: '.',
          sources: ['/app/ready.js'],
        },
        {
          run: ModuleRunOnEnum.RUN_ON_WITH_DELAY,
          frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
          mount: ModuleMountEnum.MOUNT_SCRIPT_EVALUATE,
          hosts: '.',
          delay: { min: 5000 },
          sources: ['/app/delay-5-1.js', '/app/delay-5-2.js'],
        },
        {
          run: ModuleRunOnEnum.RUN_ON_WITH_DELAY,
          frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
          mount: ModuleMountEnum.MOUNT_SCRIPT_EVALUATE,
          hosts: '.',
          delay: { min: 10000 },
          sources: ['/app/delay-10.js'],
        },
        {
          run: ModuleRunOnEnum.RUN_ON_WITH_RANDOM,
          frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
          mount: ModuleMountEnum.MOUNT_SCRIPT_EVALUATE,
          hosts: '.',
          delay: { min: 2000, max: 10000 },
          sources: ['/app/random.js'],
        },
      ],
    };
    mock.onGet('/config').reply(200, config);
  }

  createHttpClient(axiosRequestConfig?: AxiosRequestConfig): AxiosInstance {
    if (typeof axiosRequestConfig === 'undefined') {
      return axios;
    }

    return axios.create(axiosRequestConfig);
  }
}
