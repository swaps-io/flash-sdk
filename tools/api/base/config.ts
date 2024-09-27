import { camel } from '@orval/core';
import { defineConfig } from 'orval';

export interface OrvalConfigParams {
  suffix: string;
  target: string;
}

export const orvalConfig = (params: OrvalConfigParams) => {
  const config = defineConfig({
    [`api:${params.target}`]: {
      input: './spec.json',
      output: {
        target: `../../../src/api/gen/${params.target}.ts`,
        client: 'axios-functions',
        prettier: true,
        override: {
          mutator: {
            path: `../../../src/api/client/axios/${params.target}.ts`,
            name: `axiosClient${params.suffix}`,
          },
          components: {
            schemas: {
              suffix: params.suffix,
            },
          },
          operationName: (operation, route, verb) => {
            if (!operation.operationId) {
              throw new Error(`Operation ID must be set (${verb.toUpperCase()} "${route}")`);
            }

            const name = camel(operation.operationId) + params.suffix;
            return name;
          },
        },
      },
    },
  });
  return config;
};
