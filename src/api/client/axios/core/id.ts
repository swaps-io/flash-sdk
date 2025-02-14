import { AxiosRequestConfig } from 'axios';

import { generateRandomId } from '../../../../helper/random';
import { ClientConfigError } from '../../error';

const PROJECT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const REQUEST_ID_HEADER = 'X-Request-ID';

let requestProjectId: string | undefined;
let requestIdPrefix: string | undefined;
const codeCounters: Record<string, number | undefined> = {};

export const setRequestProjectId = (projectId: string): void => {
  if (requestProjectId) {
    if (requestProjectId !== projectId) {
      throw new ClientConfigError(`Project ID has already been set to "${requestProjectId}"`);
    }
    return;
  }

  if (!PROJECT_ID_PATTERN.test(projectId)) {
    throw new ClientConfigError(`Project ID doesn't match "${PROJECT_ID_PATTERN}" pattern`);
  }

  const sessionId = generateRandomId(8);
  requestIdPrefix = `${projectId}:${sessionId}`;
  requestProjectId = projectId;
};

export const addRequestIdHeader = (code: string, config: AxiosRequestConfig): void => {
  if (!requestIdPrefix) {
    return;
  }

  const counter = codeCounters[code] ?? 0;
  codeCounters[code] = counter + 1;
  const requestIdHeader = `${requestIdPrefix}:${code}:${counter}`;

  const headers = config.headers ?? {};
  headers[REQUEST_ID_HEADER] = requestIdHeader;
  config.headers = headers;
};
