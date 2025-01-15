import { AxiosInstance } from 'axios';

import { assertAxiosInstanceAssign, assertAxiosInstanceSet } from './core/assert';
import { AxiosClient } from './core/client';
import { createAxiosInstance } from './core/factory';
import { requestAxiosInstance } from './core/request';
import { AxiosInstanceSource } from './core/source';

const TARGET_NAME = 'collateral API (v0)';
const TARGET_CODE = 'o';

let axiosInstance: AxiosInstance | undefined;
let instanceSource: AxiosInstanceSource | undefined;

export const setAxiosInstanceCollateralV0 = (source: AxiosInstanceSource): void => {
  if (assertAxiosInstanceAssign(axiosInstance, instanceSource, source, TARGET_NAME)) {
    axiosInstance = createAxiosInstance(source);
    instanceSource = source;
  }
};

export const axiosClientCollateralV0: AxiosClient = (config, options) => {
  assertAxiosInstanceSet(axiosInstance, TARGET_NAME);
  return requestAxiosInstance(axiosInstance, TARGET_CODE, config, options);
};
