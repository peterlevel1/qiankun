import { QiankunError } from '../error';

/**
 * @param {any[]} list
 * @returns {any[]}
 */
export const arrayify = (list) => {
  return [].slice.call(list, 0);
};

export function toArray(array) {
  return Array.isArray(array) ? array : [array];
}

/**
 * @param {Element | null | undefined} element
 * @param {string} [msg]
 */
export function assertElementExist(element, msg) {
  if (!element) {
    if (msg) {
      throw new QiankunError(msg);
    }

    throw new QiankunError('element not existed!');
  }
}
