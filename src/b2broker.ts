import { B2BrokerOptions, B2BrokerMeta } from './types';
import axios, { AxiosResponse, AxiosInstance } from 'axios';
import { B2BAPI } from './constants';

export default class B2Broker {
  key: string;
  secret: string;
  is_connected: boolean = false;
  access: string;
  refresh: string;
  access_expired_at: string;
  refresh_expired_at: string;
  is_2fa_confirmed: boolean;
  meta?: B2BrokerMeta;
  private sock: AxiosInstance;

  constructor(options?: B2BrokerOptions) {
    this.key = options && options.key;
    this.secret = options && options.secret;
    if (this.key && this.key.length && this.secret && this.secret.length) {
      this.connect(this.key, this.secret);
    }
    this.sock = axios.create({
      baseURL: B2BAPI,
      timeout: 1000,
      headers: { 'content-type': 'application/vnd.api+json' }
    });
  }

  async connect(key: string, secret: string) {
    if (!key.length || !secret.length) throw new Error('No connection data');
    const data = await this.sock.post('/token', {
      data: {
        type: 'auth-token',
        attributes: {
          login: key,
          password: secret
        }
      }
    }).catch(function (error) {
        console.log('Error', error.message);
        console.log(error.config);
      });
    console.log(data)
    return data;
  }
}
