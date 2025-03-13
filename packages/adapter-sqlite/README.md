# 💽 SQLite Adapter

A wrapper around [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3) for use with the [ElizaOS](https://github.com/elizaos/elizaos) framework.

## 🛠 Installation

Install the package using npm:

```bash
npm install @iqai/adapter-sqlite
```

Or with yarn:

```bash
yarn add @iqai/adapter-sqlite
```

Or with pnpm:

```bash
pnpm add @iqai/adapter-sqlite
```

## 🚀 Usage

Basic usage:

```typescript
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { SqliteDatabaseAdapter } from "@iqai/adapter-sqlite";

async function main() {
  // Setup database
  const databaseAdapter = new SqliteDatabaseAdapter();

  const agent = new AgentBuilder()
    .withDatabase(databaseAdapter)
    // More options...
    .build();

  await agent.start();
}

main().catch(console.error);
```
