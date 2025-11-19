# Horizon A: GitHub Issues Template

This document contains templates for creating GitHub issues for all major milestones in Horizon A: Geometry Hardening.

**How to use**:
1. Create a milestone in GitHub: "Horizon A: Geometry Hardening" (Due: March 31, 2026)
2. Create each issue below using the provided templates
3. Assign to milestone and add appropriate labels

---

## Workstream 1: OCCT Performance & Recovery

### Issue 1: OCCT Performance Profiling & Baseline

**Title**: `[Horizon A] OCCT Performance Profiling & Baseline`

**Labels**: `horizon-a`, `performance`, `occt`, `week-1-2`

**Body**:
```markdown
## Overview
Establish performance baselines for all OCCT operations to guide optimization work in Horizon A.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 1: OCCT Performance & Recovery
- Timeline: Week 1-2 (Month 1)
- Dependencies: None (can start immediately)

## Objectives
- Profile primitive operations (box, sphere, cylinder, cone, torus)
- Profile boolean operations (union, intersection, difference, cut)
- Profile feature operations (fillet, chamfer, shell, draft)
- Profile tessellation across quality settings
- Profile STEP/IGES/STL export performance
- Identify P95/P99 bottlenecks in reference assemblies
- Document performance baselines

## Tasks
- [ ] Set up performance profiling infrastructure
- [ ] Create reference models (simple, medium, complex assemblies)
- [ ] Profile primitive operations with timing instrumentation
- [ ] Profile boolean operations across reference models
- [ ] Profile feature operations (fillets, chamfers, etc.)
- [ ] Profile tessellation with various quality settings
- [ ] Profile export operations (STEP, IGES, STL)
- [ ] Analyze P95/P99 performance bottlenecks
- [ ] Document baseline metrics in technical docs

## Deliverables
- [ ] Performance profiling report with operation timings
- [ ] Bottleneck analysis for reference models
- [ ] Baseline metrics document: `docs/technical/OCCT_PERFORMANCE_BASELINE.md`

## Success Criteria
- All major OCCT operations profiled
- Reference models established (simple, medium, complex)
- Baseline metrics documented
- Bottlenecks identified for optimization

## Files
- `packages/engine-occt/src/performance-profiler.ts` (new)
- `packages/engine-occt/tests/performance/*.test.ts` (new)
- `docs/technical/OCCT_PERFORMANCE_BASELINE.md` (new)

## Reference Assemblies
1. **Simple** (5-10 parts): < 500ms target
2. **Medium** (20-50 parts): < 1.0s target
3. **Complex** (100+ parts): < 1.5s target (P95)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.1, Milestone 1)
```

---

### Issue 2: Operation-Level Diagnostics & Monitoring

**Title**: `[Horizon A] Operation-Level Diagnostics & Monitoring`

**Labels**: `horizon-a`, `monitoring`, `occt`, `week-3-4`

**Body**:
```markdown
## Overview
Implement comprehensive diagnostics and monitoring for all OCCT geometry operations.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 1: OCCT Performance & Recovery
- Timeline: Week 3-4 (Month 1)
- Dependencies: #[Performance Profiling issue number]

## Objectives
- Add timing instrumentation to all OCCT operations
- Implement structured logging for geometry operations
- Create performance dashboard for monitoring
- Integrate with PerformanceReporter from engine-core
- Add threshold-based alerts for slow operations

## Tasks
- [ ] Design operation diagnostics data structure
- [ ] Add timing instrumentation to primitive operations
- [ ] Add timing instrumentation to boolean operations
- [ ] Add timing instrumentation to feature operations
- [ ] Implement structured logging with operation metadata
- [ ] Create performance dashboard component
- [ ] Integrate with existing PerformanceReporter
- [ ] Configure threshold alerts (warning, error, critical)
- [ ] Add operation metadata (input shapes, parameters, results)
- [ ] Write tests for diagnostics system

## Deliverables
- [ ] Comprehensive operation diagnostics system
- [ ] Performance monitoring dashboard
- [ ] Alert system for performance degradation
- [ ] Integration with PerformanceReporter

## Success Criteria
- All OCCT operations instrumented with timing
- Performance dashboard displays real-time metrics
- Threshold alerts trigger appropriately
- Operation metadata captured for debugging

## Files
- `packages/engine-occt/src/diagnostics/operation-profiler.ts` (new)
- `packages/engine-occt/src/diagnostics/performance-dashboard.ts` (new)
- `packages/engine-core/src/performance-reporter.ts` (enhance)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.1, Milestone 2)
```

---

### Issue 3: Graceful Error Recovery for OCCT Operations

**Title**: `[Horizon A] Graceful Error Recovery for OCCT Operations`

**Labels**: `horizon-a`, `error-handling`, `occt`, `week-5-6`

**Body**:
```markdown
## Overview
Implement robust error handling and recovery strategies for all OCCT geometry operations.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 1: OCCT Performance & Recovery
- Timeline: Week 5-6 (Month 2)
- Dependencies: #[Operation Diagnostics issue number]

## Objectives
- Audit all OCCT operation error paths
- Implement structured error types for geometry failures
- Add retry logic for transient failures
- Implement fallback strategies for failed operations
- Provide user-friendly error messages
- Document error handling patterns

## Tasks
- [ ] Audit error handling in all OCCT bindings
- [ ] Define structured error types (GeometryError hierarchy)
- [ ] Implement retry logic with exponential backoff
- [ ] Add fallback strategies for common failure cases
- [ ] Create user-friendly error message mapping
- [ ] Add error context (operation, inputs, parameters)
- [ ] Implement error recovery test suite
- [ ] Document error handling patterns
- [ ] Update error propagation in DAG engine

## Deliverables
- [ ] Robust error handling for all OCCT operations
- [ ] Structured error types and messages
- [ ] Comprehensive error recovery tests
- [ ] Error handling documentation

## Success Criteria
- No unhandled OCCT exceptions in production
- All errors have user-friendly messages
- Transient failures automatically retried
- Error recovery tests pass 100%
- Actionable error messages surface in Studio UI

## Files
- `packages/engine-occt/src/errors/geometry-errors.ts` (new)
- `packages/engine-occt/src/recovery/error-recovery.ts` (enhance)
- `packages/engine-occt/tests/error-recovery/*.test.ts` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.1, Milestone 3)
```

---

### Issue 4: Memory Management & Worker Lifecycle Optimization

**Title**: `[Horizon A] Memory Management & Worker Lifecycle Optimization`

**Labels**: `horizon-a`, `performance`, `memory`, `occt`, `week-7-8`

**Body**:
```markdown
## Overview
Optimize memory usage and worker lifecycle management for OCCT operations.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 1: OCCT Performance & Recovery
- Timeline: Week 7-8 (Month 2)
- Dependencies: #[Error Recovery issue number]

## Objectives
- Profile memory usage across worker lifecycle
- Implement LRU caching for geometry operations
- Add worker restart on memory pressure
- Optimize SharedArrayBuffer usage
- Implement garbage collection triggers
- Add memory leak detection

## Tasks
- [ ] Profile memory usage with Chrome DevTools
- [ ] Identify memory leak patterns
- [ ] Implement LRU cache for geometry results
- [ ] Add memory pressure detection
- [ ] Implement worker restart strategy
- [ ] Optimize SharedArrayBuffer allocation
- [ ] Add garbage collection triggers
- [ ] Create memory profiling tools
- [ ] Add memory leak detection tests
- [ ] Document memory management strategy

## Deliverables
- [ ] Optimized memory management system
- [ ] Worker lifecycle management
- [ ] Memory profiling tools
- [ ] Memory optimization documentation

## Success Criteria
- Memory usage ≤ 1.5GB per tab
- Worker restart time ≤ 500ms
- No memory leaks detected
- LRU cache hit rate > 60%
- Memory profiling tools operational

## Files
- `packages/engine-occt/src/memory-manager.ts` (enhance)
- `packages/engine-occt/src/worker-pool.ts` (enhance)
- `packages/engine-occt/src/cache/geometry-cache.ts` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.1, Milestone 4)
```

---

## Workstream 2: CLI & Studio Alignment

### Issue 5: Geometry API Unification

**Title**: `[Horizon A] Geometry API Unification for CLI & Studio`

**Labels**: `horizon-a`, `api`, `refactor`, `week-1-3`

**Body**:
```markdown
## Overview
Create a single, unified GeometryAPI that both Studio and CLI use identically.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 2: CLI & Studio Alignment
- Timeline: Week 1-3 (Month 1)
- Dependencies: None (can start immediately)

## Objectives
- Audit geometry API usage in Studio and CLI
- Identify divergent code paths
- Create unified GeometryAPI interface
- Migrate Studio to unified API
- Migrate CLI to unified API
- Remove duplicate implementations

## Tasks
- [ ] Audit geometry API usage in Studio
- [ ] Audit geometry API usage in CLI
- [ ] Document divergent code paths
- [ ] Design unified GeometryAPI interface
- [ ] Implement unified API in engine-core
- [ ] Migrate Studio to unified API
- [ ] Migrate CLI to unified API
- [ ] Remove duplicate API implementations
- [ ] Update tests to use unified API
- [ ] Document unified API usage

## Deliverables
- [ ] Single GeometryAPI used by both Studio and CLI
- [ ] API documentation
- [ ] Migration guide for consumers

## Success Criteria
- Studio and CLI use identical GeometryAPI
- No duplicate geometry API implementations
- All tests pass with unified API
- API fully documented

## Files
- `packages/engine-core/src/geometry-api.ts` (enhance)
- `packages/engine-occt/src/integrated-geometry-api.ts` (refactor)
- `apps/studio/src/services/geometry-service.ts` (migrate)
- `packages/cli/src/services/geometry-service.ts` (migrate)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.2, Milestone 1)
```

---

### Issue 6: Remove All Mock Geometry Fallbacks

**Title**: `[Horizon A] Remove All Mock Geometry Fallbacks`

**Labels**: `horizon-a`, `cleanup`, `occt`, `week-4-5`

**Body**:
```markdown
## Overview
Remove all mock geometry fallbacks from production code paths.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 2: CLI & Studio Alignment
- Timeline: Week 4-5 (Month 2)
- Dependencies: #[Geometry API Unification issue number]

## Objectives
- Identify all `forceMode: 'mock'` references
- Identify all MockGeometry usage
- Replace mock usage with OCCT fixtures
- Update tests to use real geometry
- Remove mock geometry conditionals

## Tasks
- [ ] Grep for all `forceMode: 'mock'` references
- [ ] Grep for all MockGeometry usage
- [ ] Create replacement plan for each usage
- [ ] Replace mock usage with OCCT fixtures
- [ ] Update test suite to use real OCCT
- [ ] Remove mock geometry conditionals
- [ ] Validate Studio works without mocks
- [ ] Validate CLI works without mocks
- [ ] Remove mock-related code paths
- [ ] Update documentation

## Deliverables
- [ ] Zero mock geometry usage in production paths
- [ ] All tests use real OCCT or deterministic fixtures
- [ ] Mock code paths removed

## Success Criteria
- No `forceMode: 'mock'` references
- No MockGeometry usage
- All tests pass with real OCCT
- Studio and CLI work without mocks

## Files
- `packages/engine-occt/src/geometry-api-factory.ts` (remove mock logic)
- `packages/engine-core/src/geometry-api-factory.ts` (remove mock logic)
- `apps/studio/src/**/*.ts` (remove mock references)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.2, Milestone 2)
```

