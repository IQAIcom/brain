# 🎧 Plugin BAMM

A **plugin** for interacting with **BAMM**, enabling borrowing, lending, and managing liquidity positions in Fraxswap-style pools.

Learn more about BAMM:

- [Frax docs](https://docs.frax.com/protocol/subprotocols/bamm/overview)
- [IQ Wiki](https://iq.wiki/wiki/bamm-borrow-automated-market-maker)

---

## 📌 Overview

The **Plugin BAMM** provides an interface to interact with **BAMM**, allowing users to:

- ✅ **Borrow and lend assets** 💰  
- ✅ **Manage collateral positions** 🔒  
- ✅ **Track pool statistics** 📊  
- ✅ **Execute liquidity operations** 🔄  

---

## 🛠 Installation

To install the plugin, use **pnpm**:

```bash
pnpm add @iqai/plugin-bamm
```

### ⚙ Configuration

Set up your environment with the required wallet configuration:

| 🔧 Variable Name           | 📜 Description                            |
|----------------------------|--------------------------------------------|
| `WALLET_PRIVATE_KEY`        | Your wallet's private key for transaction signing 🔑 |
| `CHAIN`                     | The chain to interact with (defaults to `fraxtal`) |

---

## 🚀 Usage

### Initialize the Plugin

To use the plugin, import and initialize it:

```javascript
import { createBAMMPlugin } from "@iqai/plugin-bamm";
import { fraxtal } from "viem/chains";

// Initialize the plugin
const plugin = await createBAMMPlugin({
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
  chain: fraxtal
});
```

---

## 🎯 Actions

### 1. **BAMM_BORROW**  

Borrow assets from a BAMM pool using collateral.

**Example:**

```plaintext
borrow 100k of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

```plaintext
borrow 100k of cabu from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

### 2. **BAMM_LEND**  

Lend assets to a BAMM pool.

> ⚠️ **WARNING**: You need to have existing LP tokens of the fraxswap pool to lend to the bamm.

**Example:**

lend 10k lp tokens to 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm

### 3. **BAMM_ADD_COLLATERAL**  

Add collateral to your BAMM position.

**Examples:**

```plaintext
add 100k collateral of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

```plaintext
add 100k collateral of IQT to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

### 4. **BAMM_REMOVE_COLLATERAL**  

Remove collateral from your BAMM position.

**Example:**

```plaintext
remove 10k collateral of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

```plaintext
remove 10k collateral of iqt from this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

### 5. **BAMM_REPAY**  

Repay borrowed assets to a BAMM pool.

**Example:**

```plaintext
repay 3k of 0xCc3023635dF54FC0e43F47bc4BeB90c3d1fbDa9f to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

```plaintext
repay 3k of cabu to this 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84 bamm
```

### 6. **BAMM_WITHDRAW**  

Withdraw LP tokens from BAMM pool by redeeming BAMM tokens.

>⚠️ **WARNING**: The LP tokens redeemed will be deposited back to the Fraxswap pool.

**Example:**

```plaintext
withdraw 15k bamm tokens from 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
```

### 7. **BAMM_GET_POSITIONS**  

View your current positions in BAMM pools.

**Examples:**

```plaintext
my bamm positions please
get my bamm holdings
```

### 8. **BAMM_GET_POOL_STATS**  

Get statistics for all BAMM pools.

**Examples:**

```plaintext
bamm pools please
show me all bamm pools
fetch all bamms
```

---

## 📜 Response Format

All actions return structured responses, which include:

- ✔ **Transaction status** & hash (for trades) 🔗  
- 💰 **Formatted token amounts**  
- ⚠ **Error messages** when applicable  
- 📊 **Pool statistics** and positions  

**Example Successful Response:**

```plaintext
✅ Borrowing Transaction Successful
🌐 BAMM Address: 0xC5B225cF058915BF28D7d9DFA3043BD53C63Ea84
💸 Borrow Amount: 3.00K
💰 Borrowed Token: 0xE0972d61B94C813E0D5725E55E4BeDCd8eF45c57
🔗 Transaction: Oxfdb0780ee359be58fdea6d767fa7bad0d09db504dad3820ce2858bbec74fc59f

Funds have been borrowed from the BAMM pool.
```

---

## ❌ Error Handling

The plugin handles various error scenarios, including:

- 🚨 Invalid pool addresses  
- 💸 Insufficient balances or collateral  
- 🔄 Transaction failures  
- 🌐 Network issues  
- 🛑 Input validation errors  

---

## 🔍 Troubleshooting

If transactions are failing, consider the following:

- **Verify wallet balance** – Ensure your wallet has sufficient funds.  
- **Check network connection** – Ensure a stable connection to the blockchain.  
- **Confirm pool address** – Double-check that you're interacting with a valid pool.

For invalid inputs:

- **Validate token addresses/symbols** – Ensure that the token addresses/symbols are correct.  
- **Check amount format** – Ensure the amounts are formatted correctly.  
- **Verify pool existence** – Confirm that the pool you're trying to interact with exists.

---
