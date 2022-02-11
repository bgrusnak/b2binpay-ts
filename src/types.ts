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

export type TBIPOptions = {
  key?: string;
  secret?: string;
  apiUrl?: string;
};

export type TBIPToken = {
  data: {
    type: 'auth-token';
    id: number;
    attributes: {
      refresh: string;
      access: string;
      access_expired_at: string;
      refresh_expired_at: string;
      is_2fa_confirmed: false;
    };
  };
  meta: {
    time: string;
    sign: string;
  };
};

export type TBIPRefresh = {
  data: {
    type: 'auth-token';
    id: number;
    attributes: {
      refresh: string;
      access: string;
      access_expired_at: string;
      refresh_expired_at: string;
      is_2fa_confirmed: false;
    };
  };
};

export type TBIPWalletDestination = {
  address_type: string;
  address: string;
};

export type TBIPWalletItem = {
  data: {
    type: string;
    id: number;
  };
};

export type TBIPCurrency = {
  type: 'currency';
  id: number;
  attributes: {
    iso: number;
    name: string;
    alpha: string;
    alias: string;
    exp: number;
    confirmation_blocks: number;
    minimal_transfer_amount: number;
    block_delay: number;
  };
  relationships: {
    parent: TBIPWalletItem | undefined | null;
  };
};

export enum EBIPWalletStatus {
  NotActive = 1,
  InProgress = 2,
  Active = 3
}

export type TBIPCurrencyItem = {
  data: {
    type: string;
    id: number;
  };
};

export type TBIPWallet = {
  type: 'wallet';
  id: number;
  attributes: {
    status: EBIPWalletStatus;
    created_at: Date;
    balance_confirmed: Number;
    balance_pending: Number;
    balance_unusable: Number;
    minimal_transfer_amount: Number;
    destination: TBIPWalletDestination | undefined | null;
  };
  relationships: {
    currency: TBIPCurrencyItem;
    parent: TBIPWalletItem | undefined | null;
  };
};

export enum EBIPTransferType {
  Invoice = 1,
  Payout = 2,
  IncomingExchange = 5,
  Costs = 9,
  Deposit = 14,
  Dust = 15,
  Fees = 16,
  OutgoingExchange = 17,
  ActivationTransfer = 19
}

export enum EBIPTransferRisk {
  Green = 1,
  Queue = 2,
  Red = 3,
  Unavailable = 4
}

export enum EBIPTransferStatus {
  Cancelled = -3,
  Blocked = -2,
  Failed = -1,
  Created = 0,
  Unconfirmed = 1,
  Confirmed = 2
}

export type TBIPTransfer = {
  type: 'transfer';
  id: number;
  attributes: {
    confirmations: number;
    op_id: number;
    op_type: EBIPTransferType;
    risk_status: EBIPTransferRisk;
    risk: number | null;
    amount: string;
    commission: string;
    fee: string;
    txid: string;
    status: EBIPTransferStatus;
    message: string | null;
    user_message: string | null;
    created_at: Date;
    updated_at: Date;
  };
  relationships: {
    currency: TBIPCurrencyItem;
    wallet: TBIPWalletItem;
    parent: object | null;
  };
};

export type TBIPRate = {
  type: 'rate';
  id: number;
  attributes: {
    left: string;
    right: string;
    bid: string;
    ask: string;
    exp: number;
    expired_at: Date;
    created_at: Date;
  };
};

export type TBIPRateFilter = {
  left: string | undefined;
  right: string | undefined;
};

export enum EBIPPaymentAddressType {
  Legacy = 'legacy',
  Segwit = 'p2sh-segwit',
  Bech32 = 'bech32',
  Cash = 'cash',
  Address = 'address',
  XAddress = 'x-address'
}

export type TBIPAddressDestination = {
  address_type: EBIPPaymentAddressType;
  address: string;
};

export type TBIPDepositCurrency = {
  wallet_id: number;
  target_paid: string;
  target_commission: string;
  enrolled: string;
  target_paid_pending: string;
  blockchain_balance: string;
};

export type TBIPDeposit = {
  type: 'deposit';
  id: number;
  attributes: {
    target_paid: string;
    payment_page: string;
    address_type: EBIPPaymentAddressType;
    tracking_id: string | number;
    confirmations_needed: null | number;
    callback_url: string;
    address: string;
    message: null | string;
    destination: TBIPAddressDestination;
    assets: {
      [index: string]: TBIPDepositCurrency;
    };
  };
  relationships: {
    currency: TBIPCurrencyItem;
    wallet: TBIPWalletItem;
  };
};

export type TBIPInvoice = {
  type: 'deposit';
  id: number;
  attributes: {
    target_paid: string;
    payment_page: string;
    address: string;
    destination: TBIPAddressDestination;
    label: string;
    tracking_id: string | number;
    address_type: EBIPPaymentAddressType;
    confirmations_needed: null | number;
    callback_url: string;
    rate_requested: string;
    rate_expired_at: Date;
    invoice_updated_at: Date;
  };
  relationships: {
    currency: TBIPCurrencyItem;
    wallet: TBIPWalletItem;
  };
};

export enum EBIPPayoutStatus {
  Waiting = 1,
  Approve = 2
}

export type TBIPPayout = {
  type: 'payout';
  id: number;
  attributes: {
    amount: string;
    exp: number;
    tag: string | null;
    tag_type: string | null;
    destination: TBIPAddressDestination;
    tracking_id: string | number | null;
    confirmations_needed: null | number;
    fee_amount: string;
    is_fee_included: boolean;
    message: string | null;
    status: EBIPPayoutStatus;
    callback_url: string;
  };
  relationships: {
    currency: TBIPCurrencyItem;
    wallet: TBIPWalletItem;
  };
  links: { [index: string]: string };
};

export type TBIPFee = {
  type: 'payout-calculation';
  id: number | string;
  attributes: {
    is_internal: boolean;
    fee: {
      low: string;
      medium: string;
      high: string;
      dust_amount: string;
      currency: number;
    };
    commission: {
      amount: string;
      currency: number;
    };
  };
};