---

### Issue 7: Structured Error Propagation

**Title**: `[Horizon A] Structured Error Propagation Across Platform`

**Labels**: `horizon-a`, `error-handling`, `week-6-7`

**Body**:
```markdown
## Overview
Implement consistent error handling and propagation across Studio and CLI.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 2: CLI & Studio Alignment
- Timeline: Week 6-7 (Month 2)
- Dependencies: #[Remove Mock Fallbacks issue number]

## Objectives
- Define error types for geometry operations
- Implement error propagation in DAG engine
- Add error surfacing in Studio UI
- Add error reporting in CLI output
- Document error handling

## Tasks
- [ ] Define GeometryError type hierarchy
- [ ] Implement error propagation in DAG engine
- [ ] Add error surfacing in Studio UI
- [ ] Add structured error output in CLI
- [ ] Create error documentation
- [ ] Add error recovery tests
- [ ] Test error messages for clarity
- [ ] Implement error logging
- [ ] Add error reporting to monitoring

## Deliverables
- [ ] Consistent error handling across Studio and CLI
- [ ] User-friendly error messages
- [ ] Error recovery documentation

## Success Criteria
- All geometry errors use structured types
- Studio displays actionable error messages
- CLI outputs structured error information
- Error propagation tests pass 100%

## Files
- `packages/engine-core/src/errors/geometry-errors.ts` (new)
- `packages/engine-core/src/dag-engine.ts` (enhance error handling)
- `apps/studio/src/components/errors/ErrorDisplay.tsx` (enhance)
- `packages/cli/src/commands/render.ts` (enhance error output)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.2, Milestone 3)
```

