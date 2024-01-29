import forEach from 'lodash/forEach';
import { supportShadowDOM } from './supports.util';
import { NATIVE_DOCUMENT, QIANKUN_CSS_REWRITE_ATTR } from '../config';
import { css } from '../sandbox';
import { getLogger } from '../utils/logger.util';

const logger = getLogger('examples/main/qk/utils/dom.util.js');

/**
 * @param {string | HTMLElement} container
 * @returns {HTMLElement | null}
 */
export function getContainer(container) {
  return typeof container === 'string' ? document.querySelector(container) : container;
}

/**
 * create element
 * @param {string} appContent
 * @param {boolean} strictStyleIsolation
 * @param {boolean} scopedCSS
 * @param {string} appInstanceId
 * @returns {HTMLElement}
 */
export function createElement(appContent, strictStyleIsolation = false, scopedCSS = true, appInstanceId) {
  logger.info(
    'createElement - strictStyleIsolation: %s, scopedCSS: %s, appInstanceId: %s',
    strictStyleIsolation,
    scopedCSS,
    appInstanceId,
  );

  const containerElement = NATIVE_DOCUMENT.createElement('div');
  containerElement.innerHTML = appContent;
  // appContent always wrapped with a singular div
  const appElement = containerElement.firstChild;

  if (strictStyleIsolation) {
    if (!supportShadowDOM) {
      console.warn(
        '[qiankun]: As current browser not support shadow dom, your strictStyleIsolation configuration will be ignored!',
      );
    } else {
      const { innerHTML } = appElement;
      appElement.innerHTML = '';

      /** @type {ShadowRoot} */
      let shadow;

      if (appElement.attachShadow) {
        shadow = appElement.attachShadow({ mode: 'open' });
      } else {
        // createShadowRoot was proposed in initial spec, which has then been deprecated
        shadow = appElement.createShadowRoot();
      }
      shadow.innerHTML = innerHTML;
    }
  }

  if (scopedCSS) {
    const attr = appElement.getAttribute(QIANKUN_CSS_REWRITE_ATTR);
    if (!attr) {
      appElement.setAttribute(QIANKUN_CSS_REWRITE_ATTR, appInstanceId);
    }

    /** @type {HTMLStyleElement[]} */
    const styleNodes = appElement.querySelectorAll('style') || [];
    logger.info('createElement - styleNodes: %o', styleNodes);

    forEach(
      styleNodes,
      (
        /** @type HTMLStyleElement */
        stylesheetElement,
      ) => {
        css.process(appElement, stylesheetElement, appInstanceId);
      },
    );
  }

  return appElement;
}
