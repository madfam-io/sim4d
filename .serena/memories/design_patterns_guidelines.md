# BrepFlow Design Patterns & Guidelines

## Core Architecture Patterns

### DAG Evaluation Pattern

- **Dirty Propagation**: Changes mark downstream nodes for re-evaluation
- **Content-Addressed Caching**: Outputs cached by `(nodeId, inputHashes, paramHash)`
- **Deterministic Execution**: Evaluation order derived from DAG topology
- **Memoization**: Expensive operations cached with stable hashing

### Worker Isolation Pattern

- **Geometry Operations**: Isolated in WASM workers with pthreads
- **Message Passing**: Transferable objects for mesh data
- **Capability Sandboxing**: Plugins run with limited capabilities
- **Thread Safety**: SharedArrayBuffer enabled with COOP/COEP headers

### Node System Pattern

```typescript
registerNode({
  type: 'Example::Extrude',
  params: { distance: NumberParam({ min: 0 }) },
  inputs: { profile: 'Shape' },
  outputs: { shape: 'Shape' },
  evaluate: async (ctx, I, P) =>
    ctx.geom.invoke('MAKE_EXTRUDE', { face: I.profile, distance: P.distance }),
});
```

## Key Design Principles

### Performance Guidelines

- **Lazy Evaluation**: Only compute what's needed
- **LRU Caching**: Meshes and geometry with memory pressure handling
- **Progressive Loading**: Large datasets loaded incrementally
- **Worker Restart**: Memory pressure triggers worker cleanup

### Security Patterns

- **Worker Sandboxing**: Geometry ops cannot access host resources
- **Capability Grants**: Explicit permissions for plugin features
- **Signed Packages**: ed25519 signatures for plugin registry
- **CSP Strict Mode**: No inline eval, restricted content sources

### Graph Persistence

- **Versioned Format**: .bflow.json with semantic versioning
- **UUID Stability**: UUIDv7 for deterministic ordering
- **Units & Tolerance**: Embedded in graph metadata
- **Content Addressing**: Deterministic hashes for builds

### Error Handling

- **Graceful Degradation**: Mock geometry when WASM unavailable
- **Error Boundaries**: React error boundaries for UI resilience
- **Worker Recovery**: Automatic restart on worker crashes
- **Validation Gates**: Schema validation at graph boundaries

## Anti-Patterns to Avoid

- **Synchronous Geometry**: All CAD ops must be async
- **Global State**: Use React context or worker state
- **Imperative Graph Mutation**: Use declarative node updates
- **Memory Leaks**: Always clean up worker resources
- **Non-Deterministic Ops**: All geometry must be reproducible
