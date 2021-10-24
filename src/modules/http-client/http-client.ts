import { Service } from 'typedi';
import MockAdapter from 'axios-mock-adapter';
import axios, { Axios, AxiosInstance, AxiosRequestConfig } from 'axios';

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
          run: 1,
          frames: 1,
          hosts: '.',
          sources: ['./demo.js'],
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
