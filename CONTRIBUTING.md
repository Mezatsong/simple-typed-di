# Contributing to simple-typed-di

First off, thank you for considering contributing! It’s people like you who make the open-source community such a great place to learn and build.

## 🏗️ Technical Standards

To keep this library lightweight and maintainable, we follow these core principles:

1. **SOLID Principles:** Every change should respect the Single Responsibility and Interface Segregation principles.
2. **No External Dependencies:** This is a "Zero-Dependency" library. Do not add anything to `dependencies` in `package.json`.
3. **Explicit > Magic:** We avoid decorators and "magic" behavior. Registration should be explicit and easy to trace.
4. **Clean Code:** Use meaningful variable names. If a function needs a comment to explain _what_ it does, it's likely too complex.

## 🛠️ Development Workflow

1. **Setup:**
    - Node.js 20+ and NPM 10+ are required.
    - Run `npm install` to set up the environment.

2. **Testing:**
    - We use **Vitest**. No PR will be merged without 100% test coverage for new logic.
    - Run tests: `npm test`
    - Run coverage: `npm run test:coverage`

3. **Style:**
    - We follow the `.editorconfig` and ESLint rules.
    - Run `npm run lint` before committing.

## 🌿 Branching Strategy

- **Feature branches:** `feat/description-of-feature`
- **Bug fixes:** `fix/description-of-bug`
- **Docs:** `docs/description-of-update`

## 📝 Pull Request Process

1. Create a branch from `main`.
2. Ensure your code follows the coding standards.
3. Update the `README.md` if you changed the API.
4. Ensure the CI pipeline passes (Lint + Build + Test).
5. Once approved, the maintainer will merge your PR using a "Squash and Merge" to keep the history clean.
