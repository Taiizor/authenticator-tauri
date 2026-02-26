# Contributing to Authenticator

Thank you for your interest in contributing to Authenticator! This guide will help you get started.

## Table of Contents

- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Commit Message Format](#commit-message-format)

## Reporting Bugs

If you find a bug, please open an issue on [GitHub Issues](https://github.com/Taiizor/authenticator-tauri/issues) with the following information:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Your operating system and version
- Application version
- Screenshots or logs, if applicable

Please search existing issues before creating a new one to avoid duplicates.

## Suggesting Features

Feature requests are welcome! Please open an issue on [GitHub Issues](https://github.com/Taiizor/authenticator-tauri/issues) and include:

- A clear and descriptive title
- A detailed description of the proposed feature
- The problem it solves or the use case it addresses
- Any mockups, diagrams, or examples that help illustrate the idea

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri CLI prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform

### Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Taiizor/authenticator-tauri.git
   cd authenticator-tauri
   ```

2. **Install frontend dependencies:**

   ```bash
   bun install
   ```

3. **Run in development mode:**

   ```bash
   bun run tauri dev
   ```

4. **Build for production:**

   ```bash
   bun run tauri build
   ```

### Project Structure

- `src/` - React/TypeScript frontend source code
- `src-tauri/` - Rust backend source code
- `public/` - Static assets

## Pull Request Process

1. **Fork the repository** and create a new branch from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** and ensure they follow the [code style](#code-style) guidelines.

3. **Test your changes** thoroughly on your platform.

4. **Commit your changes** using the [commit message format](#commit-message-format).

5. **Push your branch** and open a pull request against `main`.

6. **Describe your changes** in the PR description, including:
   - What the change does
   - Why it is needed
   - How it was tested

7. **Address review feedback** promptly. A maintainer will review your PR and may request changes.

8. Once approved, a maintainer will merge your pull request.

## Code Style

### Rust

- Format code with [rustfmt](https://github.com/rust-lang/rustfmt):

  ```bash
  cargo fmt
  ```

- Lint with [Clippy](https://github.com/rust-lang/rust-clippy):

  ```bash
  cargo clippy
  ```

### TypeScript

- Format code with [Prettier](https://prettier.io/):

  ```bash
  npx prettier --write .
  ```

- Lint with [ESLint](https://eslint.org/):

  ```bash
  npx eslint .
  ```

### General Guidelines

- Keep functions small and focused
- Write meaningful variable and function names
- Add comments for complex logic
- Remove unused code and imports

## Commit Message Format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation changes only                       |
| `style`    | Code style changes (formatting, no logic change) |
| `refactor` | Code changes that neither fix a bug nor add a feature |
| `perf`     | Performance improvements                         |
| `test`     | Adding or updating tests                         |
| `chore`    | Build process, tooling, or dependency updates    |

### Examples

```
feat(vault): add biometric unlock support
fix(totp): correct time drift calculation
docs: update contributing guidelines
chore(deps): bump tauri to v2.2
```

---

Thank you for contributing!
