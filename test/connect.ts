import { TEST_KEY, TEST_SECRET } from '../src/constants';
import B2Broker from '../src/b2broker';
const assert = require('assert');
describe('Connect', function() {
  describe('Test connect to the b2broker', function() {
    it('should return -1 when the value is not present', async function() {
        const b2broker = new B2Broker();
        await b2broker.connect(TEST_KEY, TEST_SECRET)
            assert.ok(true);
    });
  });
});
