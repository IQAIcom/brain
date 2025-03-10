# 🎛 Plugin Wallet

A **plugin** for interacting with blockchain wallets to fetch holdings and transaction history across multiple chains.

---

## 📌 Overview

The **Plugin Wallet** provides an interface to interact with blockchain wallets. It enables users to:

✅ **View token holdings and balances** across chains  
✅ **Check transaction history** on supported blockchains  
✅ **Support multiple chains** including Ethereum, Polygon, Fraxtal, and more  

_All data is fetched using the [Covalent API](https://goldrush.dev/docs/api-reference/overview)._

---

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @iqai/plugin-wallet
```

---

## ⚙ Configuration

Set up your environment with the required API configuration:

| 🔧 Variable Name            | 📜 Description                                                     |
| --------------------------- | ------------------------------------------------------------------ |
| `COVALENT_API_KEY`          | Your Covalent API key for blockchain data access                   |
| `WALLET_ADDRESS` | Default wallet address to use when none is provided                 |

---

## 🚀 Usage

Import and initialize the plugin:

```typescript
import { createWalletPlugin } from "@iqai/plugin-wallet";

// Initialize the plugin
const plugin = await createWalletPlugin({
  covalentApiKey: process.env.COVALENT_API_KEY,
  defaultAddress: process.env.WALLET_ADDRESS,
});
```

---

## 🎯 Actions

### WALLET_GET_HOLDINGS

Fetch token holdings for a specific wallet on a blockchain.

💬 **Examples:**

- "get my holdings on fraxtal"  
- "show my tokens on eth-mainnet"  
- "get holdings of 0x1234...5678 on polygon"  
- "check holdings on base-mainnet"

---

### WALLET_GET_TRANSACTIONS

Retrieve transaction history for a wallet on a blockchain.

💬 **Examples:**

- "get my transactions on fraxtal"  
- "show my recent transactions on ethereum"  
- "view transaction history of 0x1234...5678 on polygon"  
- "get my last 5 txns on fraxtal"

---

## 📜 Response Format

Actions return structured responses including:

✔ **Token balances with USD values**  
✔ **Transaction details with timestamps and status**  
✔ **Gas information**  
✔ **Other relevant metadata**

---

## ❌ Error Handling

The plugin handles various error scenarios:

- **Invalid chain names**
- **API connection errors**
- **Request validation errors**
- **Rate limiting issues**

---

## 🌐 Supported Chains

The plugin supports all chains available in the Covalent API, including:

- **Ethereum** (eth-mainnet)
- **Polygon** (matic-mainnet)
- **Binance Smart Chain** (bsc-mainnet)
- **Fraxtal** (fraxtal-mainnet)
- **Avalanche** (avalanche-mainnet)
- **Arbitrum** (arbitrum-mainnet)
- **Optimism** (optimism-mainnet)
- **Base** (base-mainnet)
- _And many [more](https://goldrush.dev/chains)_

Covalent API integration enables complete blockchain data access across multiple networks from a single source.
