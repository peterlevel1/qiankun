import { importEntry } from 'import-html-entry';
import { qkConfig } from './config';
import { getLogger } from './utils/logger.util';
import { getDefaultTplWrapper, genAppInstanceIdByName } from './utils/template.util';
import { createElement } from './utils/dom.util';

const logger = getLogger('loader');

export const loadApp = async (app, lifecycles) => {
  logger.info('loadApp - app: %o', app);

  return {
    mount: [
      async (props) => {
        logger.info('prev mount, props: %o', props);
      },
      async (props) => {
        logger.info('mount, props: %o', props);

        const { template, execScripts, assetPublicPath, getExternalScripts } = await importEntry(
          app.entry,
          qkConfig.importEntryOpts,
        );

        logger.info('1');

        await getExternalScripts();

        logger.info('2 - template: %s', template);

        const appInstanceId = genAppInstanceIdByName(app.name);
        const appContent = getDefaultTplWrapper(appInstanceId)(template);
        const strictStyleIsolation = false;
        const scopedCSS = true;

        let initialAppWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);

        logger.info('initialAppWrapperElement: %o', initialAppWrapperElement);
      },
    ],
    unmount: [
      async (props) => {
        logger.info('unmount, props: %o', props);
      },
    ],
  };
};