---

## Workstream 3: Mock Geometry Teardown

### Issue 8: Mock Geometry Inventory & Teardown Planning

**Title**: `[Horizon A] Mock Geometry Inventory & Teardown Planning`

**Labels**: `horizon-a`, `planning`, `cleanup`, `week-1`

**Body**:
```markdown
## Overview
Create comprehensive inventory of all mock geometry usage and plan migration strategy.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 3: Mock Geometry Teardown
- Timeline: Week 1 (Month 1)
- Dependencies: None (can start immediately)

## Objectives
- Inventory all MockGeometry references
- Inventory all `forceMode: 'mock'` usage
- Categorize usage by criticality
- Create migration plan
- Identify tests needing fixtures
- Identify docs referencing mocks

## Tasks
- [ ] Grep for all MockGeometry references
- [ ] Grep for all `forceMode: 'mock'` usage
- [ ] Categorize usage (critical, high, medium, low)
- [ ] Create migration plan for each usage category
- [ ] Identify tests requiring OCCT fixtures
- [ ] Identify documentation referencing mocks
- [ ] Assess migration risks
- [ ] Create teardown timeline
- [ ] Document findings

## Deliverables
- [ ] Complete inventory of mock usage
- [ ] Prioritized migration plan
- [ ] Risk assessment
- [ ] Teardown plan document

## Success Criteria
- All mock usage catalogued
- Migration plan for each usage
- Risks identified and mitigated
- Timeline established

## Files
- `docs/technical/MOCK_GEOMETRY_TEARDOWN_PLAN.md` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.3, Milestone 1)
```

