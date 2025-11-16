# Contributing to BrepFlow

Thank you for your interest in contributing to BrepFlow! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Architecture Guidelines](#architecture-guidelines)

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Respecting differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**

- Harassment of any kind
- Discriminatory language or actions
- Personal attacks or trolling
- Public or private harassment
- Publishing others' private information without permission

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20.11.x
- pnpm 8.6.x
- Git configured with your GitHub account
- Familiarity with TypeScript, React, and CAD concepts

### Setup Development Environment

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/brepflow.git
cd brepflow

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### First-Time Contributors

Good first issues are labeled with `good-first-issue`. These typically include:

- Documentation improvements
- Small bug fixes
- UI/UX enhancements
- Test additions
- Code cleanup

## Development Workflow

### Branch Strategy

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Create bugfix branch from main
git checkout -b bugfix/issue-description

# Create documentation branch
git checkout -b docs/update-readme
```

### Branch Naming Conventions

- **Features**: `feature/node-boolean-operations`
- **Bug fixes**: `bugfix/geometry-tessellation-crash`
- **Documentation**: `docs/api-reference-update`
- **Performance**: `perf/dag-evaluation-optimization`
- **Refactor**: `refactor/extract-geometry-utils`

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Build process or auxiliary tool changes

**Examples:**

```bash
feat(nodes): add boolean intersection node
fix(dag): resolve circular dependency detection
docs(api): update geometry API documentation
perf(worker): optimize tessellation algorithm
```

### Development Process

1. **Create Issue** (for significant changes)
2. **Create Branch** from main
3. **Implement Changes** following coding standards
4. **Write Tests** for new functionality
5. **Update Documentation** as needed
6. **Run Quality Checks**
7. **Submit Pull Request**
8. **Address Review Feedback**

## Coding Standards

### TypeScript Guidelines

#### Type Safety

```typescript
// ✅ Good - Explicit types
interface NodeParams {
  width: number;
  height: number;
  depth: number;
}

// ❌ Avoid - any types
function processNode(params: any): any {}

// ✅ Good - Generic constraints
function createNode<T extends NodeInstance>(definition: NodeDefinition<T>): T;
```

#### Naming Conventions

```typescript
// ✅ Good - Descriptive names
const geometryWorkerClient = new WorkerClient();
function calculateBoundingBox(shape: ShapeHandle): BoundingBox {}

// ❌ Avoid - Abbreviated names
const gwc = new WorkerClient();
function calcBB(s: ShapeHandle): BoundingBox {}
```

#### Error Handling

```typescript
// ✅ Good - Proper error types
try {
  const result = await evaluateNode(node);
} catch (error) {
  if (error instanceof GeometryError) {
    handleGeometryError(error);
  } else if (error instanceof ValidationError) {
    handleValidationError(error);
  } else {
    throw error;
  }
}

// ❌ Avoid - Generic catch-all
try {
  const result = await evaluateNode(node);
} catch (error) {
  console.log('Something went wrong');
}
```

### React Guidelines

#### Component Structure

```typescript
// ✅ Good - Functional components with hooks
interface NodePanelProps {
  onNodeDrag: (nodeType: string) => void;
  categories: string[];
}

export function NodePanel({ onNodeDrag, categories }: NodePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Component logic

  return (
    <div className="node-panel">
      {/* JSX */}
    </div>
  );
}
```

#### State Management

```typescript
// ✅ Good - Zustand store patterns
interface GraphStore {
  graph: GraphInstance;
  selectedNodes: Set<NodeId>;
  addNode: (node: Omit<NodeInstance, 'id'>) => NodeInstance;
  updateNode: (id: NodeId, updates: Partial<NodeInstance>) => void;
}

// Use immer for complex state updates
const useGraphStore = create<GraphStore>()(
  immer((set) => ({
    graph: createEmptyGraph(),
    selectedNodes: new Set(),
    addNode: (node) =>
      set((state) => {
        const newNode = { ...node, id: generateId() };
        state.graph.nodes.push(newNode);
        return newNode;
      }),
  }))
);
```

### Performance Guidelines

#### Avoid Unnecessary Re-renders

```typescript
// ✅ Good - Memoized components
const NodeComponent = memo(({ node, onUpdate }: NodeComponentProps) => {
  return <div>{/* Node rendering */}</div>;
});

// ✅ Good - Optimized selectors
const selectedNode = useGraphStore(
  useCallback((state) => state.nodes.find(n => n.id === nodeId), [nodeId])
);
```

#### Efficient Data Structures

```typescript
// ✅ Good - Maps for O(1) lookups
const nodeMap = new Map<NodeId, NodeInstance>();

// ✅ Good - Sets for unique collections
const dirtyNodes = new Set<NodeId>();

// ❌ Avoid - Arrays for frequent lookups
const nodeArray = nodes.find((n) => n.id === nodeId); // O(n) lookup
```

## Testing Guidelines

### Unit Tests

Write comprehensive unit tests for:

- Node evaluation functions
- Graph operations
- Utility functions
- State management

```typescript
// Example test structure
describe('DAGEngine', () => {
  let engine: DAGEngine;
  let mockWorker: MockWorkerClient;

  beforeEach(() => {
    mockWorker = new MockWorkerClient();
    engine = new DAGEngine({ worker: mockWorker });
  });

  it('should evaluate simple node graph', async () => {
    const graph = createTestGraph();
    const dirtyNodes = new Set(['node1']);

    await engine.evaluate(graph, dirtyNodes);

    expect(graph.nodes[0].outputs).toBeDefined();
    expect(mockWorker.invoke).toHaveBeenCalledWith('createBox', expect.any(Object));
  });

  it('should handle evaluation errors gracefully', async () => {
    mockWorker.invoke.mockRejectedValue(new Error('Geometry error'));

    const graph = createTestGraph();
    await engine.evaluate(graph, new Set(['node1']));

    expect(graph.nodes[0].state?.error).toBe('Geometry error');
  });
});
```

### Integration Tests

Test complete workflows:

- Graph serialization/deserialization
- Worker communication
- UI interactions

### Test Coverage

Maintain >80% test coverage for:

- Core engine logic
- Node implementations
- Utility functions

```bash
# Run tests with coverage
pnpm test --coverage

# View coverage report
open coverage/index.html
```

## Documentation

### Code Documentation

#### JSDoc Comments

````typescript
/**
 * Evaluates a node in the graph and caches the result.
 *
 * @param node - The node instance to evaluate
 * @param context - Evaluation context with dependencies
 * @returns Promise resolving to evaluation results
 * @throws {ValidationError} When node parameters are invalid
 * @throws {GeometryError} When geometry operations fail
 *
 * @example
 * ```typescript
 * const result = await evaluateNode(boxNode, {
 *   nodeId: 'box1',
 *   graph,
 *   cache,
 *   worker
 * });
 * ```
 */
async function evaluateNode(node: NodeInstance, context: EvalContext): Promise<NodeOutputs> {
  // Implementation
}
````

#### README Updates

When adding features, update:

- Feature list in main README
- API documentation
- Usage examples
- Architecture diagrams

### Architectural Decision Records (ADRs)

Document significant architectural decisions in `docs/adr/`:

```markdown
# ADR-001: Use Zustand for State Management

## Status: Accepted

## Context

Need centralized state management for complex graph operations...

## Decision

Use Zustand for its simplicity and TypeScript support...

## Consequences

- Reduced boilerplate compared to Redux
- Better TypeScript integration
- Potential performance benefits
```

## Pull Request Process

### Before Submitting

1. **Run Quality Checks**:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Tests
pnpm test

# Build verification
pnpm build
```

2. **Update Documentation**:

- Update CHANGELOG.md
- Add/update JSDoc comments
- Update API documentation if needed

3. **Self-Review**:

- Review your own changes first
- Ensure code follows standards
- Verify tests pass
- Check for security issues

### PR Template

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and builds
2. **Code Review**: Maintainers review for:
   - Code quality and standards
   - Architecture alignment
   - Performance implications
   - Security considerations
3. **Feedback**: Address review comments
4. **Approval**: Two maintainer approvals required for merge
5. **Merge**: Squash and merge to main branch

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the issue.

**To Reproduce**
Steps to reproduce the behavior:

1. Create a box node
2. Set parameters to {...}
3. Evaluate graph
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 118]
- Node.js: [e.g. 20.5.0]
- BrepFlow version: [e.g. 0.2.0]

