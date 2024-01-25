import mergeWith from 'lodash/mergeWith';
import concat from 'lodash/concat';
import { importEntry } from 'import-html-entry';
import { getLogger } from './utils/logger.util';
import { getDefaultTplWrapper, genAppInstanceIdByName } from './utils/template.util';
import { toArray, assertElementExist } from './utils/common.utils';
import { createElement, getContainer } from './utils/dom.util';
import { getMicroAppStateActions } from './global-state';
import { getAddOns } from './addons';

const logger = getLogger('loader');

const rawAppendChild = HTMLElement.prototype.appendChild;
const rawRemoveChild = HTMLElement.prototype.removeChild;

function execHooksChain(hooks, app, global = window) {
  if (hooks.length) {
    return hooks.reduce((chain, hook) => chain.then(() => hook(app, global)), Promise.resolve());
  }

  return Promise.resolve();
}

/**
 * Get the render function
 * If the legacy render function is provide, used as it, otherwise we will insert the app element to target container by qiankun
 * @param {string} appInstanceId
 * @param {string} appContent
 * @param legacyRender
 */
function getRender(appInstanceId, appContent, legacyRender) {
  const render = ({ element, loading, container }, phase) => {
    if (legacyRender) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          '[qiankun] Custom rendering function is deprecated and will be removed in 3.0, you can use the container element setting instead!',
        );
      }

      return legacyRender({ loading, appContent: element ? appContent : '' });
    }

    const containerElement = getContainer(container);

    // The container might have be removed after micro app unmounted.
    // Such as the micro app unmount lifecycle called by a react componentWillUnmount lifecycle, after micro app unmounted, the react component might also be removed
    if (phase !== 'unmounted') {
      const errorMsg = (() => {
        switch (phase) {
          case 'loading':
          case 'mounting':
            return `Target container with ${container} not existed while ${appInstanceId} ${phase}!`;

          case 'mounted':
            return `Target container with ${container} not existed after ${appInstanceId} ${phase}!`;

          default:
            return `Target container with ${container} not existed while ${appInstanceId} rendering!`;
        }
      })();
      assertElementExist(containerElement, errorMsg);
    }

    if (containerElement && !containerElement.contains(element)) {
      // clear the container
      while (containerElement.firstChild) {
        rawRemoveChild.call(containerElement, containerElement.firstChild);
      }

      // append the element to container if it exist
      if (element) {
        rawAppendChild.call(containerElement, element);
      }
    }

    return undefined;
  };

  return render;
}

export const loadApp = async (app, configuration, lifecycles) => {
  logger.info('loadApp - app: %o, lifecycles: %o', app, lifecycles);

  const {
    singular = false,
    sandbox = true,
    excludeAssetFilter,
    globalContext = window,
    ...importEntryOpts
  } = configuration;

  let global = globalContext;

  const importResult = await importEntry(app.entry, importEntryOpts);
  logger.info('loadApp - importResult: %o', importResult);

  const { template, execScripts, assetPublicPath, getExternalScripts } = importResult;

  await getExternalScripts();

  const appInstanceId = genAppInstanceIdByName(app.name);
  logger.info('loadApp - appInstanceId: %s', appInstanceId);

  const appContent = getDefaultTplWrapper(appInstanceId)(template);
  logger.info('loadApp - appContent: %s', appContent);

  const strictStyleIsolation = false;
  const scopedCSS = true;

  let initialAppWrapperElement = createElement(appContent, strictStyleIsolation, scopedCSS, appInstanceId);
  logger.info('loadApp - initialAppWrapperElement: %o', initialAppWrapperElement);

  // const container = document.querySelector('#subapp-viewport');
  // while (container.firstChild) {
  //   container.removeChild(container.firstChild);
  // }
  // container.appendChild(initialAppWrapperElement);
  const render = getRender(appInstanceId, appContent, app.render);
  // 第一次加载设置应用可见区域 dom 结构
  // 确保每次应用加载前容器 dom 结构已经设置完毕
  render({ element: initialAppWrapperElement, loading: true, container: app.container }, 'loading');

  const {
    beforeUnmount = [],
    afterUnmount = [],
    afterMount = [],
    beforeMount = [],
    beforeLoad = [],
  } = mergeWith({}, getAddOns(global, assetPublicPath), lifecycles, (v1, v2) => concat(v1 ?? [], v2 ?? []));

  await execHooksChain(toArray(beforeLoad), app, global);

  const scriptExports = await execScripts();
  logger.info('scriptExports: %o', scriptExports);

  const { bootstrap, mount } = scriptExports;
  const { onGlobalStateChange, setGlobalState, offGlobalStateChange } = getMicroAppStateActions(appInstanceId);

  const appWrapperGetter = () => initialAppWrapperElement;

  const ret = {
    unmount: [
      async (props) => {
        logger.info('unmount, props: %o', props);
      },
    ],

    bootstrap,

    mount: [
      async (props) => {
        logger.info('[hook mount] - prev mount, props: %o', props);
      },
      // exec the chain after rendering to keep the behavior with beforeLoad
      async () => execHooksChain(toArray(beforeMount), app, global),
      async (props) => {
        const mountProps = { ...props, container: appWrapperGetter(), setGlobalState, onGlobalStateChange };
        logger.info('[hook mount] - mountProps: %o', mountProps);
        mount(mountProps);
      },
      // finish loading after app mounted
      // async () => render({ element: appWrapperElement, loading: false, container: remountContainer }, 'mounted'),
      async () => {
        // const container = document.querySelector('#subapp-viewport');
        // while (container.firstChild) {
        //   container.removeChild(container.firstChild);
        // }
        // container.appendChild(initialAppWrapperElement);
      },
      async () => execHooksChain(toArray(afterMount), app, global),
    ],
  };

  return ret;
};
