import { registerApplication, start as singleSpaStart } from 'single-spa';
import { getLogger } from './utils/logger.util';
import { loadApp } from './loader';

const logger = getLogger('apis');
const appsRegistered = [];

export const registerMicroApps = (apps, lifecycles) => {
  for (const app of apps) {
    const found = !!appsRegistered.find((loadedApp) => loadedApp.name === app.name);

    if (found) {
      continue;
    }
    logger.info('app: %o', app);

    const opts = {
      name: app.name,
      customerProps: app.props,
      activeWhen(loc) {
        return loc.pathname.startsWith(app.activeRule);
      },
      async app() {
        logger.info('%s - loadingFn called', app.name);
        const loadedResult = await loadApp(app, lifecycles);
        logger.info('loadedResult: %o', loadedResult);
        return loadedResult;
      },
    };

    registerApplication(opts.name, opts.app, opts.activeWhen, opts.customerProps);

    appsRegistered.push(app);
  }
};

export const start = () => {
  singleSpaStart();
};
