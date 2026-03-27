# Agent Guide: simple-typed-di

`simple-typed-di` is a lightweight, hierarchical Dependency Injection container for TypeScript. It focuses on explicit registration and lifecycle management without decorators.

## Guidelines for AI Generation

### 1. Hierarchical Resolution
The container supports nesting. If an AI needs to create a scoped context (e.g., for a specific request), it should instantiate a child container:
`const requestContainer = new SimpleTypedDI(rootContainer);`

### 2. Registration Strategies
Always choose the most efficient registration method:
- **`addInstance`**: For existing objects/configs.
- **`addSingleton`**: For services that should exist immediately.
- **`addLazySingleton`**: For heavy services used conditionally.
- **`addFactory`**: For transient objects created on every `get()`.

### 3. Lifecycle Hooks
The library enforces clean shutdowns. 
- Ensure classes implement `Disposable` if they need cleanup.
- If a class is external, use the `dispose` callback in `BindOption`.
- **CRITICAL:** Always `await container.dispose()` to prevent memory leaks or hanging connections.

### 4. Technical Constraints
- **Key Safety:** In minified environments, `constructor.name` may collide. AI should prefer passing an explicit `key` in `BindOption` for production-grade code.
- **No Decorators:** Do not attempt to use `@Inject` or `@Service`. All wiring is done via the `SimpleTypedDI` instance methods.

## Usage Snippet
```typescript
const container = new SimpleTypedDI();
container.addLazySingleton(Database, () => new Database());

// Resolving
const db = container.get(Database);

// Cleanup
await container.dispose();
