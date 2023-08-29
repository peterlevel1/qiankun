import { NATIVE_DOCUMENT, CSS_RULE_TYPES } from '../../config';
import { arrayify } from '../../utils/common.utils';

const MODIFIED_TAG = 'Symbol(style-modified-qiankun)';

const rootSelectorRE = /((?:[^\w\-.#]|^)(body|html|:root))/gm;
const rootCombinationRE = /(html[^\w{[]+)/gm;
const siblingSelectorRE = /(html[^\w{]+)(\+|~)/gm;

export class ScopedCSS {
  /** @type StyleSheet */
  #sheet;

  /** @type HTMLStyleElement */
  #swapNode;

  constructor() {
    const styleNode = NATIVE_DOCUMENT.createElement('style');
    NATIVE_DOCUMENT.body.appendChild(styleNode);

    this.#swapNode = styleNode;
    this.#sheet = styleNode.sheet;

    this.#sheet.disabled = true;
  }

  /**
   * process styleNode
   * @param {HTMLStyleElement} styleNode
   * @param {string} [prefix='']
   */
  process(styleNode, prefix = '') {
    if (MODIFIED_TAG in styleNode) {
      return;
    }

    if (styleNode.textContent !== '') {
      const textNode = NATIVE_DOCUMENT.createTextNode(styleNode.textContent || '');
      this.#swapNode.appendChild(textNode);

      // type is missing
      const sheet = this.#swapNode.sheet;
      const rules = arrayify(sheet?.cssRules || []);
      const css = this.#rewrite(rules, prefix);

      // eslint-disable-next-line no-param-reassign
      styleNode.textContent = css;

      // cleanup
      this.#swapNode.removeChild(textNode);
      styleNode[MODIFIED_TAG] = true;
      return;
    }

    const mutator = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i += 1) {
        const mutation = mutations[i];

        if (MODIFIED_TAG in styleNode) {
          return;
        }

        if (mutation.type === 'childList') {
          const sheet = styleNode.sheet;
          const rules = arrayify(sheet?.cssRules || []);
          const css = this.#rewrite(rules, prefix);

          // eslint-disable-next-line no-param-reassign
          styleNode.textContent = css;
          // eslint-disable-next-line no-param-reassign
          styleNode[MODIFIED_TAG] = true;
        }
      }
    });

    // since observer will be deleted when node be removed
    // we dont need create a cleanup function manually
    // see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/disconnect
    mutator.observe(styleNode, { childList: true });
  }

  /**
   * rewrite rules to string
   * @param {CSSRule[]} rules
   * @param {string} [prefix='']
   * @returns {string}
   */
  #rewrite(rules, prefix = '') {
    let css = '';

    rules.forEach((rule) => {
      switch (rule.type) {
        case CSS_RULE_TYPES.STYLE:
          css += this.#ruleStyle(rule, prefix);
          break;
        case CSS_RULE_TYPES.MEDIA:
          css += this.#ruleMedia(rule, prefix);
          break;
        case CSS_RULE_TYPES.SUPPORTS:
          css += this.#ruleSupport(rule, prefix);
          break;
        default:
          if (typeof rule.cssText === 'string') {
            css += `${rule.cssText}`;
          }
          break;
      }
    });

    return css;
  }

  /**
   * get rule style string
   * - handle case:
   * - .app-main {}
   * - html, body {}
   * @param {CSSStyleRule} rule
   * @param {string} prefix
   * @returns {string}
   */
  #ruleStyle(rule, prefix) {
    const selector = rule.selectorText.trim();

    let cssText = '';
    if (typeof rule.cssText === 'string') {
      cssText = rule.cssText;
    }

    // handle html { ... }
    // handle body { ... }
    // handle :root { ... }
    if (selector === 'html' || selector === 'body' || selector === ':root') {
      return cssText.replace(rootSelectorRE, prefix);
    }

    // handle html body { ... }
    // handle html > body { ... }
    if (rootCombinationRE.test(rule.selectorText)) {
      // since html + body is a non-standard rule for html
      // transformer will ignore it
      if (!siblingSelectorRE.test(rule.selectorText)) {
        cssText = cssText.replace(rootCombinationRE, '');
      }
    }

    // handle grouping selector, a,span,p,div { ... }
    cssText = cssText.replace(/^[\s\S]+{/, (selectors) =>
      selectors.replace(/(^|,\n?)([^,]+)/g, (item, p, s) => {
        // handle div,body,span { ... }
        if (rootSelectorRE.test(item)) {
          return item.replace(rootSelectorRE, (m) => {
            // do not discard valid previous character, such as body,html or *:not(:root)
            const whitePrevChars = [',', '('];

            if (m && whitePrevChars.includes(m[0])) {
              return `${m[0]}${prefix}`;
            }

            // replace root selector with prefix
            return prefix;
          });
        }

        return `${p}${prefix} ${s.replace(/^ */, '')}`;
      }),
    );

    return cssText;
  }

  /**
   * handle case - @media screen and (max-width: 300px) {}
   * @param {CSSMediaRule} rule
   * @param {string} prefix
   * @returns {string}
   */
  #ruleMedia(rule, prefix) {
    const css = this.#rewrite(arrayify(rule.cssRules), prefix);

    return `@media ${rule.conditionText || rule.media.mediaText} {${css}}`;
  }

  /**
   * handle case - @supports (display: grid) {}
   * @param {CSSSupportsRule} rule
   * @param {string} prefix
   * @returns {string}
   */
  #ruleSupport(rule, prefix) {
    const css = this.#rewrite(arrayify(rule.cssRules), prefix);

    return `@supports ${rule.conditionText || rule.cssText.split('{')[0]} {${css}}`;
  }
}
