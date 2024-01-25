import { importEntry } from 'import-html-entry';
import { getLogger } from '../utils/logger';

const logger = getLogger('import-html-entry');

(async () => {
  const result = await importEntry('http://localhost:7101');
  logger.info('importEntry - result: %o', result);
})();
