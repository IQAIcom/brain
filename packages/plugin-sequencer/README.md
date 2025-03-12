# 🔄 Plugin Sequencer

The Sequencer plugin enables your agent to execute complex multi-step operations by coordinating sequences of actions with state management across steps.


## 📌 Overview

The Sequencer plugin transforms simple agents into workflow orchestrators capable of handling complex scenarios.

- ✅ Coordinates multiple actions in a specific sequence
- ✅ Handles state and context preservation across actions
- ✅ Provides detailed execution feedback
- ✅ Enables complex multi-step agent operations
- ✅ Creates powerful automation workflows


## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @iqai/plugin-sequencer
```

After installation, you can use the plugin like this:

```typescript
import { AgentBuilder } from "@iqai/agent";
import createSequencerPlugin from "@iqai/plugin-sequencer";

// Initialize plugin
const sequencerPlugin = await createSequencerPlugin();

// Add to agent
const agent = new AgentBuilder()
  .withPlugin(sequencerPlugin)
  .build();
```

## 🚀 Usage

```typescript
import { AgentBuilder, ModelProviderName } from "@iqai/agent";
import createSequencerPlugin from "@iqai/plugin-sequencer";

async function main() {
  // Initialize Sequencer plugin
  const sequencerPlugin = await createSequencerPlugin();

  // Create agent with plugin
  const agent = new AgentBuilder()
   .withModelProvider(
      ModelProviderName.OPENAI,
      process.env.OPENAI_API_KEY
    )
    .withPlugins([sequencerPlugin])
    .build();

  await agent.start();
}

main().catch(console.error);
```
