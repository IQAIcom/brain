# Plugin Documentation Structure Template

Use this structured prompt to ensure that all plugin documentation follows a consistent format in Astro/MDX. Each plugin differs in functionality, but the documentation should always contain the following sections.

---

title: "Plugin <PLUGIN_NAME>"
description: "Documentation for the <PLUGIN_NAME> Astro plugin."

---

## Overview

Provide a high-level summary of what the plugin does and its primary use case.

## Installation

Include installation steps, specifying the package manager and command to use.

```bash
pnpm add @plugin-name/package
```

## Configuration

List any required environment variables or configuration settings. Use a table format where applicable.

| Variable Name        | Description                     |
| -------------------- | ------------------------------- |
| `API_KEY`            | API key for authentication      |
| `WALLET_PRIVATE_KEY` | Wallet private key for security |

## Usage

Describe how to initialize and use the plugin. Provide example code snippets.

```tsx
import { createPlugin } from "@plugin-name/package";

const plugin = await createPlugin({
  apiKey: process.env.API_KEY,
});
```

## Actions

Document the key actions available in the plugin.

### Example

### `PLUGIN_GET_STATS`

Retrieve statistics for a specific entity.

```tsx
const stats = await plugin.getStats("0x1234...5678");
console.log(stats);
```

## API Response Format

Provide an example of the API response format.

```json
{
  "status": "success",
  "data": {
    "id": "0x1234...5678",
    "value": 1000,
    "currency": "IQ"
  }
}
```

## Error Handling

List common errors the plugin may encounter and how they should be handled.

## Best Practices

- Store API keys securely.
- Follow rate limits.
- Implement structured error handling.

## Conclusion

Ensure users understand how to integrate and use the plugin effectively. Keep the documentation concise and structured.
