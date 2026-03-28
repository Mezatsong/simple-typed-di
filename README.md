[![CI Status](https://github.com/Mezatsong/simple-typed-di/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Mezatsong/simple-typed-di/actions)
[![npm version](https://img.shields.io/npm/v/simple-typed-di.svg)](https://www.npmjs.com/package/simple-typed-di)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

# simple-typed-di

A lightweight, hierarchical Dependency Injection (DI) container for TypeScript. No decorators, no "magic"—just clean, type-safe resource management.

## Features

- 🪶 **Ultra-lightweight**: Zero dependencies.
- 🌳 **Hierarchical Scoping**: Inherit and override dependencies in child containers.
- 🛡️ **Type-safe**: Built for TypeScript first.
- ♻️ **Lifecycle Management**: Automatic disposal of resources (async supported).
- 🚀 **Flexible**: Supports instances, eager singletons, lazy singletons, and factories.

## Installation

```bash
npm install simple-typed-di
```

## Quick Start

### Basic Usage

```typescript
import { SimpleTypedDI } from 'simple-typed-di';

class Database {
    connect() {
        console.log('Connected!');
    }
}

const container = new SimpleTypedDI();

// Register a lazy singleton
container.addLazySingleton(Database, () => new Database());

// Retrieve the instance
const db = container.get(Database);
db.connect();
```

### Hierarchical Scoping

Perfect for request-based containers in web servers.

```typescript
const root = new SimpleTypedDI();
root.addInstance(Config, globalConfig);

const requestScope = new SimpleTypedDI(root); // Inherits from root
requestScope.addFactory(UserHandler, () => new UserHandler());

const config = requestScope.get(Config); // Found in root
```

### Automatic Disposal

Implement the `Disposable` interface or provide a custom cleanup callback.

```typescript
class MyService implements Disposable {
    async dispose() {
        await closeConnections();
    }
}

container.addLazySingleton(MyService, () => new MyService());

// Later...
await container.dispose(); // MyService.dispose() is called automatically
```

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, a new feature, or improved documentation, feel free to open a Pull Request.

### Development Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Mezatsong/simple-typed-di.git
    cd simple-typed-di
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

### Quality Control

Before submitting a PR, please ensure your changes pass all checks:

- **Run Tests:**

    ```bash
    npm test
    ```

    _To keep tests running while you code, use:_ `npx vitest`

- **Check Linting:**

    ```bash
    npm run lint
    ```

- **Verify Build:**
    ```bash
    npm run build
    ```

### Workflow

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
