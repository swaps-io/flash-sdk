import { AxiosInstance } from 'axios';

import { assertAxiosInstanceAssign, assertAxiosInstanceSet } from './core/assert';
import { AxiosClient } from './core/client';
import { createAxiosInstance } from './core/factory';
import { AxiosInstanceSource } from './core/source';

const TARGET_NAME = 'crypto API (v0)';

let axiosInstance: AxiosInstance | undefined;
let instanceSource: AxiosInstanceSource | undefined;

export const setAxiosInstanceCryptoV0 = (source: AxiosInstanceSource): void => {
  if (assertAxiosInstanceAssign(axiosInstance, instanceSource, source, TARGET_NAME)) {
    axiosInstance = createAxiosInstance(source);
    instanceSource = source;
  }
};

export const axiosClientCryptoV0: AxiosClient = (config, options) => {
  assertAxiosInstanceSet(axiosInstance, TARGET_NAME);
  return axiosInstance.request({ ...config, ...options });
};
