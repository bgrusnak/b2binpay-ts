export enum EBillStatus {
  Error = -2,
  Expired = -1,
  Waiting = 1,
  Paid = 2,
  Frozen = 3,
  Closed = 4
}

export type TBillSignature = {
  time: string;
  hash: string;
};

export type TB2BInPayOptions = {
  key?: string;
  secret?: string;
  testMode?: boolean;
};

export type TB2BInPayLogin = {
  token_type: string;
  access_token: string;
  lifetime: string;
};

export type TB2BInPayOrder = {
  amount: string;
  wallet: string;
  tracking_id?: number | string;
  lifetime?: number;
  pow?: number;
  callback_url?: string;
  success_url?: string;
  error_url?: string;
};

export type TB2BInPayBill = {
  data: TB2BInPayBillData;
};

export type TB2BInPayBillData = {
  id: number;
  url: string;
  address: string;
  created: string;
  expired: string;
  status: EBillStatus;
  tracking_id?: number | string;
  amount: string;
  actual_amount: string;
  pow: number;
  transactions: any[];
  message?: any;
  sign?: TBillSignature[];
};

export type TB2BInPayCurrency = {
  alpha: string;
  iso: number | string;
};

export type TB2BInPayQuote = {
  from: TB2BInPayCurrency;
  to: TB2BInPayCurrency;
  rate: string;
  pow: number;
  expire: string;
};

export type TB2BInPayQuoteList = {
  data: TB2BInPayQuote[];
};

export type TB2BInPayWithdrawRequest = {
  amount: string;
  virtual_wallet_id: number | string;
  address: string;
  currency: string;
  unique_id: number;
  tracking_id?:   string;
  pow?: number;
  callback_url?: string;
  message?: string;
};

export type TB2BInPayWithdrawData = {
  id: number;
  virtual_wallet_id: number | string;
  address: string;
  transaction: string;
  created: string;
  callback_url?: string;
  status: EBillStatus;
  tracking_id?: number | string;
  amount: string;
  pow: number;
  currency: TB2BInPayCurrency;
};

export type TB2BInPayWithdraw = {
  data: TB2BInPayWithdrawData;
};
