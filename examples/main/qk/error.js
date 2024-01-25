export class QiankunError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(`[qiankun]: ${message}`);
  }
}