**Additional context**
Console errors, logs, etc.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features considered.

**Additional context**
Mockups, examples, etc.
```

### Security Issues

**Do not** create public issues for security vulnerabilities. Instead:

- Email security@brepflow.com
- Include detailed description
- Include reproduction steps
- We'll respond within 48 hours

## Architecture Guidelines

### Adding New Node Types

1. **Define Node Schema**:

```typescript
// packages/nodes-core/src/sketch/rectangle.ts
export const RectangleNode: NodeDefinition = {
  type: 'Sketch::Rectangle',
  category: 'Sketch',
  inputs: {},
  params: {
    width: { type: 'number', default: 100, min: 0.1 },
    height: { type: 'number', default: 100, min: 0.1 },
    center: { type: 'vec3', default: [0, 0, 0] },
  },
  outputs: {
    curve: { type: 'shape' },
  },
  evaluate: async (ctx, inputs, params) => {
    const shape = await ctx.worker.invoke('createRectangle', {
      width: params.width,
      height: params.height,
      center: params.center,
    });
    return { curve: shape };
  },
};
```

2. **Register Node**:

```typescript
// packages/nodes-core/src/index.ts
import { RectangleNode } from './sketch/rectangle';

NodeRegistry.register(RectangleNode);
```

3. **Add to UI**:

```typescript
// apps/studio/src/components/NodePanel.tsx
const nodeCategories = {
  Sketch: [
    'Sketch::Line',
    'Sketch::Circle',
    'Sketch::Rectangle', // Add here
  ],
};
```

4. **Write Tests**:

```typescript
// packages/nodes-core/src/__tests__/sketch/rectangle.test.ts
describe('RectangleNode', () => {
  it('should create rectangle with specified dimensions', async () => {
    // Test implementation
  });
});
```

### Adding Worker Operations

1. **Define Message Types**:

```typescript
// packages/engine-occt/src/worker-types.ts
export interface CreateRectangleRequest extends BaseRequest {
  type: 'CREATE_RECTANGLE';
  params: {
    width: number;
    height: number;
    center: Vec3;
  };
}
```

2. **Implement Worker Handler**:

```typescript
// packages/engine-occt/src/worker.ts
async function handleCreateRectangle(params: CreateRectangleParams): Promise<ShapeHandle> {
  // Implementation using OCCT or mock
}
```

3. **Add Mock Implementation**:

```typescript
// packages/engine-occt/src/mock-geometry.ts
createRectangle(width: number, height: number, center: Vec3): ShapeHandle {
  return {
    id: generateId(),
    type: 'rectangle',
    bounds: calculateBounds(width, height, center),
  };
}
```

### Performance Considerations

#### Memory Management

- Dispose geometry handles when no longer needed
- Implement proper cleanup in worker operations
- Monitor memory usage in large graphs

#### Computation Optimization

- Cache expensive computations
- Use incremental evaluation
- Implement proper dirty flagging
- Consider parallel evaluation where possible

#### UI Responsiveness

- Use React.memo for expensive components
- Implement virtualization for large node lists
- Debounce parameter updates
- Use Web Workers for heavy computations

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update CHANGELOG.md
2. Update version in package.json
3. Run full test suite
4. Update documentation
5. Create release branch
6. Tag release
7. Deploy to production
8. Announce release

## Getting Help

### Community Resources

- **GitHub Discussions**: For questions and feature discussions
- **Discord**: Real-time chat with community
- **Documentation**: Comprehensive guides and API reference
- **Stack Overflow**: Tag questions with `brepflow`

### Maintainer Contact

- **General Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Security Issues**: security@brepflow.com
- **Partnership/Business**: business@brepflow.com

Thank you for contributing to BrepFlow! Your efforts help make parametric CAD more accessible to everyone.
