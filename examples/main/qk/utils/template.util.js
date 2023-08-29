import once from 'lodash/once';
import snakeCase from 'lodash/snakeCase';
import { version, QIANKUN_HEAD_TAG_NAME, NATIVE_GLOBAL, ATTR_APP_INSTANCE_NAME_MAP } from '../config';

/**
 * get app instance name map
 */
const getGlobalAppInstanceMap = once(() => {
  if (!NATIVE_GLOBAL.hasOwnProperty(ATTR_APP_INSTANCE_NAME_MAP)) {
    Object.defineProperty(NATIVE_GLOBAL, ATTR_APP_INSTANCE_NAME_MAP, {
      enumerable: false,
      configurable: true,
      writable: true,
      value: {},
    });
  }

  return NATIVE_GLOBAL[ATTR_APP_INSTANCE_NAME_MAP];
});

/**
 * Get app instance name with the auto-increment approach
 * @param {string} appName - app 的名称
 * @returns {string}
 */
export function genAppInstanceIdByName(appName) {
  const globalAppInstanceMap = getGlobalAppInstanceMap();

  if (typeof globalAppInstanceMap[appName] === 'undefined') {
    globalAppInstanceMap[appName] = -1;
  }

  globalAppInstanceMap[appName] += 1;

  return `${appName}_${globalAppInstanceMap[appName]}`;
}

export function getWrapperId(name) {
  return `__qiankun_microapp_wrapper_for_${snakeCase(name)}__`;
}

/**
 * get default template wrapper
 * @param {string} name - app name
 * @param {object} sandboxOpts - sandbox options
 * @returns {callback}
 */
export function getDefaultTplWrapper(name, sandboxOpts = {}) {
  return (tpl) => {
    let tplWithSimulatedHead;

    if (tpl.indexOf('<head>') !== -1) {
      // We need to mock a head placeholder as native head element will be erased by browser in micro app
      tplWithSimulatedHead = tpl
        .replace('<head>', `<${QIANKUN_HEAD_TAG_NAME}>`)
        .replace('</head>', `</${QIANKUN_HEAD_TAG_NAME}>`);
    } else {
      // Some template might not be a standard html document, thus we need to add a simulated head tag for them
      tplWithSimulatedHead = `<${QIANKUN_HEAD_TAG_NAME}></${QIANKUN_HEAD_TAG_NAME}>${tpl}`;
    }

    const id = getWrapperId(name);
    const dataSandboxCfg = JSON.stringify(sandboxOpts);

    return `<div id="${id}" data-name="${name}" data-version="${version}" data-sandbox-cfg=${dataSandboxCfg}>${tplWithSimulatedHead}</div>`;
  };
}
