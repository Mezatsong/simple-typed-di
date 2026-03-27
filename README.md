![CI Status](https://github.com/YOUR_USERNAME/simple-typed-di/actions/workflows/ci.yml/badge.svg)

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
import { SimpleTypedDI } from "simple-typed-di";

class Database {
  connect() {
    console.log("Connected!");
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
