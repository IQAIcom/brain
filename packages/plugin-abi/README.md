# 🔗 Plugin ABI

The ABI plugin enables your agent to interact with any Ethereum-compatible smart contract by generating actions from the contract's ABI (Application Binary Interface).

## 📌 Overview

This plugin dynamically creates actions for interacting with blockchain smart contracts.

- ✅ Automatic action generation from contract ABI
- ✅ Support for both read (view/pure) and write functions
- ✅ Seamless integration with multiple blockchain networks
- ✅ Type-safe interactions with smart contracts
- ✅ Automatic error handling and transaction monitoring

## 🛠 Installation

Install the plugin using **pnpm**:

***bash
pnpm add @iqai/plugin-abi
***

After installation, you can use the plugin like this:

***typescript
import { AgentBuilder } from "@iqai/agent";
import { createAbiPlugin } from "@iqai/plugin-abi";
import { your-abi } from "your-abi";
import { fraxtal } from "viem/chains";

// Initialize the ABI plugin
const abiPlugin = await createAbiPlugin({
  abi: your-abi,
  contractName: "contract-name",
  contractAddress: "contract-address",
  description: "contract-description",
  privateKey: process.env.WALLET_PRIVATE_KEY,
  chain: fraxtal, // Optional, defaults to Fraxtal chain
});

// Add to agent
const agent = new AgentBuilder()
  .withPlugin(abiPlugin)
  .build();
***

## ⚙ Configuration

| 🔧 Variable Name      | 🌜 Description                                 |
|----------------------|----------------------------------------------|
| `WALLET_PRIVATE_KEY` | Private key for blockchain transactions 🔑    |

## 🚀 Example Usage

***typescript
import { createAbiPlugin } from "@iqai/plugin-abi";
import { erc20Abi } from "viem";

// Initialize the plugin with an ERC20 token contract
const abiPlugin = await createAbiPlugin({
  abi: erc20Abi,
  contractName: "ERC20",
  contractAddress: "0xaB195B090Cc60C1EFd4d1cEE94Bf441F5931C01b",
  description: "ERC20 token contract",
  privateKey: process.env.WALLET_PRIVATE_KEY,
});
***

## 🎯 Actions

The plugin dynamically creates actions based on the ABI functions provided. Each function in the ABI is transformed into an action.

### 💰 `ERC20_BALANCE_OF`

Check the token balance of a specific address.

💬 **Examples:**

- "Check the balance of address 0x1234...5678"
- "What's the token balance for 0x1234...5678"

### 💸 `ERC20_TRANSFER`

Transfer tokens to another address.

💬 **Examples:**

- "Transfer 10 tokens to 0x1234...5678"
- "Send 5 tokens to address 0x1234...5678"

## 🌜 Response Format

### Read Functions

***
✅ Successfully called balanceOf

Result: "1000000000000000000"
***

### Write Functions

***
✅ Successfully executed transfer

Transaction hash: 0x123abc...

You can view this transaction on the blockchain explorer.
***

## ❌ Error Handling

- 🚨 **Invalid function arguments** - "❌ Error parsing arguments: [specific error]"
- 🔄 **Transaction failures** - "❌ Error with [function]: [error message]"
- 🔒 **Access control errors** - "❌ Error with [function]: execution reverted"
- 🌐 **Network errors** - "❌ Error with [function]: network connection failed"
- 💲 **Insufficient funds** - "❌ Error with [function]: insufficient funds for gas" 