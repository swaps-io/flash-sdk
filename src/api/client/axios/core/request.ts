import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { addRequestIdHeader } from './id';

export const requestAxiosInstance = <T>(
  instance: AxiosInstance,
  code: string,
  config: AxiosRequestConfig,
  options: AxiosRequestConfig | undefined,
): Promise<AxiosResponse<T>> => {
  config = { ...config, ...options };
  addRequestIdHeader(code, config);
  return instance.request(config);
};
