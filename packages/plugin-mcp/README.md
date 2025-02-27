# 🎛 Plugin MCP

A **plugin** for interacting with **Model Context Protocol (MCP) servers** to mediate communication between the Brain Framework and external MCP servers.

---

## 📌 Overview

The **Plugin MCP** acts as a mediator between Brain framework and an MCP server. It connects to an MCP server—either locally via stdio or remotely via SSE—retrieves available tools and converts them into actions that the Brain Framework can execute. The actions are generated dynamically based on the MCP server’s capabilities.

There are two ways to configure the plugin:

- **Stdio Mode:** For local MCP servers using process-based communication.
- **SSE Mode:** For remote MCP servers using Server-Sent Events.

---

## 🛠 Installation

Install the plugin using **pnpm**:

```bash
pnpm add @iqai/plugin-mcp
```

---

## ⚙ Configuration

Configure the plugin for either **stdio** or **sse** modes.

### Stdio Mode

Use **stdio** mode when you want to run a local MCP server as a separate process.

| 🔧 Param Name      | 📜 Description                                                     |
|-----------------------|---------------------------------------------------------------------|
| `command`   | Command to run the local MCP server process                         |
| `args`      | Arguments for the local MCP server process (string list)   |

### SSE Mode

Use **sse** mode to connect to a remote MCP server via Server-Sent Events. *(Note: Authentication is not supported for SSE mode at this time.)*

| 🔧 Param Name    | 📜 Description                              |
|---------------------|----------------------------------------------|
| `serverUrl`    | The base URL of the remote MCP server        |
| `headers`    | Headers to include (if any) in the request to the remote server |

---

## 🚀 Usage

Import and initialize the plugin using the `createMcpPlugin` method.

### For a Local MCP Server (Stdio Mode)

```typescript
import { createMcpPlugin } from "@iqai/plugin-mcp";

// Initialize the plugin with stdio configuration
const plugin = await createMcpPlugin({
  mode: "stdio",
  command: "node",
  args: ["server.js"]
});
```

### For a Remote MCP Server (SSE Mode)

```typescript
import { createMcpPlugin } from "@iqai/plugin-mcp";

// Initialize the plugin with sse configuration
const plugin = await createMcpPlugin({
  mode: "sse",
  serverUrl: "YOUR_SERVER_URL",
  headers: {}
});
```

Once initialized, the plugin dynamically generates actions based on the MCP server's available tools, prompts, and resources.

---

## ❌ Error Handling

The plugin manages various error scenarios, such as:

- **Connection failures** to the MCP server.
- **Invalid tool, prompt, or resource requests.**
- **Network errors or unexpected server responses.**

Errors are logged and relayed as informative messages to the Brain UI.

---

## 🔒 Security Considerations

For SSE mode:

- Ensure you are connecting to a trusted MCP server.
- Use HTTPS endpoints for secure communication.
- Validate all configuration parameters to avoid misconfigurations.

---

## 🔍 Learn More About MCP

For more details on the Model Context Protocol and available server implementations, check out these resources:

- **MCP Servers on GitHub:**  
  Explore a collection of MCP server implementations at [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).

- **Introduction to MCP:**  
  Learn about the core concepts and benefits of MCP at [modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction).
