import {
  TBIPOptions,
  TBIPToken,
  TBIPRefresh,
  TBIPWallet,
  TBIPCurrency,
  TBIPTransfer,
  TBIPRateFilter,
  TBIPRate,
  TBIPDeposit,
  TBIPWalletItem,
  EBIPPaymentAddressType,
  TBIPInvoice,
  TBIPCurrencyItem,
  TBIPPayout,
  TBIPFee
} from './types';
import axios, { AxiosInstance } from 'axios';
import * as moment from 'moment';
import CryptoES from 'crypto-es';
import { GATEWAY, SANDBOX } from './constants';

export default class B2BInPay {
  key: string;
  secret: string;
  testMode: boolean;
  baseURL: string;
  is_connected: boolean = false;
  private sock: AxiosInstance;
  private accessToken: string;
  private refreshToken: string;
  private accessExpiredAt: Date;
  private refreshExpiredAt: Date;
  private is2faConfirmed: boolean;

  constructor(options?: TBIPOptions) {
    this.key = options && options.key;
    this.secret = options && options.secret;
    this.testMode = (options && options.testMode) || false;
    this.baseURL = this.testMode ? SANDBOX : GATEWAY;
    this.sock = axios.create();
    this.refresh();
  }

  async connect(key: string, secretString: string): Promise<boolean> {
    if (!key.length || !secretString.length) throw new Error('No connection data');
    try {
      const { data } = await this.sock.post<TBIPToken>(`${this.baseURL}/token/`, {
        data: {
          data: {
            type: 'auth-token',
            attributes: {
              login: key,
              password: secretString
            }
          }
        }
      });
      this.accessToken = data.data.attributes.access;
      this.refreshToken = data.data.attributes.refresh;
      this.accessExpiredAt = moment(data.data.attributes.access_expired_at).toDate();
      this.refreshExpiredAt = moment(data.data.attributes.refresh_expired_at).toDate();
      this.is2faConfirmed = data.data.attributes.is_2fa_confirmed;
      const message = data.meta.time + data.data.attributes.refresh;
      const responseSign = data.meta.sign;
      const crypted = await CryptoES.SHA256(key + secretString);
      const calculatedSign = CryptoES.HmacSHA256(message, crypted).toString();
      if (responseSign !== calculatedSign) {
        return false;
      }
      this.is_connected = true;
    } catch (e) {
      this.is_connected = false;
      return false;
    }
    return true;
  }

  private async validateConnect(): Promise<boolean> {
    if (!this.is_connected) {
      if (this.key && this.key.length && this.secret && this.secret.length) {
        return await this.connect(this.key, this.secret);
      }
      return false;
    }
    return true;
  }

  async refresh(): Promise<void> {
    if (!await this.validateConnect()) return;
    if (moment().isAfter(this.refreshExpiredAt)) {
      await this.connect(this.key, this.secret);
      return;
    }
    try {
      const { data } = await this.sock.post<TBIPRefresh>(`${this.baseURL}/token/refresh/`, {
        data: {
          data: {
            type: 'auth-token',
            attributes: {
              refresh: this.refreshToken
            }
          }
        }
      });
      this.accessToken = data.data.attributes.access;
      this.refreshToken = data.data.attributes.refresh;
      this.accessExpiredAt = moment(data.data.attributes.access_expired_at).toDate();
      this.refreshExpiredAt = moment(data.data.attributes.refresh_expired_at).toDate();
      this.is2faConfirmed = data.data.attributes.is_2fa_confirmed;
    } catch (e) {
      this.is_connected = false;
    }
  }

