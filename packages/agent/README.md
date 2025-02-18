# @iqai/agent

A powerful and flexible AI agent setup package that allows you to quickly create and configure AI agents with various capabilities.

## Features

- 🤖 Easy agent setup with builder pattern
- 🔌 Multiple client interface support (Direct, Telegram, Twitter)
- 💾 Built-in caching system with database and filesystem support
- 🔧 Customizable character settings
- 🧩 Plugin system support
- 🗄️ Database adapter flexibility

## Installation

```bash
npm install @iqai/agent
```

## Quick Start

Basic usage with builder pattern:

```typescript
import Database from "better-sqlite3";
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";

const agent = new AgentBuilder()
 .withDatabase(new SqliteDatabaseAdapter(new Database()))
 .withModelProvider(ModelProviderName.OPENAI, "your-openai-key")
 .build();

await agent.start();
```

## Advanced Configuration

Full configuration example showcasing all builder capabilities:

```typescript
import Database from "better-sqlite3";
import { AgentBuilder } from '@iqai/agent';
import { CacheStore, ModelProviderName } from '@elizaos/core';

const agent = new AgentBuilder()
    // Database Configuration
    .withDatabase(new SqliteDatabaseAdapter(new Database()))
    
    // Client Interfaces
    .withClient('telegram', new TelegramClientInterface())
    .withClient('twitter', new TwitterClientInterface())
    
    // Model Configuration
    .withModelProvider(ModelProviderName.OPENAI, 'your-openai-key')
    
    // Plugins
    .withPlugin(bootstrapPlugin)
    .withPlugin(customPlugin)
    
    // Character Configuration
    .withCharacter({
        name: "BrainBot",
        bio: "A helpful AI assistant",
        username: "brainbot"
    })
    
    // Cache Configuration
    .withCacheStore(CacheStore.DATABASE)
    
    .build();

await agent.start();
```

## Error Handling

Proper error handling with async/await:

```typescript
try {
    const agent = new AgentBuilder()
        .withDatabase(databaseAdapter)
        .withModelProvider(ModelProviderName.OPENAI, process.env.OPENAI_API_KEY!)
        .build();
        
    await agent.start();
} catch (error) {
    console.error('Agent setup failed:', error);
}
```

## Graceful Shutdown

Handling application shutdown properly:

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

## API Reference

### AgentBuilder Methods

- `withDatabase(adapter)`: Configure database adapter
- `withClient(name, client)`: Add a client interface
- `withPlugin(plugin)`: Add a plugin
- `withModelProvider(provider, key)`: Configure AI model
- `withCharacter(character)`: Set agent character
- `withCacheStore(store)`: Configure cache storage
- `build()`: Create the Agent instance

### Agent Methods

- `start()`: Initialize and start the agent
- `stop()`: Gracefully shutdown the agent
- `getClients()`: Get configured client interfaces
