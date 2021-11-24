import { Service } from 'typedi';
import MockAdapter from 'axios-mock-adapter';
import axios, { Axios, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ModuleRunInEnum, ModuleRunOnEnum } from '../constants';

@Service()
export class HttpClient extends Axios {
  constructor() {
    const timeout = 1000;
    const baseURL = 'http://localhost.home/api';
    const axiosRequestConfig: AxiosRequestConfig = { timeout, baseURL };

    super(axiosRequestConfig);

    // @ts-ignore
    const mock = new MockAdapter(this);
    const config = {
      version: '0.0.2',
      modules: [
        {
          run: ModuleRunOnEnum.RUN_ON_IMMEDIATELY,
          frames: ModuleRunInEnum.RUN_IN_EVERYWHERE,
          hosts: '.',
          sources: ['/bg/bg.js'],
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
