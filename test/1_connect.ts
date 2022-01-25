import B2BInPay, {TEST_KEY, TEST_SECRET} from '../src'; // 
import { expect } from 'chai';


describe('Connection tests', () => { // the tests container
    it('connection test', async () => { // the single test
        const bip = new B2BInPay({testMode: true}); // this will be your class
        await bip.connect(TEST_KEY, TEST_SECRET);
        expect (bip.isConnected).to.be.true;
    });
});