# @iqai/agent

A powerful and flexible AI agent setup package that allows you to quickly create and configure AI agents with various capabilities.

## Features

- 🤖 Easy agent setup and configuration
- 🔌 Multiple client interface support (Direct, Telegram, Twitter)
- 💾 Built-in caching system
- 🔧 Customizable character settings
- 🧩 Plugin system support
- 🗄️ SQLite database integration

## Installation

``` bash
npm install @iqai/agent
```

## Quick Start

Basic usage with minimal configuration:

``` typescript
import { setupAgent } from '@iqai/agent';

const agent = await setupAgent({
  openAiKey: 'your-openai-key'
});
```

## Advanced Configuration

Full configuration example with all available options:

``` typescript
import { setupAgent, ModelProviderName } from '@iqai/agent';

const agent = await setupAgent({
  // Model Configuration
  modelProvider: ModelProviderName.OPENAI,
  openAiKey: 'your-openai-key',

  // Character Configuration
  character: {
    bio: "I am a specialized AI assistant",
    messageExamples: [
      "How can I help you today?",
      "Let me assist you with that."
    ],
    style: {
      all: ["professional", "concise"],
      chat: ["friendly"],
      post: ["formal"]
    }
  },

  // Client Interfaces
  clients: {
    direct: {
      enabled: true,
      port: 3000
    },
    telegram: {
      token: 'your-telegram-bot-token'
    },
    twitter: {
      username: 'your-twitter-username',
      password: 'your-twitter-password'
    }
  },

  // Storage Configuration
  databasePath: './custom/path/to/data',
  cacheStore: CacheStore.DATABASE // or CacheStore.FILESYSTEM
});
```

## Advanced Usage

### Using Individual Services

You can also use individual services for more granular control:

``` typescript
import {
  setupDatabase,
  setupCacheSystem,
  createAgentRuntime,
  setupClientInterfaces
} from '@iqai/agent';

// Setup database
const database = setupDatabase('./custom/path');

// Setup cache
const cache = setupCacheSystem(database);

// Create runtime
const runtime = await createAgentRuntime(database, cache, {
  // your config here
});

// Setup clients
const clients = await setupClientInterfaces(runtime, {
  direct: { enabled: true }
});
```

## Configuration Options

### AgentConfig

| Option | Type | Description |
|--------|------|-------------|
| modelProvider | ModelProviderName | The AI model provider (default: OPENAI) |
| openAiKey | string | Your OpenAI API key |
| character | CharacterConfig | Agent personality configuration |
| clients | ClientConfig | Client interface settings |
| cdpConfig | CDPConfig | CDP integration configuration |
| databasePath | string | Custom database location |
| cacheStore | CacheStore | Cache storage type |
| plugins | Plugin[] | Additional plugins to extend functionality |

### ClientConfig

| Option | Type | Description |
|--------|------|-------------|
| direct.enabled | boolean | Enable direct client interface |
| direct.port | number | Port for direct client (default: 3000) |
| telegram.token | string | Telegram bot token |
| twitter.username | string | Twitter account username |
| twitter.password | string | Twitter account password |

## Environment Variables

The package supports these environment variables:

``` env
OPENAI_API_KEY=your-openai-key
CDP_NETWORK_ID=your-network-id
CDP_API_KEY_NAME=your-key-name
CDP_API_KEY_PRIVATE_KEY=your-private-key
TELEGRAM_BOT_TOKEN=your-telegram-token
```

## Best Practices

1. Always handle errors when setting up the agent:
``` typescript
try {
  const agent = await setupAgent(config);
} catch (error) {
  console.error('Failed to setup agent:', error);
}
```

2. Close the agent properly when shutting down:
``` typescript
process.on('SIGTERM', async () => {
  await agent.close();
  process.exit(0);
});
```

3. Use environment variables for sensitive information:
``` typescript
const agent = await setupAgent({
  openAiKey: process.env.OPENAI_API_KEY
});
```

## Contributing

Contributions are welcome! Please check our contributing guidelines for details.

## License

MIT
