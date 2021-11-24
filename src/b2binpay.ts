import {
  TB2BInPayOptions,
  TB2BInPayLogin,
  TB2BInPayOrder,
  TB2BInPayBill,
  TB2BInPayBillData,
  TB2BInPayQuote,
  TB2BInPayQuoteList,
  TB2BInPayWithdrawRequest,
  TB2BInPayWithdraw,
  TB2BInPayWithdrawData
} from './types';
import axios, { AxiosInstance } from 'axios';
import { GATEWAY, SANDBOX, SANDBOX_URL, CURRENCY_URL } from './constants';

export default class B2BInPay {
  key: string;
  secret: string;
  testMode: boolean;
  is_connected: boolean = false;
  /*   access: string;
  refresh: string;
  access_expired_at: string;
  refresh_expired_at: string;
  is_2fa_confirmed: boolean;
  meta?: B2BrokerMeta; */
  private sock: AxiosInstance;
  private token: string;
  private lifeTime: string;

  constructor(options?: TB2BInPayOptions) {
    this.key = options && options.key;
    this.secret = options && options.secret;
    this.testMode = (options && options.testMode) || false;
    if (this.key && this.key.length && this.secret && this.secret.length) {
      this.connect(this.key, this.secret);
    }
    this.sock = axios.create();
  }

  async connect(key: string, secret: string): Promise<boolean> {
    const baseURL = this.testMode ? SANDBOX : GATEWAY;
    if (!key.length || !secret.length) throw new Error('No connection data');
    const answer = await this.sock.get<TB2BInPayLogin>(`${baseURL}/login`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
      }
    });
    this.token = answer.data.access_token;
    this.lifeTime = answer.data.lifetime;
    this.is_connected = true;
    return true;
  }

  getCurrencyUrl(currency: string): string {
    return this.testMode ? SANDBOX_URL[currency] : CURRENCY_URL[currency];
  }

  async order(currency: string, options: TB2BInPayOrder): Promise<TB2BInPayBillData> {
    if (!this.is_connected) {
      await this.connect(this.key, this.secret);
    }
    const baseURL = this.getCurrencyUrl(currency);
    const answer = await this.sock.post<TB2BInPayBill>(`${baseURL}/api/v1/pay/bills`, options, {
      headers: {
        Authorization: 'Bearer ' + this.token
      }
    });
    return answer.data.data;
  }

  async deposit(currency: string = ''): Promise<TB2BInPayQuote[]> {
    if (!this.is_connected) {
      await this.connect(this.key, this.secret);
    }
    const baseURL = this.testMode ? SANDBOX : GATEWAY;
    const answer = await this.sock.get<TB2BInPayQuoteList>(`${baseURL}/v1/rates/deposit/${currency}`, {
      headers: {
        Authorization: 'Bearer ' + this.token
      }
    });
    return answer.data.data;
  }

  async withdrawal(currency: string = ''): Promise<TB2BInPayQuote[]> {
    if (!this.is_connected) {
      await this.connect(this.key, this.secret);
    }
    const baseURL = this.testMode ? SANDBOX : GATEWAY;
    const answer = await this.sock.get<TB2BInPayQuoteList>(`${baseURL}/v1/rates/withdraw/${currency}`, {
      headers: {
        Authorization: 'Bearer ' + this.token
      }
    });
    return answer.data.data;
  }

  async withdraws(request: TB2BInPayWithdrawRequest): Promise<TB2BInPayWithdrawData> {
    if (!this.is_connected) {
      await this.connect(this.key, this.secret);
    }
    const baseURL = this.testMode ? SANDBOX : GATEWAY;
    const answer = await this.sock.post<TB2BInPayWithdraw>(`${baseURL}/v1/virtualwallets/withdraws`, request, {
      headers: {
        Authorization: 'Bearer ' + this.token
      }
    });
    return answer.data.data;
  }
}
