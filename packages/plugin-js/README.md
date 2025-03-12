# 🔄 Plugin JS

A plugin for securely executing JavaScript code within the Brain Framework, providing a sandboxed environment for running arbitrary JavaScript snippets.

## 📌 Overview

- **Execution Service:** Handles secure JavaScript execution in an isolated VM.
- **Action Handler:** Manages extracting code from messages and formatting responses.

## 🛠 Installation

Install the plugin using pnpm:

```bash
pnpm add @iqai/plugin-js
```

## ⚙ Configuration

Configure the plugin with the following parameters:

| Param Name   | Description                                             | Default Value |
| ------------ | ------------------------------------------------------- | ------------- |
| memoryLimit  | Maximum memory available to JavaScript execution (MB) | 128           |
| timeout      | Maximum execution time allowed (ms)                   | 5000          |

## 🚀 Usage

### Basic Configuration

```typescript
import { createJsPlugin } from "@iqai/plugin-js";

// Initialize the plugin with default settings
const plugin = await createJsPlugin();
```

### Custom Configuration

```typescript
import { createJsPlugin } from "@iqai/plugin-js";

// Initialize the plugin with custom memory and timeout settings
const plugin = await createJsPlugin({
  memoryLimit: 256,  // 256MB memory limit
  timeout: 10000     // 10-second timeout
});
```

Once initialized, the plugin adds the `JS_EXECUTE` action to your agent, which can be triggered with commands like "run this JavaScript" or "execute this code" followed by the JavaScript code.

## ❌ Error Handling

The plugin handles various error scenarios, including:

- **Syntax Errors:** Detected during code compilation.
- **Runtime Errors:** Caught during code execution.
- **Timeout Errors:** When execution exceeds the configured time limit.
- **Memory Errors:** When the code attempts to use more memory than allowed.
- **Catastrophic Errors:** Severe VM failures that require recreation of the environment.

Errors are logged and returned with informative messages to help users understand and fix issues in their code.

## 🔒 Security Considerations

The plugin implements several security measures:

- **Isolation:** Code runs in a completely isolated virtual machine.
- **Resource Limiting:** Memory and execution time are strictly limited.
- **Console Access Only:** No access to Node.js modules, filesystem, or network.
- **Error Containment:** Errors cannot escape the sandbox environment.
- **Automatic Resource Cleanup:** VM resources are properly disposed after execution.

## 💻 Example Interactions

```javascript
// User: Run this JavaScript:
const numbers = [1, 2, 3, 4, 5];
console.log(numbers.map(n => n * 2));
return numbers.reduce((sum, n) => sum + n, 0);

// Agent: ✅ JavaScript Execution Successful
//
// Result: 15
//
// Console Output:
// [2, 4, 6, 8, 10]
//
// Execution Stats:
// ⏱️ CPU Time: 0.35ms
// 🧠 Memory Used: 2.45MB
```

## Learn More

For more details on secure JavaScript execution in isolated environments, refer to:

- [isolated-vm on GitHub](https://github.com/laverdet/isolated-vm)
