import { ScopedCSS } from './scoped-css.class';
import { QIANKUN_CSS_REWRITE_ATTR } from '../../config';

/** @type {ScopedCSS} */
let processor;

/**
 *
 * @param {HTMLElement} appWrapper
 * @param {HTMLStyleElement | HTMLLinkElement} stylesheetElement
 * @param {string} appName
 * @returns {void}
 */
export const process = (appWrapper, stylesheetElement, appName) => {
  // lazy singleton pattern
  if (!processor) {
    processor = new ScopedCSS();
  }

  if (stylesheetElement.tagName === 'LINK') {
    console.warn('Feature: sandbox.experimentalStyleIsolation is not support for link element yet.');
  }

  const mountDOM = appWrapper;
  if (!mountDOM) {
    return;
  }

  const tag = (mountDOM.tagName || '').toLowerCase();

  if (tag && stylesheetElement.tagName === 'STYLE') {
    const prefix = `${tag}[${QIANKUN_CSS_REWRITE_ATTR}="${appName}"]`;

    processor.process(stylesheetElement, prefix);
  }
};
