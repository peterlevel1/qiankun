import { NATIVE_DOCUMENT } from '../config';

export const supportShadowDOM = !!NATIVE_DOCUMENT.head.attachShadow || !!NATIVE_DOCUMENT.head.createShadowRoot;
