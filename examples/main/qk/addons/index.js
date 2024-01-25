import concat from 'lodash/concat';
import mergeWith from 'lodash/mergeWith';
import { getEngineFlagAddon } from './engineFlag';
import { getRuntimePublicPathAddOn } from './runtimePublicPath';

/**
 * @param {Window} global
 * @param {string} publicPath
 */
export function getAddOns(global, publicPath) {
  return mergeWith({}, getEngineFlagAddon(global), getRuntimePublicPathAddOn(global, publicPath), (v1, v2) =>
    concat(v1 ?? [], v2 ?? []),
  );
}
