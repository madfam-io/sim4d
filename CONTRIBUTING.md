# Contributing to Sim4D

Thank you for your interest in contributing to Sim4D! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+
- Emscripten SDK (for WASM compilation)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/madfam/sim4d.git
cd sim4d

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building WASM (if needed)

```bash
# Build OCCT WASM package
pnpm --filter @sim4d/occt-wasm build
```

## Branch Strategy

We use a trunk-based development model:

- `main` - Production-ready code
- `feat/` - New features (e.g., `feat/revolve-node`)
- `fix/` - Bug fixes (e.g., `fix/double-node-placement`)
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scopes:** `studio`, `engine`, `viewport`, `nodes`, `types`, `wasm`

## Pull Request Process

1. Create a branch from `main`
2. Make changes with clear, atomic commits
3. Write/update tests for new functionality
4. Update documentation if needed
5. Open a PR with clear description
6. Request review from a maintainer
7. Address feedback and get approval

### PR Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] No console.log in production code
- [ ] CHANGELOG.md updated for significant changes

## Code Standards

### TypeScript

- Strict mode enabled
- Explicit return types
- Use Zod for validation
- Prefer composition over inheritance

### React Components

- Functional components with hooks
- Memoization for expensive operations
- Error boundaries for critical sections
- Accessibility attributes (ARIA)

### Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter @sim4d/studio test
```

**Coverage requirements:**

- New code: 80% minimum
- Overall: 99%+ target (currently 99.6%)

## Node Development

When creating new nodes:

### 1. Define the Node Type

```typescript
// packages/types/src/nodes/my-node.ts
export interface MyNodeParams {
  param1: number;
  param2: string;
}

export interface MyNodeInputs {
  shape: ShapeHandle;
}

export interface MyNodeOutputs {
  result: ShapeHandle;
}
```

### 2. Implement the Node

```typescript
// apps/studio/src/nodes/my-node.ts
export const myNodeDefinition: NodeDefinition = {
  type: 'Category::MyNode',
  label: 'My Node',
  category: 'Category',
  inputs: [...],
  outputs: [...],
  params: [...],
  execute: async (inputs, params, context) => {
    // Implementation
  },
};
```

### 3. Register the Node

Add to the node registry in `apps/studio/src/nodes/index.ts`

### 4. Add Tests

```typescript
describe('MyNode', () => {
  it('should process input correctly', async () => {
    // Test implementation
  });
});
```

### 5. Add to Template

Consider adding a template demonstrating the new node.

## WASM Development

When working with OCCT WASM:

- Test in both Chromium and Firefox
- Verify SharedArrayBuffer requirements
- Check memory usage for large operations
- Add golden tests for geometry operations

## Security Guidelines

- Never commit secrets
- Validate all user inputs
- Sanitize file uploads
- Follow CSP guidelines
- Report vulnerabilities to security@madfam.io

## Getting Help

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Discord**: Join our developer channel

## License

By contributing, you agree that your contributions will be licensed under the project's proprietary license.
