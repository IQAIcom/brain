# 🤖 Brain Agent

A powerful and flexible AI agent setup package that allows you to quickly create and configure AI agents with various capabilities using a TypeScript-first approach.

## 📌 Overview

The @iqai/agent package uses a builder pattern for creating sophisticated AI agents with robust configuration options.

- ✅ Builder pattern for intuitive agent configuration
- ✅ Multiple client interface support (Direct, Telegram, Twitter, and more)
- ✅ Multiple database adapters (SQLite, PostgreSQL, Supabase, and more)
- ✅ Built-in caching system with multiple storage options
- ✅ Customizable character settings and personality
- ✅ Support for both Brain Framework and ElizaOS plugins


## 📚 Documentation

Visit [https://brain.iqai.com](https://brain.iqai.com) to view the full documentation, including tutorials, API references, and best practices.

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
import SqliteAdapter from "@elizaos/adapter-sqlite";
import DirectClient from "@elizaos/client-direct";


async function main() {

  const agent = new AgentBuilder()
    .withDatabase(SqliteAdapter)
    .withClient(DirectClient)
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

**Available options:**

```typescript
// SQLite
import SqliteAdapter from "@elizaos/adapter-sqlite";


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

**Available clients:**

```typescript
// Direct chat
.withClient(DirectClient)

// Telegram bot
.withClient(TelegramClient) 
// Requires TELEGRAM_BOT_TOKEN env variable

// Twitter bot
.withClient(TwitterClient)   
// Requires Twitter API credentials
```

### 🧩 `WITH_PLUGIN`

Add plugins to extend the agent's capabilities. Supports both Brain Framework and ElizaOS plugins.

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

```typescript
.withModelProvider(
  ModelProviderName.OPENAI,
  process.env.OPENAI_API_KEY
)
```

### 🎭 `WITH_CHARACTER`

Set the personality and character of the agent with detailed configuration.

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

```typescript
.withCacheStore(CacheStore.DATABASE)
```

### 📊 `WITH_TELEMETRY`

Enables LLM request/response telemetry with Open Telemetry via Vercel AI SDK.

For example, here is how you can enable [telemetry with langsmith](https://docs.smith.langchain.com/observability/how_to_guides/trace_with_vercel_ai_sdk):

```typescript
import { Client } from "langsmith";
import { AISDKExporter } from "langsmith/vercel";

// Initialize Langsmith exporter
const traceExporter = new AISDKExporter({ client: new Client() })

// Enable telemetry with Langsmith exporter
const agent = new AgentBuilder()
  .withTelemetry(traceExporter)
  //... other configurations ...
  .build();
```

Similar, you can enable telemetry with other providers like Langfuse, Honeycomb, laminar etc.

for more information on observability integrations, see the [Vercel AI SDK documentation](https://sdk.vercel.ai/providers/observability).


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
