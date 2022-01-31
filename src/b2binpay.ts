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
import * as SHA256 from 'crypto-js/sha256';
import * as HmacSHA256 from 'crypto-js/hmac-sha256';
import { GATEWAY, SANDBOX } from './constants';

export default class B2BInPay {
  key: string;
  secret: string;
  testMode: boolean;
  isConnected: boolean = false;
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
    this.sock = axios.create({
      baseURL: this.testMode ? SANDBOX : GATEWAY,
      headers: { 'Content-Type': 'application/vnd.api+json' }
    });
    this.refresh();
  }

  async connect(key: string, secretString: string): Promise<boolean> {
    if (!key.length || !secretString.length) throw new Error('No connection data');
    try {
      const { data } = await this.sock.post<TBIPToken>(`/token/`, {
        data: {
          type: 'auth-token',
          attributes: {
            login: key,
            password: secretString
          }
        }
      });
      this.accessToken = data.data.attributes.access;
      this.refreshToken = data.data.attributes.refresh;
      this.sock.defaults.headers.common['Authorization'] = 'Bearer ' + this.accessToken;
      this.accessExpiredAt = moment(data.data.attributes.access_expired_at).toDate();
      this.refreshExpiredAt = moment(data.data.attributes.refresh_expired_at).toDate();
      this.is2faConfirmed = data.data.attributes.is_2fa_confirmed;
      const message = data.meta.time + data.data.attributes.refresh;
      const responseSign = data.meta.sign;
      const crypted = await SHA256(key + secretString);
      const calculatedSign = HmacSHA256(message, crypted).toString();
      if (responseSign !== calculatedSign) {
        return false;
      }
      this.isConnected = true;
    } catch (e) {
      console.log(e);
      this.isConnected = false;
      return false;
    }
    return true;
  }

  private async validateConnect(): Promise<boolean> {
    if (!this.isConnected) {
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
      const { data } = await this.sock.post<TBIPRefresh>(`/token/refresh/`, {
        data: {
          type: 'auth-token',
          attributes: {
            refresh: this.refreshToken
          }
        }
      });
      this.accessToken = data.data.attributes.access;
      this.refreshToken = data.data.attributes.refresh;
      this.sock.defaults.headers.common['Authorization'] = 'Bearer ' + this.accessToken;
      this.accessExpiredAt = moment(data.data.attributes.access_expired_at).toDate();
      this.refreshExpiredAt = moment(data.data.attributes.refresh_expired_at).toDate();
      this.is2faConfirmed = data.data.attributes.is_2fa_confirmed;
    } catch (e) {
      this.isConnected = false;
    }
  }

  async use<T>(method: string, path: string, params?: object): Promise<T> {
    if (!await this.validateConnect()) {
      throw new Error(`No valid connection`);
    }
    if (moment().isAfter(this.accessExpiredAt)) {
      await this.refresh();
      if (!this.isConnected) {
        throw new Error(`Not connected`);
      }
    }
    try {
      const { data } = await this.sock[method]<T>(`/${path}`, { data: params });
      return data;
    } catch (e) {
      console.log(e);
      return undefined;
    }
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

  async createDeposit(req: {
    wallet: TBIPWalletItem;
    label?: string;
    trackingId?: number | string;
    addressType?: EBIPPaymentAddressType;
    callbackUrl?: string;
    confirmationsNeeded?: number | null;
  }): Promise<TBIPDeposit> {
    return await this.post<TBIPDeposit>(`deposit`, {
      type: 'deposit',
      attributes: {
        label: req.label,
        address_type: req.addressType,
        tracking_id: req.trackingId,
        confirmations_needed: req.confirmationsNeeded,
        callback_url: req.callbackUrl
      },
      relationships: {
        wallet: req.wallet
      }
    });
  }

  async getInvoice(id: number | string): Promise<TBIPInvoice> {
    return await this.get<TBIPInvoice>(`deposit/${id}`);
  }

  async createInvoice(req: {
    wallet: TBIPWalletItem;
    label?: string;
    trackingId?: number | string;
    addressType?: EBIPPaymentAddressType;
    callbackUrl?: string;
    currency?: TBIPCurrencyItem;
    confirmationsNeeded?: number | null;
  }): Promise<TBIPInvoice> {
    return await this.post<TBIPInvoice>(`deposit`, {
      type: 'deposit',
      attributes: {
        label: req.label,
        address_type: req.addressType,
        tracking_id: req.trackingId,
        confirmations_needed: req.confirmationsNeeded,
        callback_url: req.callbackUrl
      },
      relationships: {
        wallet: req.wallet,
        currency: req.currency
      }
    });
  }

  async getPayout(id: number | string): Promise<TBIPPayout> {
    return await this.get<TBIPPayout>(`payout/${id}`);
  }

  async createPayout(req: {
    wallet: TBIPWalletItem;
    label?: string;
    trackingId?: number | string;
    address?: string;
    amount?: string;
    addressType?: EBIPPaymentAddressType;
    callbackUrl?: string;
    currency?: TBIPCurrencyItem;
    confirmationsNeeded?: number | null;
  }): Promise<TBIPPayout> {
    return await this.post<TBIPPayout>(`payout`, {
      type: 'payout',
      attributes: {
        label: req.label,
        address: req.address,
        amount: req.amount,
        address_type: req.addressType,
        tracking_id: req.trackingId,
        confirmations_needed: req.confirmationsNeeded,
        callback_url: req.callbackUrl
      },
      relationships: {
        wallet: req.wallet,
        currency: req.currency
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