---

### Issue 9: OCCT Test Fixture Library Creation

**Title**: `[Horizon A] OCCT Test Fixture Library Creation`

**Labels**: `horizon-a`, `testing`, `occt`, `week-2-3`

**Body**:
```markdown
## Overview
Create comprehensive library of deterministic OCCT test fixtures to replace mock geometry.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 3: Mock Geometry Teardown
- Timeline: Week 2-3 (Month 1)
- Dependencies: #[Mock Inventory issue number]

## Objectives
- Create deterministic OCCT test fixtures
- Create golden STEP outputs for reference models
- Create minimal geometry primitives for unit tests
- Document fixture creation process
- Add fixture validation tests

## Tasks
- [ ] Design fixture library structure
- [ ] Create simple primitive fixtures (box, sphere, etc.)
- [ ] Create boolean operation fixtures
- [ ] Create feature operation fixtures (fillet, chamfer)
- [ ] Generate golden STEP outputs for reference models
- [ ] Create minimal fixtures for unit tests
- [ ] Document fixture creation process
- [ ] Add fixture validation tests
- [ ] Publish fixtures to test utilities
- [ ] Create fixture usage examples

## Deliverables
- [ ] Comprehensive test fixture library
- [ ] Golden STEP outputs
- [ ] Fixture documentation
- [ ] Fixture validation suite

## Success Criteria
- Fixtures cover all common test scenarios
- Golden outputs validated
- Fixtures are deterministic and reproducible
- Documentation enables easy fixture usage

## Files
- `packages/engine-occt/tests/fixtures/*.ts` (new)
- `packages/engine-occt/tests/fixtures/golden/*.step` (new)
- `docs/testing/TEST_FIXTURES.md` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.3, Milestone 2)
```

---

### Issue 10: Mock Geometry Removal Execution

**Title**: `[Horizon A] Mock Geometry Removal Execution`

**Labels**: `horizon-a`, `cleanup`, `refactor`, `week-4-6`

**Body**:
```markdown
## Overview
Execute the complete removal of MockGeometry implementation from the codebase.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 3: Mock Geometry Teardown
- Timeline: Week 4-6 (Month 2)
- Dependencies: #[Test Fixtures issue number]

## Objectives
- Remove MockGeometry class
- Remove MockGeometry exports
- Update factory to remove mock logic
- Update all tests to use OCCT fixtures
- Update Studio and CLI to remove mock references
- Update documentation

## Tasks
- [ ] Remove MockGeometry class implementation
- [ ] Remove MockGeometry exports from engine-occt
- [ ] Update geometry-api-factory (remove mock logic)
- [ ] Migrate tests to OCCT fixtures (engine-core)
- [ ] Migrate tests to OCCT fixtures (engine-occt)
- [ ] Migrate tests to OCCT fixtures (nodes-core)
- [ ] Remove mock references from Studio
- [ ] Remove mock references from CLI
- [ ] Update browser demos
- [ ] Update documentation to reflect OCCT-only
- [ ] Run full test suite validation

## Deliverables
- [ ] MockGeometry completely removed
- [ ] All code uses real OCCT
- [ ] Documentation updated
- [ ] Tests passing 100%

## Success Criteria
- MockGeometry class deleted
- No mock exports in packages
- All tests use real OCCT or fixtures
- Studio and CLI work with OCCT only
- Documentation reflects OCCT-only pipeline

## Files
- `packages/engine-occt/src/mock-geometry.ts` (delete)
- `packages/engine-occt/src/geometry-api-factory.ts` (remove mock exports)
- `packages/engine-core/src/geometry-api-factory.ts` (remove mock logic)
- Multiple test files across packages

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.3, Milestone 3)
```

---

### Issue 11: OCCT-Only Validation & CI Integration

**Title**: `[Horizon A] OCCT-Only Validation & CI Integration`

**Labels**: `horizon-a`, `ci`, `testing`, `week-7-8`

**Body**:
```markdown
## Overview
Validate OCCT-only execution and integrate validation into CI pipeline.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 3: Mock Geometry Teardown
- Timeline: Week 7-8 (Month 2)
- Dependencies: #[Mock Removal issue number]

## Objectives
- Validate full test suite with OCCT only
- Validate Studio E2E tests pass
- Validate CLI smoke tests pass
- Add CI checks to prevent mock reintroduction
- Document OCCT setup for CI

## Tasks
- [ ] Run full unit test suite with OCCT only
- [ ] Run Studio E2E tests
- [ ] Run CLI smoke tests
- [ ] Add CI check to detect mock references
- [ ] Update CI to enforce OCCT-only tests
- [ ] Document OCCT setup for CI environment
- [ ] Verify no test coverage regression
- [ ] Add mock detection to pre-commit hooks
- [ ] Update CI/CD documentation

## Deliverables
- [ ] 100% tests passing with real OCCT
- [ ] CI enforces OCCT-only execution
- [ ] Documentation for OCCT CI setup

## Success Criteria
- All tests pass with OCCT only
- CI blocks mock geometry reintroduction
- E2E tests validate OCCT pipeline
- CI setup documented
- No test coverage regression

## Files
- `.github/workflows/test.yml` (update)
- `docs/ci-cd/OCCT_CI_SETUP.md` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.3, Milestone 4)
```

---

## Workstream 4: Autogenerated Node Catalogue

### Issue 12: Node Generator Audit & Template Fixes

**Title**: `[Horizon A] Node Generator Audit & Template Fixes`

**Labels**: `horizon-a`, `generator`, `typescript`, `week-1-3`

**Body**:
```markdown
## Overview
Fix all issues in the node generator templates to produce valid, compilable TypeScript.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 4: Autogenerated Node Catalogue
- Timeline: Week 1-3 (Month 1)
- Dependencies: None (can start immediately)

## Objectives
- Audit generator templates for type errors
- Fix node ID/type property inconsistencies
- Fix socket specification generation
- Fix import path generation
- Fix evaluate handler generation
- Add generator validation tests

## Tasks
- [ ] Audit all generator templates
- [ ] Fix node ID vs type property inconsistencies
- [ ] Fix socket specification generation
- [ ] Fix import path generation
- [ ] Fix evaluate handler generation
- [ ] Fix parameter definition generation
- [ ] Add generator validation framework
- [ ] Create generator unit tests
- [ ] Test generator on sample nodes
- [ ] Document generator fixes

## Deliverables
- [ ] Generator produces valid TypeScript
- [ ] All template issues resolved
- [ ] Generator validation suite

## Success Criteria
- Generator produces compilable TypeScript
- All template issues fixed
- Generator tests pass 100%
- Sample nodes compile successfully

## Files
- `packages/nodes-core/src/generator/templates/*.ts` (fix)
- `packages/nodes-core/src/generator/generate.ts` (fix)
- `packages/nodes-core/src/generator/validator.ts` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.4, Milestone 1)
```

---

### Issue 13: Full Node Catalogue Compilation

**Title**: `[Horizon A] Full 1012+ Node Catalogue Compilation`

**Labels**: `horizon-a`, `generator`, `compilation`, `week-4-5`

**Body**:
```markdown
## Overview
Generate and compile the full 1012+ node catalogue successfully.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 4: Autogenerated Node Catalogue
- Timeline: Week 4-5 (Month 2)
- Dependencies: #[Generator Fixes issue number]

## Objectives
- Generate full 1012+ node catalogue
- Compile all generated nodes successfully
- Validate generated node interfaces
- Add catalogue build to CI
- Document generated node structure

## Tasks
- [ ] Generate full node catalogue
- [ ] Run TypeScript compiler on generated code
- [ ] Fix compilation errors iteratively
- [ ] Validate generated node interfaces
- [ ] Add generated code validation to CI
- [ ] Create catalogue build step in package.json
- [ ] Document generated node structure
- [ ] Add catalogue build to Turborepo pipeline
- [ ] Verify catalogue exports correctly

## Deliverables
- [ ] All 1012+ generated nodes compile cleanly
- [ ] CI validates generated code
- [ ] Catalogue build process documented

## Success Criteria
- Full catalogue compiles with zero errors
- CI runs catalogue build step
- Generated nodes follow consistent structure
- Catalogue documented

## Files
- `packages/nodes-core/src/nodes/generated/*.ts` (regenerate)
- `.github/workflows/build.yml` (add catalogue build)
- `docs/development/GENERATED_NODES.md` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.4, Milestone 2)
```

---

### Issue 14: Node Registration & Validation Framework

**Title**: `[Horizon A] Node Registration & Validation Framework`

**Labels**: `horizon-a`, `testing`, `validation`, `week-6-7`

**Body**:
```markdown
## Overview
Create comprehensive validation framework for generated node registration.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 4: Autogenerated Node Catalogue
- Timeline: Week 6-7 (Month 2)
- Dependencies: #[Catalogue Compilation issue number]

## Objectives
- Test node registration for all generated nodes
- Validate node definitions
- Test evaluate handlers
- Add property-based tests
- Create node validation framework

## Tasks
- [ ] Design node validation framework
- [ ] Test registration of all 1012+ nodes
- [ ] Fix registration errors
- [ ] Validate node definition schemas
- [ ] Test evaluate handler existence
- [ ] Add property-based tests for nodes
- [ ] Create automated validation suite
- [ ] Document node registration process
- [ ] Add validation to CI

## Deliverables
- [ ] All nodes register successfully
- [ ] Node validation framework
- [ ] Property-based test suite

## Success Criteria
- All 1012+ nodes register without errors
- Node validation framework operational
- Property-based tests pass
- Registration documented

## Files
- `packages/nodes-core/src/registry/node-validator.ts` (new)
- `packages/nodes-core/tests/node-registration.test.ts` (new)
- `packages/nodes-core/tests/property-based/*.test.ts` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.4, Milestone 3)
```

---

### Issue 15: Studio Palette Integration for Generated Nodes

**Title**: `[Horizon A] Studio Palette Integration for Generated Nodes`

**Labels**: `horizon-a`, `studio`, `ui`, `week-8`

**Body**:
```markdown
## Overview
Integrate generated nodes into Studio palette with search, filtering, and categorization.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 4: Autogenerated Node Catalogue
- Timeline: Week 8 (Month 3)
- Dependencies: #[Node Validation issue number]

## Objectives
- Create whitelisted node subset for initial release
- Integrate generated nodes into Studio palette
- Add node search and filtering
- Add node documentation/tooltips
- Enable full catalogue via feature flag

## Tasks
- [ ] Create whitelisted node subset (high-quality nodes)
- [ ] Integrate whitelisted nodes into palette
- [ ] Add node search functionality
- [ ] Add node filtering by category
- [ ] Create node documentation/tooltips
- [ ] Implement node categorization UI
- [ ] Add feature flag for full catalogue
- [ ] Test node placement and evaluation
- [ ] Add telemetry for node usage
- [ ] Document palette integration

## Deliverables
- [ ] Generated nodes available in Studio palette
- [ ] Whitelisted subset for v0.2
- [ ] Full catalogue behind feature flag
- [ ] Search and filtering functional

## Success Criteria
- Whitelisted nodes visible in palette
- Node search works correctly
- Filtering by category functional
- Nodes place and evaluate successfully
- Full catalogue toggle works

## Files
- `apps/studio/src/components/NodePalette.tsx` (enhance)
- `packages/nodes-core/src/registry/whitelist.ts` (new)
- `apps/studio/src/config/feature-flags.ts` (add catalogue flag)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.4, Milestone 4)
```

---

## Workstream 5: Type Safety & Artifact Hygiene

### Issue 16: Enable TypeScript Strict Mode Across All Packages

**Title**: `[Horizon A] Enable TypeScript Strict Mode Across All Packages`

**Labels**: `horizon-a`, `typescript`, `quality`, `week-1-2`

**Body**:
```markdown
## Overview
Enable TypeScript strict mode for all packages and fix remaining type errors.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 5: Type Safety & Artifact Hygiene
- Timeline: Week 1-2 (Month 3)
- Dependencies: None (can start immediately)

## Objectives
- Audit packages failing typecheck
- Fix collaboration OT type issues
- Fix all remaining type errors
- Enable strict mode for all packages
- Add CI gate for typecheck

## Tasks
- [ ] Audit all packages for typecheck failures
- [ ] Fix collaboration package type issues
- [ ] Fix OT (Operational Transform) types
- [ ] Fix remaining type errors in other packages
- [ ] Enable `strict: true` in all tsconfig files
- [ ] Add CI gate for `pnpm typecheck`
- [ ] Document type safety patterns
- [ ] Create type safety guide
- [ ] Fix any new errors from strict mode
- [ ] Validate all packages pass typecheck

## Deliverables
- [ ] All packages pass `pnpm typecheck`
- [ ] Strict mode enabled everywhere
- [ ] CI enforces type checking
- [ ] Type safety guide

## Success Criteria
- Zero TypeScript errors
- Strict mode enabled in all tsconfig
- CI blocks merges with type errors
- Type safety documented

## Files
- `packages/collaboration/**/*.ts` (fix types)
- `tsconfig.json` (enable strict mode)
- `.github/workflows/ci.yml` (add typecheck gate)
- `docs/development/TYPE_SAFETY.md` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.5, Milestone 1)
```

