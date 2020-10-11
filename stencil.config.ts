import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'autocomplete-light',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'dist',
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ]
};
