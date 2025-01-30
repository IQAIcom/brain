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

```typescript
import { Agent } from '@iqai/agent';

const agent = new Agent({
  openAiKey: 'your-openai-key'
});

await agent.start();
```

## Advanced Configuration

Full configuration example with all available options:

```typescript
import { Agent } from '@iqai/agent';

const agent = new Agent({
  // Model Configuration
  modelProvider: ModelProviderName.OPENAI,
  openAiKey: 'your-openai-key',

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
  cacheStore: CacheStore.DATABASE
});

await agent.start();
```

## Best Practices

1. Always handle errors when setting up the agent:
```typescript
try {
  const agent = new Agent(config);
  await agent.start();
} catch (error) {
  console.error('Failed to setup agent:', error);
}
```

2. Close the agent properly when shutting down:
```typescript
process.on('SIGTERM', async () => {
  await agent.stop();
  process.exit(0);
});
```


## Contributing

Contributions are welcome! Please check our contributing guidelines for details.

## License

MIT
