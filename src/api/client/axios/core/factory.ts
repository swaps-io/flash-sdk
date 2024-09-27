import Axios, { AxiosInstance, ParamsSerializerOptions } from 'axios';
import qs from 'qs';

import { isNull } from '../../../../helper/null';
import { normalizeBaseUrl } from '../../transform';

import { AxiosInstanceSource } from './source';

const paramsSerializer: ParamsSerializerOptions = {
  serialize: (params: unknown): string => {
    return qs.stringify(params, { indices: false });
  },
};

const createAxiosInstanceFromBaseUrl = (baseUrl: string | undefined): AxiosInstance => {
  const baseURL = normalizeBaseUrl(baseUrl);
  const axiosInstance = Axios.create({ baseURL, paramsSerializer });
  return axiosInstance;
};

/**
 * Creates a new Axios instance from {@link AxiosInstanceSource}
 *
 * @param source Source to create Axios instance from
 *
 * @returns New Axios instance
 *
 * @category API
 */
export const createAxiosInstance = (source: AxiosInstanceSource): AxiosInstance => {
  let axiosInstance: AxiosInstance;
  if (isNull(source) || typeof source === 'string') {
    axiosInstance = createAxiosInstanceFromBaseUrl(source);
  } else {
    axiosInstance = source;
  }
  return axiosInstance;
};
