import { importEntry } from 'import-html-entry';
import { qkConfig } from './config';
import { getLogger } from './utils/logger';

const logger = getLogger('loader');

export const loadApp = async (app, lifecycles) => {
  logger.info('loadApp - app: %o', app);

  const { template, execScripts, assetPublicPath, getExternalScripts } = await importEntry(
    app.entry,
    qkConfig.importEntryOpts,
  );

  await getExternalScripts();

  return {
    async mount(...args) {
      logger.info('mount, args: %o', args);
      return 'mount';
    },
    async unmount() {
      logger.info('unmount');
    },
  };
};
