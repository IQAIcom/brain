<div align="center">
  <img src="./brain-framework-cover.png" />
</div>

## Overview

IQ AI Framework provides a comprehensive suite of tools and packages for developers to create, customize, and deploy AI agents. Built on the robust Eliza framework, it simplifies the complex process of AI agent development.

## Packages

| Package | Description |
|---------|------------|
| [@iqai/agent](./packages/agent) | Core agent setup and configuration package |
| [@iqai/plugin-agentkit](./packages/plugin-agentkit) | CDP Agent Kit integration plugin |
| [@iqai/adapter-sqlite](./packages/adapter-sqlite) | SQLite database adapter for agent storage |
| [@iqai/tsconfig](./packages/tsconfig) | Shared TypeScript configurations |

## Quick Start

``` bash
# Clone the repository
git clone https://github.com/IQAIcom/iq-ai-framework

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Development

This monorepo uses:
- 🏗️ PNPM Workspaces for package management
- 🔧 Turborepo for build system
- 📦 Changesets for versioning and publishing
- 🔍 TypeScript for type safety

### Common Commands

``` bash
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