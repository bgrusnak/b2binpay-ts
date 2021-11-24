import * as assert from 'assert';

import { TEST_KEY, TEST_SECRET } from '../src/constants';
import B2BInPay from '../src/b2binpay';
describe('Bill', function() {
  describe('Test of the bill creation', function() {
    it('should create the test bill for BTC', async function() {
        const b2b = new B2BInPay({testMode: true, key: TEST_KEY, secret: TEST_SECRET});
        const bill = await b2b.order('BTC', {amount: 0.001, wallet: '654'});
        assert.ok(bill && typeof bill.id == 'number' &&  bill.id>0);
    });
  });
});
