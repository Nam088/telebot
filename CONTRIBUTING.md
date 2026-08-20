# Contributing to tele-bot

Thank you for your interest in contributing to `tele-bot`! This document outlines the guidelines, architecture rules, and automated release workflow for the project.

---

## 1. Guiding Principles & Architecture Constraints

1. **Zero Runtime Dependencies**:
   - Only Node.js built-ins (`fetch`, `http`, `https`, `fs`, `path`, `crypto`, `util`, `events`, `sqlite`) are permitted in `"dependencies"`.
   - `pino` is the only allowed optional peer dependency.
2. **Strict Naming Conventions**:
   - **Methods you call**: `camelCase` (e.g. `sendMessage`, `addHandler`, `runRRule`, `deleteUserData`).
   - **Data properties / Telegram API fields**: `snake_case` (e.g. `user_data`, `chat_data`, `chat_id`, `message_id`).
   - **Combinators**: `.and()`, `.or()`, `.not()`.
3. **TypeScript & Documentation**:
   - Strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`).
   - All public symbols must have comprehensive TypeDoc comments with `@param`, `@returns`, `@example`, and `@throws`.
4. **Brand Protection**:
   - Never mention Python or migration from Python in public comments, documentation, or types.

---

## 2. Development & TDD Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Follow Test-Driven Development (TDD):
   - Add unit tests under `tests/unit/` mirroring the source structure.
   - Run vitest in watch mode:
     ```bash
     npm run test:watch
     ```
4. Verify Quality Gates:
   ```bash
   npm run format:check
   npm run lint
   npm run build
   npm test
   npm run docs
   npm run test:coverage # Must be >90%
   ```

---

## 3. Conventional Commits & Automated Release Process

This repository uses **Conventional Commits** and **Release Please / Semantic Release** to automatically generate `CHANGELOG.md`, create GitHub Releases, and bump version numbers based on commit messages.

### Commit Format
```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Supported Types
| Type | Description | Semantic Version Bump |
|---|---|---|
| `feat` | A new feature or API capability | **MINOR** (e.g. `1.0.0` -> `1.1.0`) |
| `fix` | A bug fix | **PATCH** (e.g. `1.0.0` -> `1.0.1`) |
| `perf` | Performance improvement | **PATCH** |
| `docs` | Documentation changes | No bump |
| `style` | Formatting, whitespace changes | No bump |
| `refactor` | Code restructuring without changing behavior | No bump |
| `test` | Adding or updating tests | No bump |
| `chore` | Build process, tooling, or dependency updates | No bump |

### Breaking Changes
Adding `BREAKING CHANGE:` in the commit footer or appending `!` after the type (e.g. `feat!: change return type`) triggers a **MAJOR** version bump (e.g. `1.0.0` -> `2.0.0`).

### Interactive Commit Helper
You can use the built-in Commitizen CLI to craft standardized commit messages:
```bash
npm run commit
```

---

## 4. Submitting Pull Requests

1. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Ensure all quality checks pass before pushing.
3. Open a Pull Request using the provided PR template.
