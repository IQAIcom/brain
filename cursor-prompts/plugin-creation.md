# Brain Framework Plugin Creation Guide

## Plugin Structure

Plugins are organized under the `packages` directory following this structure:

```bash
packages/
  plugin-your-feature/
    src/
      __tests__/      # Test files
      actions/   # Action definitions
      services/  # Services for business logic
      lib/       # Utility functions
    index.ts    # Main plugin export
    types.ts    # Type definitions
    README.md   # Plugin documentation
    package.json
```

---

## Core Components

### 1. Plugin Entry (`index.ts`)

```typescript
export async function createYourPlugin(opts: YourPluginParams): Promise<Plugin> {
  const actions = [
    getActionOne(opts),
    getActionTwo(opts),
  ];

  return {
    name: "Your Plugin",
    description: "Description of your plugin",
    providers: [],
    evaluators: [],
    services: [],
    actions,
  };
}

export default createYourPlugin;
```

---

## Actions

### Guidelines for Actions

- Use **descriptive names**.
- Include **similes** for natural language matching.
- Implement **proper error handling**.
- Use `elizaLogger` for debugging.
- Follow the `Action` interface from `@elizaos/core`.

### Example Action Structure

```typescript
export const getYourAction = (opts: YourPluginParams): Action => {
  return {
    name: "YOUR_ACTION_NAME",
    description: "What your action does",
    similes: [
      "ALTERNATIVE_COMMAND_1",
      "ALTERNATIVE_COMMAND_2"
    ],
    validate: async () => true,
    handler: handler(opts),
    examples: [
      {
        user: "user"
        content:{text: "EXAMPLE_COMMAND"},
      },
      ....
    ],
  };
};

const handler: (opts: YourPluginParams) => Handler =
  (opts) => async (_runtime, _message, _state, _options, callback) => {
    elizaLogger.info('Starting action');
    try {
      // Action logic
      elizaLogger.info('Action completed');
      return true;
    } catch (error) {
      elizaLogger.error('Action failed', { error });
      return false;
    }
  };
```

---

## Required Elements

- **TypeScript**: Use TypeScript for all code files.
- **Tests**: Include tests under the `__tests__` directory.
- **Documentation**: Provide a detailed `README.md`.
- **Logging**: Use `elizaLogger` for consistent debugging.
- **Error Handling**: Implement `try-catch` blocks in all actions.

---

## Best Practices

- Use **kebab-case** for plugin names (e.g., `plugin-your-feature`).
- Follow a **consistent logging format**.
- Implement **proper type definitions**.
- Keep **services separate** from actions.
- Use **meaningful and descriptive naming** for functions and variables.

This guide reflects the actual structure used in the Brain Framework, including the ATP plugin example provided in the codebase context.
