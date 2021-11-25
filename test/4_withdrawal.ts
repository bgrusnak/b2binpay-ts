import * as assert from 'assert';

import { TEST_KEY, TEST_SECRET } from '../src/constants';
import B2BInPay from '../src';
describe('Bill', function() {
  describe('Test of the withdrawal quotations', function() {
    it('should get the withdrawal quotations', async function() {
        const b2b = new B2BInPay({testMode: true, key: TEST_KEY, secret: TEST_SECRET});
        const withdrawals = await b2b.withdrawal();
        assert.ok(withdrawals && withdrawals.length >0)
    });
    it('should get the withdrawal quotations for euro', async function() {
        const b2b = new B2BInPay({testMode: true, key: TEST_KEY, secret: TEST_SECRET});
        const withdrawals = await b2b.withdrawal('eur');
        assert.ok(withdrawals && withdrawals.length >0)
    });
  });
});
