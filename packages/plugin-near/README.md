# 🌊 Plugin NEAR

A NEAR Protocol integration plugin enabling smart contract interaction, transaction handling, and event listening on the NEAR blockchain.

## 📌 Overview

This plugin provides seamless integration with the NEAR Protocol blockchain.

- ✅ Execute contract methods and transactions on NEAR blockchain
- ✅ Listen to and respond to contract events
- ✅ View contract data and account information
- ✅ Handle custom logic through event listeners

## 🛠 Installation

Install the plugin using **pnpm**:

***bash
pnpm add @iqai/plugin-near
***

After installation, you can use the plugin like this:

***typescript
import createNearPlugin from "@iqai/plugin-near";
const nearPlugin = await createNearPlugin(options);

const agent = new AgentBuilder()
  ...
  .withPlugin(nearPlugin)
***

## ⚙ Configuration

| 🔧 Variable Name      | 🌜 Description                                       |
|----------------------|---------------------------------------------------|
| `NEAR_ACCOUNT_ID`    | Your NEAR account ID for authentication 🆔         |
| `NEAR_PRIVATE_KEY`   | Private key for your NEAR account 🔑               |

## 🚀 Usage

***typescript
import createNearPlugin from "@iqai/plugin-near";

// Initialize the plugin
const nearPlugin = await createNearPlugin({
  accountId: process.env.NEAR_ACCOUNT_ID,
  accountKey: process.env.NEAR_PRIVATE_KEY,
  listeners: [
    {
      eventName: "run_agent",
      contractId: "your-contract.testnet",
      responseMethodName: "agent_response",
      handler: async (payload, { account }) => {
        // Custom event handling logic
        return "result";
      },
    }
  ],
  networkConfig: {
    networkId: "testnet", // or "mainnet"
    nodeUrl: "https://test.rpc.fastnear.com",
  },
});
***

## 🎯 Actions

### 🔄 `NEAR_CALL_CONTRACT`

Execute a function on a NEAR smart contract.

💬 **Examples:**
- "Call the 'swap' function on contract 'swap.testnet' with 10 tokens"
- "Execute 'stake' on 'staking.near' with 50 NEAR"

### 👁️ `NEAR_VIEW_CONTRACT`

View data from a NEAR smart contract without modifying state.

💬 **Examples:**
- "Check the balance of account 'alice.near' on token contract"
- "View total supply of 'token.testnet'"

### 📡 `NEAR_LISTEN_EVENTS`

Configure listeners for specific contract events.

💬 **Examples:**
- "Listen for 'deposit' events on 'bank.near'"
- "Set up a listener for 'transfer' events"

## 🌜 Response Format

Responses from the NEAR plugin typically include:

- ✔ **Transaction status** (Success/Failure)
- 🔗 **Transaction hash** when applicable
- 📊 **Formatted response data** from contract calls
- 🏷 **Account information** when relevant

## ❌ Error Handling

The plugin handles common NEAR-related errors:

- 🚨 **Invalid contract calls** or method names
- 💸 **Insufficient account balance** for transactions
- 🔑 **Authentication issues** with account credentials
- 🌐 **Network connectivity problems** with NEAR RPC
- 🚫 **Contract execution errors** returned by smart contracts