---

### Issue 17: Enforce Lint Rules & CI Gates

**Title**: `[Horizon A] Enforce Lint Rules & CI Gates`

**Labels**: `horizon-a`, `quality`, `ci`, `week-3`

**Body**:
```markdown
## Overview
Enforce ESLint rules and add CI gates for code quality.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 5: Type Safety & Artifact Hygiene
- Timeline: Week 3 (Month 3)
- Dependencies: #[TypeScript Strict Mode issue number]

## Objectives
- Review and enhance ESLint configuration
- Add additional security rules
- Fix remaining lint errors
- Add CI gate for lint
- Document lint rules

## Tasks
- [ ] Review current ESLint configuration
- [ ] Add security-focused lint rules
- [ ] Add performance lint rules
- [ ] Fix all remaining lint errors
- [ ] Add CI gate for `pnpm lint`
- [ ] Document lint rules and rationale
- [ ] Create lint override guide
- [ ] Test lint rules on codebase
- [ ] Update contributor guidelines

## Deliverables
- [ ] Zero lint errors
- [ ] CI enforces lint checks
- [ ] Lint rules documented
- [ ] Override guide available

## Success Criteria
- All packages pass `pnpm lint`
- CI blocks merges with lint errors
- Lint rules documented
- Contributors understand rules

## Files
- `.eslintrc.json` (enhance)
- `.github/workflows/ci.yml` (add lint gate)
- `docs/development/LINT_RULES.md` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.5, Milestone 2)
```

