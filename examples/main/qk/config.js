export const version = '2.10.12';

export const qkConfig = {
  singular: false,
  sandbox: true,
  excludeAssetFilter: null,
  globalContext: window,
  urlRerouteOnly: false,
  importEntryOpts: {
    //
  },
};

/**
 * window object
 * @type {Window}
 */
export const NATIVE_GLOBAL = new Function('return this')();

/**
 * document object
 * @type {Document}
 */
export const NATIVE_DOCUMENT = new Function('return document')();

/**
 * qiankun 的 head 标签名称
 */
export const QIANKUN_HEAD_TAG_NAME = 'qiankun-head';

/**
 * native global attr: app instance name map
 */
export const ATTR_APP_INSTANCE_NAME_MAP = '__app_instance_name_map__';

// https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
export const CSS_RULE_TYPES = Object.freeze({
  // type: rule will be rewrote
  STYLE: 1,
  MEDIA: 4,
  SUPPORTS: 12,

  // type: value will be kept
  IMPORT: 3,
  FONT_FACE: 5,
  PAGE: 6,
  KEYFRAMES: 7,
  KEYFRAME: 8,
});

export const QIANKUN_CSS_REWRITE_ATTR = 'data-qiankun';
