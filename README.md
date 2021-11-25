# b2binpay-ts

B2BInPay Gateway library

Simple communication with B2BInPay gateways.
The API can be found in https://b2binpay.com/en/api/

## Install

```sh
npm install --save @bgrusnak/b2binpay-ts
```

```ts
import  B2BInPay from '@bgrusnak/b2binpay-ts';

const gate = new B2BInPay({key:'abc', secret: 'def'});
const bill = await gate.order('BTC', {amount: 0.001, wallet: '654'});
```

## API

### `constructor([opts])`

#### Arguments

- `opts`: optional, object

    Options to define behaviour.

#### Options

- `opts.key`: string
    The key for the B2BInPay

- `opts.secret`: string

    The separator to use when splitting the text. Only used if text is given as a string.

- `opts.testMode`: boolean, default false

    Using if we need to use the testing mode.

### `order(currency, options)`

Asynchronous function to make an order and receive the bill

#### Arguments

- `currency`: string

    The currency should be used.

- `options`: object

    Options to define behaviour. See the API docs for the values

### `deposit(currency)`

Asynchronous function to receive the currencies for the deposit

#### Arguments

- `currency`: string, optional

    The currency should be used as base currency.

### `withdrawal(currency)`

Asynchronous function to receive the currencies for the withdrawal

#### Arguments

- `currency`: string, optional

    The currency should be used as base currency.

### `withdraws(options)`

Asynchronous function to withdraw the funds

#### Arguments

- `options`: object

    Options to define behaviour. See the API docs for the values

## License

MIT © Contributors
