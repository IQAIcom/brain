# 🎛 Plugin MCP

A **plugin** for interacting with **Model Context Protocol (MCP) servers** to mediate communication between the Brain Framework and external MCP servers.

---

## 📌 Overview

The **Plugin MCP** acts as a mediator between Brain framework and an MCP server. It connects to an MCP server—either locally via stdio or remotely via SSE—retrieves available tools and converts them into actions that the Brain Framework can execute. The actions are generated dynamically based on the MCP server's capabilities.

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

Configure the plugin with the following parameters:

| 🔧 Param Name     | 📜 Description                                                | Required | Default |
|-------------------|--------------------------------------------------------------|----------|---------|
| `name`            | Name of the MCP plugin                                       | Yes      | -       |
| `description`     | Description of the plugin                                    | Yes      | -       |
| `transport`       | Transport configuration object (see below)                   | Yes      | -       |
| `handleResponse`  | Custom handler for processing tool call results              | No       | -       |
| `disableToolChaining` | Disable automatic tool chaining                         | No       | false   |
| `toolChainingTemplate` | Custom template for tool chaining                      | No       | -       |

### Transport Configuration

#### Stdio Mode

Use **stdio** mode when you want to run a local MCP server as a separate process.

| 🔧 Param Name      | 📜 Description                                           |
|--------------------|-----------------------------------------------------------|
| `mode`             | Must be set to `"stdio"`                                  |
| `command`          | Command to run the local MCP server process               |
| `args`             | Arguments for the local MCP server process (string list)  |

#### SSE Mode

Use **sse** mode to connect to a remote MCP server via Server-Sent Events. *(Note: Authentication is not supported for SSE mode at this time.)*

| 🔧 Param Name      | 📜 Description                                           |
|--------------------|-----------------------------------------------------------|
| `mode`             | Must be set to `"sse"`                                    |
| `serverUrl`        | The base URL of the remote MCP server                     |
| `headers`          | Headers to include (if any) in the request to the remote server |

---

## 🚀 Usage

Import and initialize the plugin using the `createMcpPlugin` method.

### For a Local MCP Server (Stdio Mode)

```typescript
import { createMcpPlugin } from "@iqai/plugin-mcp";

// Initialize the plugin with stdio configuration
const pluginFs = await createMcpPlugin({
  name: "file-system",
  description: "File system MCP server",
  transport: {
    mode: "stdio",
    command: "npx",
    args: [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/home/user/",
      "/home/user/Desktop",
    ],
  }
});
```

### For a Remote MCP Server (SSE Mode)

```typescript
import { createMcpPlugin } from "@iqai/plugin-mcp";

// Initialize the plugin with sse configuration
const plugin = await createMcpPlugin({
  name: "remote-mcp-tools",
  description: "Remote MCP server tools",
  transport: {
    mode: "sse",
    serverUrl: "YOUR_SERVER_URL",
    headers: {}
  }
});
```

Once initialized, the plugin dynamically generates actions based on the MCP server's available tools, prompts, and resources.

---

## 🔄 Automatic Tool Chaining

The plugin features automatic tool chaining, which enables more powerful interactions between tools:

- When a tool returns a file path, the system can automatically use filesystem tools if available to read the content
- Structured data outputs from one tool can serve as inputs to another tool
- Complex workflows can be automated without requiring explicit tool invocation for each step

For example, if a tool generates a code file and returns its path, the system will automatically detect this and can:

1. Read the file content using filesystem tools if available by a plugin or via filesystem mcp server.
2. Present the code with proper formatting
3. Suggest further actions based on the file type

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

For tool chaining:

- Be aware that tools will have access to the outputs of other tools
- Consider potential security implications when chaining tools that access sensitive data

---

## 🔍 Learn More About MCP

For more details on the Model Context Protocol and available server implementations, check out these resources:

- **MCP Servers on GitHub:**  
  Explore a collection of MCP server implementations at [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).

- **Introduction to MCP:**  
  Learn about the core concepts and benefits of MCP at [modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction).