---

### Issue 18: Build Artifact Cleanup & Management

**Title**: `[Horizon A] Build Artifact Cleanup & Management`

**Labels**: `horizon-a`, `cleanup`, `ci`, `week-4`

**Body**:
```markdown
## Overview
Clean build artifacts from git and prevent future artifact commits.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 5: Type Safety & Artifact Hygiene
- Timeline: Week 4 (Month 3)
- Dependencies: #[Lint Rules issue number]

## Objectives
- Audit git tree for dist artifacts
- Update .gitignore for all build outputs
- Add pre-commit hook to prevent artifacts
- Document build output locations
- Add CI check for clean tree

## Tasks
- [ ] Audit git tree for dist artifacts
- [ ] Update .gitignore for all build outputs
- [ ] Create pre-commit hook for artifact detection
- [ ] Clean existing artifacts from working tree
- [ ] (Optional) Clean artifacts from git history
- [ ] Document build output locations
- [ ] Add CI check for tree cleanliness
- [ ] Test pre-commit hook
- [ ] Update contributor guidelines

## Deliverables
- [ ] No dist artifacts in git
- [ ] Pre-commit hook prevents artifacts
- [ ] CI validates clean tree
- [ ] Build outputs documented

## Success Criteria
- Git tree contains no build artifacts
- Pre-commit hook blocks artifact commits
- CI detects artifact violations
- Build output locations documented

## Files
- `.gitignore` (update)
- `.husky/pre-commit` (add artifact check)
- `.github/workflows/ci.yml` (add tree cleanliness check)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.5, Milestone 3)
```

