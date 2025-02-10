# 🎛 Plugin ATP

A **plugin** for interacting with **IQ ATP (Agent Tokenization Platform)** for buying, selling, and managing AI agent tokens.

---

## 📌 Overview

The **Plugin ATP** provides an interface to interact with IQ's **Agent Tokenization Platform**. It enables users to:

✅ View **agent statistics** 📊  
✅ Check **token holdings** 💰  
✅ Execute **buy/sell trades** for AI agent tokens 🔄  

All trades use **IQ as the base currency**.

---

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @iqai/plugin-atp
```

---

## ⚙ Configuration

Set up your environment with the required wallet configuration:

| 🔧 Variable Name        | 📜 Description                                      |
|------------------------|-------------------------------------------------|
| `WALLET_PRIVATE_KEY`   | Your wallet's **private key** for transaction signing 🔑 |

---

## 🚀 Usage

Import and initialize the plugin:

```typescript
import { createATPPlugin } from "@iqai/plugin-atp";

// Initialize the plugin
const plugin = await createATPPlugin({
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
 });
```

---

## 🎯 Actions

### 📊 ATP_GET_AGENT_STATS

Fetch **statistics** for a specific AI agent.

💬 **Examples:**

- "Show me stats for agent `0x1234...5678`"
- "Details for agent `0x1234...5678`"
- "What are the stats of Frax God agent?" *(Works only if token contract found in previous messages)*

---

### 📈 ATP_GET_POSITIONS

Retrieve your **current holdings** in ATP AI tokens.

💬 **Examples:**

- "Show my ATP holdings"
- "What positions do I have in ATP?"
- "My holdings in ATP"

---

### 🛒 ATP_BUY_AGENT

Purchase AI agent tokens using **IQ as the base currency**.

💬 **Examples:**

- "Buy **1000 IQ** worth of agent `0x1234...5678`"
- "Purchase using **500 IQ** of Frax God"

---

### 💰 ATP_SELL_AGENT

Sell AI agent tokens **back to the protocol**.

💬 **Examples:**

- "Sell **50 tokens** of agent `0x1234...5678`"
- "Dispose **100 tokens** of Frax God" *(Works only if token contract found in previous messages)*
- "Sell **1 million tokens** of `0x1234...5678`"

---

## 📜 Response Format

Actions return **structured responses** including:

✔ **Transaction status & hash** (for trades) 🔗  
✔ **Formatted token amounts** 💲  
✔ **Error messages when applicable** ⚠  
✔ **Agent addresses and statistics** 🏷  

---

## ❌ Error Handling

The plugin **handles various error scenarios**:

🚨 **Invalid token contracts**  
💸 **Insufficient balances**  
🔄 **Transaction failures**  
🌐 **Network issues**  
🛑 **Input validation errors**  

---
