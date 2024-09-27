<!-- omit in toc -->
# Flash SDK 🧰

Set of tools for interaction with Flash protocol

<!-- omit in toc -->
### Table of Contents

- [Usage Examples](#usage-examples)
  - [_Swap one specific crypto to another_](#swap-one-specific-crypto-to-another)
  - [_Swap cryptos selected from the supported list_](#swap-cryptos-selected-from-the-supported-list)
  - [_Monitor submitted swap state_](#monitor-submitted-swap-state)
- [Development](#development)
  - [Setup Project](#setup-project)
  - [Peer Dependencies](#peer-dependencies)
  - [Select EVM Provider](#select-evm-provider)
  - [Known Issues](#known-issues)
    - [_Optional dependency not resolved build error_](#optional-dependency-not-resolved-build-error)
    - [_Axios initialization runtime error_](#axios-initialization-runtime-error)

## Usage Examples

### _Swap one specific crypto to another_

```ts
import { FlashClient, ViemWallet, Crypto, Amount } from 'flash-sdk';

// Initialize FlashClient
const wallet = await ViemWallet.fromPrivateKey('0x13...37');
const flash = new FlashClient({ wallet });
await flash.preload(); // Optional

// Select "from" & "to" cryptos by their chain ID & contract address
const fromCrypto = await flash.getCrypto({ id: Crypto.makeId('5', '0x7A5c16F8055034A723376f680Cf6666cAd80B864') });
const toCrypto = await flash.getCrypto({ id: Crypto.makeId('97', '0x0bfc4216C1Fc8ea8b941af6abb70C44dfd7Ee156') });

// Get quote & submit swap for the selected cryptos & "from" amount
const fromAmount = Amount.fromDecimalString('12.34');
const quote = await flash.getQuote({ fromCrypto, fromAmount, toCrypto });
const swap = await flash.submitSwap({ quote });
```

### _Swap cryptos selected from the supported list_

```ts
import { FlashClient, ViemWallet, Amount } from 'flash-sdk';

// Initialize FlashClient
const wallet = await ViemWallet.fromPrivateKey('0x13...37');
const flash = new FlashClient({ wallet });
await flash.preload(); // Optional

// Select "from" & "to" chains from supported list
const chains = await flash.getChains();
const [fromChain, toChain] = chains; // Example

// Select "from" & "to" cryptos from supported list for each chain
const fromCryptos = await flash.getCryptos({ chain: fromChain });
const [fromCrypto] = fromCryptos; // Example
const toCryptos = await flash.getCryptos({ chain: toChain });
const [toCrypto] = toCryptos; // Example

// Get quote & submit swap for the selected cryptos & "from" amount
const fromAmount = Amount.fromDecimalString('12.34'); // Example
const quote = await flash.getQuote({ fromCrypto, fromAmount, toCrypto });
const swap = await flash.submitSwap({ quote });
```

### _Monitor submitted swap state_

```ts
// Wait for ~ five seconds before next swap update
const swapUpdatePeriod = Duration.fromSeconds(5);

// Assuming FlashClient & quote are initialized
const flash: FlashClient = ...;
const quote: Quote = ...;
let swap = await flash.submitSwap({ quote });

// It's possible to handle "swap.state" manually,
// but easier with some helper getters, provided by "Swap"
while (swap.awaiting) {
    await swapUpdatePeriod.sleep();
    swap = await flash.getSwap({ swap });
}

// Check the result swap state
if (swap.completed) {
    // Swap completed - "from" crypto taken, "to" crypto received
    console.log(`Swap "${swap.hash}" completed`);
} else if (swap.slashable) {
    // Swap cancelled & slashable - "from" crypto taken, "to" crypto not received
    // The "to" actor's collateral should be taken to compensate the "from" crypto
    // This requires two transactions - in "to" & in "collateral" network (can be helped by liquidators)
    console.log(`Swap "${swap.hash}" cancelled and waiting for slash`);
} else {
    // Swap cancelled & not slashable - "from" crypto not taken, "to" crypto not received
    // Since nothing taken from the "from" actor, new swap can be created (even for the same quote)
    console.log(`Swap "${swap.hash}" cancelled`);
}
```

## Development

### Setup Project

The SDK setup process assumes that [Node.js](https://nodejs.org/en) (version 22 is recommended) is installed on machine
and a project where SDK is planned to be integrated is already created.

1. Install `flash-sdk` as a usual NPM package dependency of the project
2. Install [peer dependencies](#peer-dependencies) of SDK according to the needs of the project

### Peer Dependencies

SDK dependencies are specified as "peer" ones, i.e. they are supposed to be installed explicitly in the project that
uses this SDK. The safest option is to install all of them, however, some of them may be omitted if a set of specific
use-cases is not needed for the project - see the table below for more details.

| Dependency                  | Version | Required | When to Install                                                                |
| --------------------------- | :-----: | :------: | ------------------------------------------------------------------------------ |
| `axios`                     |  1.6+   |  _Yes_   | Always                                                                         |
| `qs`                        |  6.11+  |  _Yes_   | Always                                                                         |
| `viem`                      |  2.1+   | _No [1]_ | EVM functionality in use & configured as provider (default) or `wagmi` in use  |
| `ethers`                    |  6.9+   | _No [1]_ | EVM functionality in use & configured as provider or `GnosisSafeWallet` in use |
| `wagmi`                     |  2.2+   |   _No_   | `WagmiWallet` implementation in use                                            |
| `@tanstack/react-query`     |  5.17+  |   _No_   | `WagmiWallet` implementation in use                                            |
| `@safe-global/protocol-kit` |  4.0+   |   _No_   | `GnosisSafeWallet` implementation in use (note - also requires `ethers`)       |

_Important notes:_

- _[1]_: at least one of dependencies __is required__ as a provider when EVM functionality is in use
- The package version must not exceed major part of what specified, i.e. version `5.0.0` won't work for `4.2+`

### Select EVM Provider

By default, SDK uses EVM provider based on `viem` library.

It's possible to use a different ready-made provider:

```ts
import { setEvmProvider, EthersEvmProvider } from 'flash-sdk';

// Before actively using SDK methods
setEvmProvider(new EthersEvmProvider());
```

Or implement a custom one:

```ts
import { IEvmProvider, setEvmProvider } from 'flash-sdk';

class CustomEvmProvider implements IEvmProvider { /* ... */ }

setEvmProvider(new CustomEvmProvider());
```

### Known Issues

#### _Optional dependency not resolved build error_

> Module not found: Error: Can't resolve '{optional-dependency}' in '{some-sdk-path}'.
> Did you mean './{optional-dependency}'?

This build error occurs during Webpack builds. Webpack tries to bundle all imported dependencies regardless of their
actual usage. One possible resolution is to specify dependency as external in Webpack config referencing non-existing
external package.

_Resolution:_

Say `ethers` is not needed in a project that uses Webpack via
[react-app-rewired](https://www.npmjs.com/package/react-app-rewired).
Specify it in `externals` of `config-overrides.js`:

```js
module.exports = function override(config) {
  // ...
  config.externals = {
    ethers: 'never',
  };
  return config;
};
```

#### _Axios initialization runtime error_

> Uncaught TypeError: axios_1.default.create is not a function

This runtime error is related to `.cjs` modules usage as mentioned in
[this GitHub comment](https://github.com/facebook/create-react-app/pull/12021#issuecomment-1108426483).

_Resolution:_

Say Webpack is in use via [react-app-rewired](https://www.npmjs.com/package/react-app-rewired).
Add the following `rules` override in `config-overrides.js`:

```js
module.exports = function override(config) {
  // ...
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf instanceof Array) {
      rule.oneOf[rule.oneOf.length - 1].exclude = [/\.(js|mjs|jsx|cjs|ts|tsx)$/, /\.html$/, /\.json$/];
    }
    return rule;
  });
  return config;
};
```