---

### Issue 19: OCCT Build Documentation & Setup Guide

**Title**: `[Horizon A] OCCT Build Documentation & Setup Guide`

**Labels**: `horizon-a`, `documentation`, `occt`, `week-5`

**Body**:
```markdown
## Overview
Create comprehensive documentation for OCCT build setup and troubleshooting.

## Context
- Part of Horizon A: Geometry Hardening (Q1 2026)
- Workstream 5: Type Safety & Artifact Hygiene
- Timeline: Week 5 (Month 3)
- Dependencies: #[Artifact Cleanup issue number]

## Objectives
- Document Emscripten setup process
- Document OCCT compilation process
- Create troubleshooting guide
- Document common build errors
- Provide platform-specific instructions

## Tasks
- [ ] Document Emscripten installation
- [ ] Document OCCT compilation steps
- [ ] Create step-by-step build guide
- [ ] Document common build errors
- [ ] Create troubleshooting guide
- [ ] Add Windows-specific instructions
- [ ] Add macOS-specific instructions
- [ ] Add Linux-specific instructions
- [ ] Test documentation on clean machines
- [ ] Create build automation scripts
- [ ] Document CI build setup

## Deliverables
- [ ] Comprehensive OCCT build guide
- [ ] Troubleshooting documentation
- [ ] Platform-specific instructions
- [ ] Build automation scripts

## Success Criteria
- Documentation enables successful OCCT build
- Troubleshooting guide covers common issues
- Platform-specific instructions tested
- Build scripts automate setup

## Files
- `docs/development/OCCT_BUILD_GUIDE.md` (new)
- `docs/development/OCCT_TROUBLESHOOTING.md` (new)
- `scripts/build-occt.sh` (enhance)
- `scripts/setup-emscripten.sh` (new)

## Related Documentation
See: `docs/project/HORIZON_A_GEOMETRY_HARDENING.md` (Section 2.5, Milestone 4)
```

