# 🎛 Plugin Fraxlend

A **plugin** for interacting with **Fraxlend**, enabling lending, borrowing, and managing liquidity within the Frax ecosystem.

---

## 📌 Overview

The **Plugin Fraxlend** provides an interface to interact with **Fraxlend**, allowing users to:

✅ **View lending market statistics** 📊  
✅ **Check loan positions and collateral** 💰  
✅ **Execute borrowing/lending operations** 🔄  

All transactions utilize **Frax-based assets**.

---

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @fraxfinance/plugin-fraxlend
```

---

## ⚙ Configuration

Set up your environment with the required wallet configuration:

| 🔧 Variable Name         | 📜 Description                                      |
|-------------------------|-------------------------------------------------|
| `WALLET_PRIVATE_KEY`    | Your wallet's **private key** for transaction signing 🔑 |
| `CHAIN` | The **chain** to interact with (e.g., `fraxtal`) |

---

## 🚀 Usage

Import and initialize the plugin:

```typescript
import { createFraxlendPlugin } from "@fraxfinance/plugin-fraxlend";

// Initialize the plugin
const plugin = await createFraxlendPlugin({
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
  rpcEndpoint: process.env.FRAXLEND_RPC_ENDPOINT,
});
```

---

## 🎯 Actions

### FRAXLEND_ADD_COLLATERAL

Add collateral to a FraxLend position.

💬 **Examples:**

---

### 📈 FRAXLEND_GET_POSITIONS

Get your positions in FraxLend pools.

💬 **Examples:**

---

### 🛒 FRAXLEND_BORROW

Borrow assets using **collateral on Fraxlend** pool.

💬 **Examples:**

---

### 💰 FRAXLEND_REPAY

Repay borrowed assets to a FraxLend pool.

💬 **Examples:**

---

### FRAXLEND_GET_PAIR_ADDRESS

Get FraxLend pair addresses and pool information

💬 **Examples:**

---

### FRAXLEND_LEND

Lend assets to a FraxLend pool.

💬 **Examples:**

---

### FRAXLEND_GET_STATS

Get lending statistics from FraxLend pools

💬 **Examples:**

---

### FRAXLEND_REMOVE_COLLATERAL

Remove collateral from a FraxLend position

💬 **Examples:**

---

### FRAXLEND_WITHDRAW

Withdraw assets from a FraxLend pool.

💬 **Examples:**

---

## 📜 Response Format

Actions return **structured responses**, including:

✔ **Transaction status & hash** (for lending/borrowing) 🔗  
✔ **Formatted asset amounts** 💲  
✔ **Error messages when applicable** ⚠  
✔ **Lending market details** 📈  

---

## ❌ Error Handling

The plugin **handles various error scenarios**:

🚨 **Invalid market addresses**  
💸 **Insufficient collateral or liquidity**  
🔄 **Transaction failures**  
🌐 **Network issues**  
🛑 **Input validation errors**  
