# 🤖 Brain Agent

A powerful and flexible AI agent setup package that allows you to quickly create and configure AI agents with various capabilities using a TypeScript-first approach.

## 📌 Overview

The @iqai/agent package uses a builder pattern for creating sophisticated AI agents with robust configuration options.

- ✅ Builder pattern for intuitive agent configuration
- ✅ Multiple client interface support (Direct, Telegram, Twitter)
- ✅ Multiple database adapters (SQLite, PostgreSQL, Supabase)
- ✅ Built-in caching system with multiple storage options
- ✅ Customizable character settings and personality
- ✅ Support for both Brain Framework and ElizaOS plugins
- ✅ Flexible database adapter system

## 🛠 Installation

Install the package using npm:

```bash
npm install @iqai/agent
```

Or with yarn:

```bash
yarn add @iqai/agent
```

Or with pnpm:

```bash
pnpm add @iqai/agent
```

## 🚀 Usage

Basic usage with builder pattern:

```typescript
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import DirectClientInterface from "@elizaos/client-direct";
import Database from "better-sqlite3";

async function main() {
  // Setup database
  const databaseAdapter = new SqliteDatabaseAdapter(
    new Database("./data/db.sqlite")
  );

  const agent = new AgentBuilder()
    .withDatabase(databaseAdapter)
    .withClient("direct", DirectClientInterface)
    .withModelProvider(ModelProviderName.OPENAI, process.env.OPENAI_API_KEY)
    .withCharacter({
      name: "MyBot",
      bio: "A helpful assistant",
      username: "mybot"
    })
    .build();

  await agent.start();
}

main().catch(console.error);
```

## 🎯 Actions

### 🏗️ `WITH_DATABASE`

Configure a database adapter for the agent.

💬 **Examples:**

- "Add SQLite database to my agent"
- "Configure PostgreSQL connection"

**Available options:**

```typescript
// SQLite
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import Database from "better-sqlite3";

const sqliteAdapter = new SqliteDatabaseAdapter(
  new Database("./data/db.sqlite")
);
.withDatabase(sqliteAdapter)

// PostgreSQL
import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";

const postgresAdapter = new PostgresDatabaseAdapter({
  connectionString: "postgresql://user:pass@localhost:5432/db"
});
.withDatabase(postgresAdapter)

// Supabase
import { SupabaseDatabaseAdapter } from "@elizaos/adapter-supabase";

const supabaseAdapter = new SupabaseDatabaseAdapter({
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY
});
.withDatabase(supabaseAdapter)
```

### 🔌 `WITH_CLIENT`

Add a client interface for the agent to communicate through.

💬 **Examples:**

- "Add Telegram interface to my agent"
- "Configure Direct client for my bot"

**Available clients:**

```typescript
// Direct chat
.withClient("direct", DirectClientInterface)

// Telegram bot
.withClient("telegram", TelegramClientInterface) 
// Requires TELEGRAM_BOT_TOKEN env variable

// Twitter bot
.withClient("twitter", TwitterClientInterface)   
// Requires Twitter API credentials
```

### 🧩 `WITH_PLUGIN`

Add plugins to extend the agent's capabilities. Supports both Brain Framework and ElizaOS plugins.

💬 **Examples:**

- "Add a fraxlend plugin to my agent"
- "Extend agent with odos capabilities"

```typescript
// Initialize plugins
const fraxlendPlugin = await createFraxlendPlugin({
  chain: fraxtal,
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
});

const odosPlugin = await createOdosPlugin({
  chain: fraxtal,
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
});

// Add multiple plugins
.withPlugins([fraxlendPlugin, odosPlugin])

// Add single plugin
.withPlugin(bootstrapPlugin)
```

### 🤖 `WITH_MODEL_PROVIDER`

Configure the AI model provider powering your agent.

💬 **Examples:**

- "Use OpenAI for my agent"
- "Configure model with API key"

```typescript
.withModelProvider(
  ModelProviderName.OPENAI,
  process.env.OPENAI_API_KEY
)
```

### 🎭 `WITH_CHARACTER`

Set the personality and character of the agent with detailed configuration.

💬 **Examples:**

- "Give my agent a professional personality"
- "Configure agent character with example messages"

```typescript
.withCharacter({
  name: "MyBot",        // Display name
  bio: "Description",   // Bot's description/purpose
  username: "mybot",    // Unique identifier

  // Example interactions
  messageExamples: [
    "Hello, how can I help?",
    "Let me check that for you."
  ],

  // Additional context/background
  lore: [
    "Created to help with customer service",
    "Specializes in technical support"
  ],

  // Response styling
  style: {
    all: ["Professional", "Helpful"],     // General style
    chat: ["Conversational", "Friendly"], // Chat-specific style
    post: ["Informative", "Clear"]        // Social media post style
  }
})
```

### 💾 `WITH_CACHE_STORE`

Configure the cache storage method.

💬 **Examples:**

- "Use database for caching"
- "Set up filesystem cache"

```typescript
.withCacheStore(CacheStore.DATABASE)
```

## 🌜 Response Format

The agent responses depend on the configured plugins and capabilities but generally include:

- ✔ **Success indicators** for operations
- 💬 **Message content** for conversations
- 📊 **Structured data** from plugin results
- 🔄 **Action results** from executed agent capabilities
- 📝 **Formatted outputs** based on character styling

## ❌ Error Handling

The agent handles various error scenarios:

🚨 **Configuration Errors**
- Missing required API keys or credentials
- Invalid database connection
- Incorrectly configured plugins

🌐 **Network Errors**
- Failed requests to model providers
- Timeout issues with external services
- API rate limiting issues

🔄 **Runtime Errors**
- Plugin execution failures
- Client interface connection issues
- Database transaction failures

Example error handling with proper production patterns:

```typescript
async function main() {
  try {
    const agent = new AgentBuilder()
      // ... configuration
      .build();

    await agent.start();
  } catch (error) {
    console.error("Failed to start agent:", error);
    process.exit(1);
  }
}

main().catch(console.error);
```

Graceful shutdown handling:

```typescript
const agent = new AgentBuilder()
    // ... configuration ...
    .build();

process.on('SIGTERM', async () => {
    await agent.stop();
    process.exit(0);
});

await agent.start();
```
