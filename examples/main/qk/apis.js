import { registerApplication, start as singleSpaStart } from 'single-spa';
import noop from 'lodash/noop';
import { getLogger } from './utils/logger.util';
import { loadApp } from './loader';

const logger = getLogger('apis');
const appsRegistered = [];

let frameworkConfiguration = {};

export const registerMicroApps = (apps, lifecycles) => {
  logger.info('registerMicroApps - apps: %o, lifecycles: %o', apps, lifecycles);

  for (const app of apps) {
    const found = !!appsRegistered.find((loadedApp) => loadedApp.name === app.name);

    if (found) {
      continue;
    }

    if (!app.loader) app.loader = noop;

    const opts = {
      name: app.name,
      customerProps: app.props,
      activeWhen(loc) {
        return loc.pathname.startsWith(app.activeRule);
      },
      async app() {
        return await loadApp(app, frameworkConfiguration, lifecycles);
      },
    };

    registerApplication(opts.name, opts.app, opts.activeWhen, opts.customerProps);

    appsRegistered.push(app);
  }
};

export const start = () => {
  singleSpaStart();
};
