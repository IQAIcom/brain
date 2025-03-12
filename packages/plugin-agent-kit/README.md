# 🎧 Plugin AgentKit

AgentKit plugin for Eliza that enables interaction with CDP AgentKit tools for NFT and token management on Coinbase's CDP platform.

## 📌 Overview

This plugin integrates Coinbase's CDP AgentKit tools into your agent, providing:

✅ Wallet management for blockchain interactions
✅ NFT creation, deployment, and minting capabilities
✅ Token creation and management functionality 
✅ Trading and transfer operations for digital assets
✅ Network support for Base Sepolia and Base Mainnet

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm install @iqai/plugin-agentkit
```

After installation, you can use the plugin like this:

```typescript
import { AgentKit } from "@iqai/plugin-agentkit";

// Initialize the plugin with your configuration
const agentKitPlugin = new AgentKit({
  apiKeyName: process.env.CDP_API_KEY_NAME,
  privateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
  network: process.env.CDP_AGENT_KIT_NETWORK || 'base-sepolia'
});

// Add to your agent configuration
const agent = new AgentBuilder()
  .withPlugin(agentKitPlugin)
  .build();
```

## ⚙ Configuration

| 🔧 Variable Name | 🌜 Description |
|------------------|---------------|
| `CDP_API_KEY_NAME` | Your CDP API key name for authentication 🔑 |
| `CDP_API_KEY_PRIVATE_KEY` | Your private key for transactions 🛡️ |
| `CDP_AGENT_KIT_NETWORK` | Network to use (defaults to base-sepolia) 🌐 |

You can also add the plugin to your character configuration:

```json
{
    "plugins": ["@elizaos/plugin-agentkit"],
    "settings": {
        "secrets": {
            "CDP_API_KEY_NAME": "your_key_name",
            "CDP_API_KEY_PRIVATE_KEY": "your_private_key"
        }
    }
}
```

## 🎯 Actions

### 💼 `GET_WALLET_DETAILS`

Retrieve information about the agent's wallet including address and balances.

💬 **Examples:**
- "Can you show me my wallet details?"
- "What's my wallet address?"
- "Display my wallet information"

### 🖼️ `DEPLOY_NFT`

Deploy a new NFT collection on the blockchain.

💬 **Examples:**
- "Deploy a new NFT collection called 'Music NFTs' with symbol 'MUSIC'"
- "Create an NFT collection named 'Digital Art' with the symbol 'DART'"

### 💰 `DEPLOY_TOKEN`

Deploy a new token on the blockchain.

💬 **Examples:**
- "Deploy a new token called 'Artist Token' with symbol 'ART'"
- "Create a token with the name 'Community Points' and symbol 'CPS'"

### 💵 `GET_BALANCE`

Check token or NFT balance in the wallet.

💬 **Examples:**
- "What's my current balance?"
- "Check my NFT balance for collection 0x1234..."
- "How many tokens do I have?"

### 🎨 `MINT_NFT`

Mint new NFTs from an existing collection.

💬 **Examples:**
- "Mint 5 NFTs from my 'Music NFTs' collection"
- "Create 3 new NFTs in my collection at 0x5678..."

### 📝 `REGISTER_BASENAME`

Register a basename for NFTs.

💬 **Examples:**
- "Register 'myartcollection' as a basename for my NFTs"
- "Create a new basename 'digitalart' for my collection"

### 🚰 `REQUEST_FAUCET_FUNDS`

Request testnet funds for development and testing.

💬 **Examples:**
- "Request testnet funds"
- "Get some test ETH for development"

### 🔄 `TRADE`

Execute trades between tokens.

💬 **Examples:**
- "Trade 10 DAI for ETH"
- "Swap 5 USDC for BTC"

### ↗️ `TRANSFER`

Transfer tokens or NFTs to another address.

💬 **Examples:**
- "Transfer 20 USDC to 0x1234..."
- "Send my NFT with ID #42 to 0x5678..."

### 🛒 `WOW_BUY_TOKEN`

Buy WOW tokens.

💬 **Examples:**
- "Buy 50 WOW tokens"
- "Purchase WOW tokens with 10 USDC"

### 💱 `WOW_SELL_TOKEN`

Sell WOW tokens.

💬 **Examples:**
- "Sell 30 WOW tokens"
- "Exchange my WOW tokens for USDC"

### ✨ `WOW_CREATE_TOKEN`

Create new WOW tokens.

💬 **Examples:**
- "Create a new WOW token called 'Creator Coin' with symbol 'CC'"
- "Make a WOW token named 'Community Token'"

## 🌜 Response Format

Responses from the plugin typically include:

- ✔ **Status**: Success or failure of the operation
- 🔗 **Transaction Hash**: When blockchain transactions are executed
- 💲 **Asset Details**: Information about tokens or NFTs
- 🏷️ **Collection Information**: For NFT operations
- 📊 **Balances**: Current wallet balances when requested

## ❌ Error Handling

The plugin handles various error scenarios:

- 🚨 **Authentication Errors**: Issues with API keys or credentials
- 🌐 **Network Issues**: Problems connecting to the blockchain network
- 💸 **Insufficient Funds**: Not enough balance for transactions
- 🔄 **Transaction Failures**: When blockchain operations fail
- 🚫 **Invalid Parameters**: When provided inputs are incorrect

## 🌐 Network Support

The plugin supports the following networks:

- Base Sepolia (default)
- Base Mainnet

Configure the network using the `CDP_AGENT_KIT_NETWORK` environment variable.

## 🔧 Development

Build the plugin:

```bash
pnpm build
```

Run in development mode:

```bash
pnpm dev
```

## 📦 Dependencies

- @elizaos/core
- @coinbase/cdp-agentkit-core
- @coinbase/cdp-langchain
- @langchain/core

## 📄 License

MIT
