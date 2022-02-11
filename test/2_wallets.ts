import B2BInPay, { TEST_KEY, TEST_SECRET, SANDBOX } from '../src'; //
import { expect } from 'chai';

describe('Wallet tests', () => {
  // the tests container
  it('Wallet test', async () => {
    // the single test
    const bip = new B2BInPay({ apiUrl: SANDBOX }); // this will be your class
    await bip.connect(TEST_KEY, TEST_SECRET);
    const wallets = await bip.getWallets();
    expect(wallets).to.be.not.empty;
  });
});