---

## Issue Creation Instructions

### Creating Issues via GitHub Web UI

1. Go to: `https://github.com/madfam-io/brepflow/issues/new`
2. Copy the title and body from each issue template above
3. Add the specified labels
4. Assign to the "Horizon A: Geometry Hardening" milestone
5. Assign to appropriate team member(s)

### Creating Issues via GitHub CLI

If you have `gh` CLI installed, you can create all issues with this script:

```bash
# Create milestone
gh milestone create "Horizon A: Geometry Hardening" \
  --description "Complete OCCT pipeline optimization and geometry reliability improvements. Target: Q1 2026 (March 2026)" \
  --due-date "2026-03-31"

# Create issues (example for first issue)
gh issue create \
  --title "[Horizon A] OCCT Performance Profiling & Baseline" \
  --body-file issue-1-body.md \
  --label "horizon-a,performance,occt,week-1-2" \
  --milestone "Horizon A: Geometry Hardening"

# Repeat for all 19 issues...
```

### Bulk Creation Script

Save each issue body to a file (`issue-1-body.md`, etc.) and use this script:

```bash
#!/bin/bash

# Array of issue titles
titles=(
  "[Horizon A] OCCT Performance Profiling & Baseline"
  "[Horizon A] Operation-Level Diagnostics & Monitoring"
  # ... add all 19 titles
)

# Array of label sets
labels=(
  "horizon-a,performance,occt,week-1-2"
  "horizon-a,monitoring,occt,week-3-4"
  # ... add all 19 label sets
)

# Create each issue
for i in "${!titles[@]}"; do
  gh issue create \
    --title "${titles[$i]}" \
    --body-file "issue-$((i+1))-body.md" \
    --label "${labels[$i]}" \
    --milestone "Horizon A: Geometry Hardening"
done
```

---

## Issue Labels

Recommended labels for this project:

- `horizon-a` - All Horizon A issues
- `performance` - Performance-related work
- `occt` - OCCT geometry work
- `monitoring` - Monitoring and diagnostics
- `error-handling` - Error handling improvements
- `memory` - Memory management
- `api` - API design and refactoring
- `refactor` - Code refactoring
- `cleanup` - Code cleanup
- `testing` - Testing improvements
- `ci` - CI/CD work
- `generator` - Node generator work
- `typescript` - TypeScript improvements
- `quality` - Code quality
- `documentation` - Documentation work
- `studio` - Studio app work
- `ui` - UI work
- `week-X-Y` - Timeline indicators

---

## Summary

This document contains **19 detailed GitHub issues** covering all major milestones across the 5 workstreams of Horizon A:

1. **OCCT Performance & Recovery** (4 issues)
2. **CLI & Studio Alignment** (3 issues)
3. **Mock Geometry Teardown** (4 issues)
4. **Autogenerated Node Catalogue** (4 issues)
5. **Type Safety & Artifact Hygiene** (4 issues)

Each issue includes:
- Clear overview and context
- Specific objectives and tasks
- Deliverables and success criteria
- File locations for implementation
- Timeline and dependencies
- Links to roadmap documentation

**Total Estimated Effort**: 12 weeks (3 months) to complete all workstreams.
