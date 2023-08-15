import { registerApplication, start as singleSpaStart } from 'single-spa';
import { getLogger } from './utils/logger';
import { loadApp } from './loader';

const logger = getLogger('apis');
const loadedApps = [];

export const registerMicroApps = (apps, lifecycles) => {
  for (const app of apps) {
    const found = !!loadedApps.find((loadedApp) => loadedApp.name === app.name);

    if (found) {
      continue;
    }
    logger.info('app: %o', app);

    const activeWhen = (loc) => loc.pathname.startsWith(app.activeRule);

    const loader = async () => {
      logger.info('%s - loadingFn called', app.name);
      const loadedResult = await loadApp(app, lifecycles);
      logger.info('loadedResult: %o', loadedResult);
      return loadedResult;
    };

    registerApplication(app.name, loader, activeWhen, app.props);

    loadedApps.push(app);
  }
};

export const start = () => {
  singleSpaStart();
};
