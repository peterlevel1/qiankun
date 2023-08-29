/**
 * @param {any[]} list
 * @returns {any[]}
 */
export const arrayify = (list) => {
  return [].slice.call(list, 0);
};
