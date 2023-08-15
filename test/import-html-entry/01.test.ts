import '@whatwg-node/fetch';
import { importEntry } from 'import-html-entry';

describe('import-html-entry', () => {
  it('should be ok', async () => {
    const result = await importEntry('http://localhost:4000');
    console.log('result: %o', result);
    expect(result).toBeTruthy();
  });
});
