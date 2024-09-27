import { AxiosInstance } from 'axios';

import { isNotNull, isNull } from '../../../../helper/null';
import { ClientConfigError } from '../../error';

import { AxiosInstanceSource } from './source';

/**
 * Asserts that passed Axios instance has not been set yet
 *
 * @param axiosInstance Axios instance to assert not set
 * @param targetName Instance target name to use in assert message
 *
 * @category API
 */
export function assertAxiosInstanceNotSet(
  axiosInstance: AxiosInstance | undefined,
  targetName: string,
): asserts axiosInstance is undefined {
  if (isNotNull(axiosInstance)) {
    throw new ClientConfigError(`Axios instance has already been set for ${targetName}`);
  }
}

/**
 * Asserts that Axios instance can be assigned new source
 *
 * For success, instance should be not initialized yet or assigned same source
 *
 * @param axiosInstance Axios instance to assert assignment
 * @param instanceSource Source Axios instance was created from
 * @param assignSource Source to check Axios instance assignment against
 * @param targetName Instance target name to use in assert message
 *
 * @returns Boolean indicating whether new Axios instance should be created or not
 *
 * @category API
 */
export function assertAxiosInstanceAssign(
  axiosInstance: AxiosInstance | undefined,
  instanceSource: AxiosInstanceSource | undefined,
  assignSource: AxiosInstanceSource | undefined,
  targetName: string,
): boolean {
  if (isNull(axiosInstance)) {
    return true;
  }

  if (instanceSource !== assignSource) {
    throw new ClientConfigError(`Axios instance has already been set for ${targetName} with different source`);
  }

  return false;
}

/**
 * Asserts that passed Axios instance has already been set
 *
 * @param axiosInstance Axios instance to assert set
 * @param targetName Instance target name to use in assert message
 *
 * @category API
 */
export function assertAxiosInstanceSet(
  axiosInstance: AxiosInstance | undefined,
  targetName: string,
): asserts axiosInstance is AxiosInstance {
  if (isNull(axiosInstance)) {
    throw new ClientConfigError(`Axios instance has not been set for ${targetName}`);
  }
}
