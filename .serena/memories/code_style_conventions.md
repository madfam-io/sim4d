# BrepFlow Code Style & Conventions

## TypeScript Configuration

- **Target**: ES2022 with DOM, WebWorker libs
- **Module**: ESNext with bundler resolution
- **Strict**: false (gradual adoption)
- **JSX**: react-jsx transform
- **Decorators**: Experimental decorators enabled
- **Path mapping**: @brepflow/_ aliases to packages/_/src

## ESLint Rules

- Base: ESLint recommended + TypeScript recommended
- **React**: No react-in-jsx-scope, prop-types disabled
- **TypeScript**:
  - No explicit module boundary types required
  - Unused vars error (except \_prefixed)
  - no-explicit-any as warning
- **Console**: Only warn/error allowed, no console.log

## Prettier Configuration

- **Single quotes**: true
- **Semicolons**: required
- **Tab width**: 2 spaces
- **Print width**: 100 characters
- **Trailing commas**: ES5 style
- **Bracket spacing**: true
- **Arrow parens**: always
- **Line endings**: LF

## Naming Conventions

- **Files**: kebab-case for components, camelCase for utilities
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Package names**: @brepflow/package-name format

## Project Structure Patterns

- Monorepo with apps/ and packages/ separation
- src/ directory for source code in each package
- index.ts barrel exports for public APIs
- test/ or **tests**/ for test files
- dist/ for build outputs (gitignored)
