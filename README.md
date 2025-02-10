<img src="./brain-framework-cover.png" />

## 🌟 Overview

Brain Framework provides a comprehensive suite of tools and packages for developers to create, customize, and deploy AI agents. Built on the robust Eliza framework, it simplifies the complex process of AI agent development.

## 📚 Documentation

For detailed information on using the Brain Framework, visit our [documentation](https://brain.iqai.com).

## 📦 Packages

| Package | Description |
|---------|------------|
| [@iqai/agent](./packages/agent) | 🤖 Core agent setup and configuration package |
| [@iqai/plugin-heartbeat](./packages/plugin-heartbeat) | ⏰ Enables cronjobs for agents |
| [@iqai/plugin-atp](./packages/plugin-atp) | 🔌 ATP integration plugin |
| [@iqai/plugin-fraxlend](./packages/plugin-fraxlend) | 💰 Fraxlend integration plugin |
| [@iqai/plugin-odos](./packages/plugin-odos) | 🔄 Odos integration plugin |
| [@iqai/plugin-agentkit](./packages/plugin-agentkit) | 🛠️ AgentKit integration plugin |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/IQAIcom/iq-ai-framework

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## 💻 Development

This monorepo uses:

- 🏗️ PNPM Workspaces for package management
- 🔧 Turborepo for build system
- 📦 Changesets for versioning and publishing
- 🔍 TypeScript for type safety
- 🌐 Documentation site at [brain.iqai.com](https://brain.iqai.com)

### ⚡ Common Commands

```bash
# Development mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Create a new version
pnpm changeset

# Publish packages
pnpm publish-packages
```
