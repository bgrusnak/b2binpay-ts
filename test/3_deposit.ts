import * as assert from 'assert';

import { TEST_KEY, TEST_SECRET } from '../src/constants';
import B2BInPay from '../src';
describe('Bill', function() {
  describe('Test of the deposit quotations', function() {
    it('should get the deposit quotations', async function() {
        const b2b = new B2BInPay({testMode: true, key: TEST_KEY, secret: TEST_SECRET});
        const deposits = await b2b.deposit();
        assert.ok(deposits && deposits.length >0)
    });
    it('should get the deposit quotations for euro', async function() {
        const b2b = new B2BInPay({testMode: true, key: TEST_KEY, secret: TEST_SECRET});
        const deposits = await b2b.deposit('eur');
        assert.ok(deposits && deposits.length >0)
    });
  });
});
