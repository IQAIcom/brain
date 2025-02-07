# Plugin ATP

A plugin for interacting with IQ ATP (Agent Tokenization Platform) for buying, selling, and managing AI agent tokens.

## Overview

The Plugin ATP provides an interface to interact with IQ's Agent Tokenization Platform. It enables users to view agent statistics, check token holdings, and execute trades (buy/sell) for AI agent tokens using IQ as the base currency.

## Installation

```bash
pnpm add @iqai/plugin-atp
```

## Configuration

Set up your environment with the required wallet configuration:

| Variable Name | Description |
|--------------|-------------|
| WALLET_PRIVATE_KEY | Your wallet's private key for transaction signing |

## Usage

```typescript
import { atpPlugin } from "@iqai/plugin-atp";
// Initialize the plugin
const plugin = atpPlugin;
```

## Actions

### ATP_GET_AGENT_STATS

Fetches statistics for a specific AI agent.

Examples:

- "Show me stats for agent 0x1234...5678"
- "What are the stats of Frax god agent"

### ATP_GET_POSITIONS

Retrieves your current holdings in ATP AI tokens.

Examples:

- "Show my ATP holdings"
- "What positions do I have in ATP"

### ATP_BUY_AGENT

Purchases AI agent tokens using IQ as the base currency.

Examples:

- "Buy with 1000 IQ of agent 0x1234...5678"
- "Purchase using 500 IQ of Frax God"

### ATP_SELL_AGENT

Sells AI agent tokens back to the protocol.

Examples:

- "Sell 50 tokens of agent 0x1234...5678"
- "Dispose 100 tokens of Frax God"

## Response Format

Actions return structured responses including:

- Transaction status and hash (for trades)
- Formatted token amounts
- Error messages when applicable
- Agent addresses and statistics

## Error Handling

The plugin handles various scenarios:

- Invalid token contracts
- Insufficient balances
- Transaction failures
- Network issues
- Input validation errors
