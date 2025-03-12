# 🔄 Plugin Odos

The Odos plugin enables your agent to perform token swaps and exchanges using the Odos protocol with optimized routing and competitive rates.

## 📌 Overview

The Odos plugin integrates token swap operations into your agent, allowing seamless cryptocurrency exchanges.

- ✅ Optimized routing for token exchanges
- ✅ Competitive swap rates
- ✅ Support for multiple blockchain networks
- ✅ Simple integration with agent architecture

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @iqai/plugin-odos
```

After installation, you can use the plugin like this:

```typescript
import { AgentBuilder } from "@iqai/agent";
import { createOdosPlugin } from "@iqai/plugin-odos";
import { fraxtal } from "viem/chains";

// Initialize plugin
const odosPlugin = await createOdosPlugin({
  chain: fraxtal,
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
});

// Add to agent
const agent = new AgentBuilder()
  .withPlugin(odosPlugin)
  .build();
```

## ⚙ Configuration

| 🔧 Variable Name     | 🌜 Description                                          |
|---------------------|--------------------------------------------------------|
| `WALLET_PRIVATE_KEY` | Your wallet's private key for transactions 🔑          |
| `OPENAI_API_KEY`    | OpenAI API key (if using with OpenAI-based agents) 🤖 |

## 🚀 Usage

```typescript
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { createOdosPlugin } from "@iqai/plugin-odos";
import { fraxtal } from "viem/chains";

async function main() {
  // Initialize Odos plugin
  const odosPlugin = await createOdosPlugin({
    chain: fraxtal, // The blockchain to use for swaps
    walletPrivateKey: process.env.WALLET_PRIVATE_KEY, // Your wallet private key
  });

  // Create agent with plugin
  const agent = new AgentBuilder()
    .withModelProvider(
      ModelProviderName.OPENAI,
      process.env.OPENAI_API_KEY
    )
    .withPlugin(odosPlugin)
    .build();

  await agent.start();
}
```

## 🎯 Actions

### 📊 `GET_SWAP_QUOTE`

Retrieves a quote for swapping tokens, showing expected rates and amounts.

💬 **Examples:**
- "Get me a quote for swapping 1 wfrxEth to FRAX on Fraxtal"
- "What rate would I get for trading 0.5 ETH to USDC?"
- "Check current exchange rate between DAI and FXS"

### 💱 `EXECUTE_TOKEN_SWAP`

Performs a token swap between any supported tokens on the configured chain.

💬 **Examples:**
- "Swap 100 DAI to FXS"
- "Exchange 0.1 ETH for USDT"
- "Trade my wfrxEth for FRAX"

