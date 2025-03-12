# Contributing to Brain Framework

Thank you for your interest in contributing to the Brain Framework! This guide will help you set up your development environment and understand how to contribute effectively to this project.

## Project Overview

Brain Framework is a modular AI agent framework that allows for the creation of customizable AI agents with various capabilities through plugins. The framework is built with TypeScript and uses pnpm as its package manager.

## Repository Structure

The repository is organized as follows:

- **apps/**: Frontend applications
  - **console/**: Main UI for interacting with agents
  - **docs/**: Documentation site
  - **playground/**: Development sandbox

- **packages/**: Core libraries and plugins
  - **agent/**: Core agent functionality
  - **plugin-*/**: Various plugins that extend agent capabilities
  - **tsconfig/**: Shared TypeScript configurations

## Development Setup

### Prerequisites

- Node.js v23.6 or higher
- pnpm v9.0.0 or higher

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/IQAIcom/brain.git
cd brain
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

4. Start the development server:

```bash
pnpm dev
```

## Development Workflow

We use Turborepo to manage our monorepo. The main scripts you'll use are:

- `pnpm build`: Build all packages
- `pnpm dev`: Start development servers
- `pnpm clean`: Clean build artifacts
- `pnpm format`: Format code with Biome
- `pnpm lint`: Run linting checks

## Creating a New Plugin

Plugins are a core part of the Brain Framework. To create a new plugin, follow these steps:

1. Create a new directory in the `packages/` folder following the naming convention `plugin-your-feature`
2. Set up the basic structure as outlined in the [Plugin Structure](#plugin-structure) section
3. Implement your plugin functionality following the [Plugin Development Guidelines](#plugin-development-guidelines)

### Plugin Structure

Plugins should follow this structure:

```
packages/
  plugin-your-feature/
    src/
      __tests__/      # Test files
      actions/        # Action definitions
      services/       # Services for business logic
      lib/            # Utility functions
    index.ts          # Main plugin export
    types.ts          # Type definitions
    README.md         # Plugin documentation
    package.json      # Package configuration
    tsconfig.json     # TypeScript configuration
    tsup.config.ts    # Build configuration
```

### Plugin Development Guidelines

1. **Package Naming**: Use `@iqai/plugin-your-feature` as the package name
2. **Dependencies**: Include `@elizaos/core` as a dependency
3. **Build Configuration**: Use `tsup` for building the package
4. **Testing**: Write comprehensive tests for your actions and services
5. **Documentation**: Create a detailed README.md explaining your plugin's functionality

### Example Plugin Package.json

```json
{
  "name": "@iqai/plugin-your-feature",
  "version": "0.1.0",
  "main": "dist/index.js",
  "type": "module",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@elizaos/core": "0.1.9",
    "tsup": "8.3.6"
  },
  "scripts": {
    "build": "tsup --format esm",
    "dev": "tsup --format esm --watch"
  },
  "devDependencies": {
    "@iqai/tsconfig": "workspace:*"
  }
}
```

### Example Plugin Entry (index.ts)

```typescript
import type { Plugin } from "@elizaos/core";

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

## Code Style and Standards

We use Biome for formatting and linting. Our coding standards include:

1. **TypeScript**: Use TypeScript for all code files
2. **Formatting**: Use Biome for consistent formatting
3. **Naming Conventions**: 
   - Use kebab-case for filenames and package names
   - Use camelCase for variables and functions
   - Use PascalCase for classes and interfaces
4. **Comments**: Write clear comments for complex logic
5. **Testing**: Write tests for all functionality

## Testing

Run tests for plugins using:

```bash
pnpm test:plugins
```

This will execute the test script in `test-plugins.sh`.

## Submitting Changes

1. **Create a Branch**: Create a branch for your feature or bug fix
2. **Make Changes**: Implement your changes following our coding standards
3. **Write Tests**: Add tests that cover your changes
4. **Run Checks**: Ensure your code passes formatting and linting checks
5. **Commit Changes**: Use clear, descriptive commit messages
6. **Submit a Pull Request**: Open a PR against the main branch

## Versioning and Releases

We use [Changesets](https://github.com/changesets/changesets) for versioning:

1. **Adding a Changeset**: Run `pnpm changeset` to document your changes
2. **Versioning**: Run `pnpm version-packages` to update package versions
3. **Publishing**: Run `pnpm publish-packages` to publish packages

You don't need to worry about versioning and releases. Github Actions will handle it for you once the version packages pr gets merged

## Getting Help

If you have questions or need assistance, please open an issue in the repository.

Thank you for contributing to the Brain Framework!
