import * as assert from 'assert';

import { TEST_KEY, TEST_SECRET } from '../src/constants';
import B2BInPay from '../src/b2binpay';
describe('Connect', function() {
  describe('Test connect to the b2inpay', function() {
    it('should connect with test values', async function() {
        const b2b = new B2BInPay({testMode: true});
        assert.ok(await b2b.connect(TEST_KEY, TEST_SECRET));
    });
  });
});