  async use<T>(method: string, path: string, params?: object): Promise<T> {
    if (!await this.validateConnect()) {
      throw new Error(`No valid connection`);
    }
    if (moment().isAfter(this.accessExpiredAt)) {
      await this.refresh();
      if (!this.is_connected) {
        throw new Error(`Not connected`);
      }
    }
    const { data } = await this.sock[method]<T>(`${this.baseURL}/${path}`, {
      data: params,
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
        'Content-Type': 'application/vnd.api+json'
      }
    });
    return data;
  }

  async get<T>(path: string, params?: object): Promise<T> {
    return await this.use<T>('get', path, params);
  }

  async post<T>(path: string, params?: object): Promise<T> {
    return await this.use<T>('post', path, params);
  }

  async getWallets(): Promise<TBIPWallet[]> {
    return await this.get<TBIPWallet[]>('wallet');
  }

  async getWallet(id: number | string): Promise<TBIPWallet> {
    return await this.get<TBIPWallet>(`wallet/${id}`);
  }

  async getCurrency(id: number | string): Promise<TBIPCurrency> {
    return await this.get<TBIPCurrency>(`currency/${id}`);
  }

  async getTransfer(id: number | string): Promise<TBIPTransfer> {
    return await this.get<TBIPTransfer>(`transfer/${id}`);
  }

  async getTransfers(fields: object): Promise<TBIPTransfer | TBIPTransfer[]> {
    return await this.get<TBIPTransfer | TBIPTransfer[]>(`transfer`, fields);
  }

  async getRates(filter: TBIPRateFilter): Promise<TBIPRate | TBIPRate[]> {
    let filterText = '';
    if (filter.left) {
      filterText = `filter[left]=${filter.left}`;
    }
    if (filter.right) {
      const frt = `filter[right]=${filter.left}`;
      filterText = filterText.length ? filterText + '&' + frt : frt;
    }
    return await this.get<TBIPRate | TBIPRate[]>(`rates/?${filterText}`);
  }

  async getDeposit(id: number | string): Promise<TBIPDeposit> {
    return await this.get<TBIPDeposit>(`deposit/${id}`);
  }

  async createDeposit(
    wallet: TBIPWalletItem,
    label: string,
    trackingId: number | string,
    addressType: EBIPPaymentAddressType,
    callbackUrl: string,
    confirmationsNeeded: number | null
  ): Promise<TBIPDeposit> {
    return await this.post<TBIPDeposit>(`deposit`, {
      type: 'deposit',
      attributes: {
        label,
        address_type: addressType,
        tracking_id: trackingId,
        confirmations_needed: confirmationsNeeded,
        callback_url: callbackUrl
      },
      relationships: {
        wallet
      }
    });
  }

  async getInvoice(id: number | string): Promise<TBIPInvoice> {
    return await this.get<TBIPInvoice>(`invoice/${id}`);
  }

  async createInvoice(
    wallet: TBIPWalletItem,
    label: string,
    trackingId: number | string,
    addressType: EBIPPaymentAddressType,
    callbackUrl: string,
    currency: TBIPCurrencyItem,
    confirmationsNeeded: number | null
  ): Promise<TBIPInvoice> {
    return await this.post<TBIPInvoice>(`invoice`, {
      type: 'invoice',
      attributes: {
        label,
        address_type: addressType,
        tracking_id: trackingId,
        confirmations_needed: confirmationsNeeded,
        callback_url: callbackUrl
      },
      relationships: {
        wallet,
        currency
      }
    });
  }

  async getPayout(id: number | string): Promise<TBIPPayout> {
    return await this.get<TBIPPayout>(`payout/${id}`);
  }

  async createPayout(
    wallet: TBIPWalletItem,
    label: string,
    trackingId: number | string,
    address: string,
    amount: string,
    addressType: EBIPPaymentAddressType,
    callbackUrl: string,
    currency: TBIPCurrencyItem,
    confirmationsNeeded: number | null
  ): Promise<TBIPPayout> {
    return await this.post<TBIPPayout>(`payout`, {
      type: 'payout',
      attributes: {
        label,
        address,
        amount,
        address_type: addressType,
        tracking_id: trackingId,
        confirmations_needed: confirmationsNeeded,
        callback_url: callbackUrl
      },
      relationships: {
        wallet,
        currency
      }
    });
  }

  async payoutFee(
    wallet: TBIPWalletItem,
    address: string,
    amount: string,
    currency: TBIPCurrencyItem
  ): Promise<TBIPFee> {
    return await this.post<TBIPFee>(`payout/calculate`, {
      type: 'payout-calculation',
      attributes: {
        to_address: address,
        amount
      },
      relationships: {
        wallet,
        currency
      }
    });
  }
}
