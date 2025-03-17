# 💽 SQLite Adapter

A wrapper around [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) for use with the [ElizaOS](https://github.com/elizaos/elizaos) framework.

## 🛠 Installation

Install the package using npm:

```bash
npm install @elizaos/adapter-sqlite
```

Or with yarn:

```bash
yarn add @elizaos/adapter-sqlite
```

Or with pnpm:

```bash
pnpm add @elizaos/adapter-sqlite
```

## 🚀 Usage

Basic usage:

```typescript
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import SqliteAdapter from "@elizaos/adapter-sqlite";

async function main() {

  const agent = new AgentBuilder()
    .withDatabase(SqliteAdapter)
    // More options...
    .build();

  await agent.start();
}

main().catch(console.error);
```
