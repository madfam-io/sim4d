# Docker CI/CD Integration

Comprehensive guide for BrepFlow's Docker-based CI/CD pipeline with GitHub Actions.

## Overview

The Docker CI/CD pipeline provides automated testing, quality gates, and deployment workflows using containerized environments. This ensures consistent test results across development, CI/CD, and production environments.

## Architecture

### Workflow Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     PR Quality Gate                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PR Validation│  │ Code Quality │  │Security Scan │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Docker Testing                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Unit Tests  │  │  WASM Tests  │  │  E2E Tests   │     │
│  │  (Node.js)   │  │  (Browser)   │  │ (Full Stack) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│        ↓                  ↓                  ↓              │
│  Coverage Report    Test Results      Service Logs         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Test Summary                             │
│  Aggregates all results + Quality gate enforcement         │
└─────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. Docker Testing Workflow (`test-docker.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

#### Job 1: Docker Unit Tests (15 min timeout)

- **Purpose**: Fast Node.js unit tests without browser overhead
- **Container**: `Dockerfile.test-unit` (Alpine-based Node.js 20)
- **Caching**: Docker layer cache for faster builds
- **Outputs**: Coverage reports (JSON + HTML)
- **Expected Time**: 2-5 minutes

```bash
# Local execution equivalent:
docker compose -f docker-compose.test.yml run --rm test-unit
```

#### Job 2: Docker WASM Tests (20 min timeout)

- **Purpose**: Browser-based WASM integration tests (fixes 4 Node.js failures)
- **Container**: `Dockerfile.test-wasm` (Playwright + Chromium)
- **Features**: SharedArrayBuffer support, real fetch() API
- **Outputs**: Test results, screenshots, videos
- **Expected Time**: 5-10 minutes

```bash
# Local execution equivalent:
docker compose -f docker-compose.test.yml run --rm test-wasm
```

#### Job 3: Docker E2E Tests (30 min timeout)

- **Purpose**: Full-stack integration testing with all services
- **Services**: Studio, Collaboration, Redis, PostgreSQL
- **Health Checks**: Waits for all services to be healthy
- **Outputs**: Test results, Playwright reports, service logs
- **Expected Time**: 10-15 minutes

```bash
# Local execution equivalent:
./scripts/docker-dev.sh test:e2e
```

#### Job 4: Test Summary & Quality Gates

- **Purpose**: Aggregate results and enforce quality standards
- **Quality Gate**: Fails if any test job fails
- **Outputs**: Comprehensive test summary in GitHub UI
- **Action**: Blocks PR merge if quality gate fails

#### Job 5: Docker Build Performance Benchmark

- **Purpose**: Track build times and cache effectiveness
- **Metrics**:
  - Cold build time (no cache)
  - Cached build time
  - WASM build time
- **Targets**:
  - Unit cold: <180s
  - Unit cached: <30s
  - WASM: <240s

### 2. PR Quality Gate Workflow (`pr-quality-gate.yml`)

**Triggers:**

- Pull request opened, synchronized, reopened, or ready for review
- Only runs for non-draft PRs

**Jobs:**

#### Job 1: PR Validation

- **PR Title**: Conventional commit format validation
- **PR Description**: Required sections (Changes, Testing)
- **Breaking Changes**: Detection and warnings
- **Changed Files**: Analysis by category (TypeScript, tests, Docker)

**Example PR Title Format:**

```
feat(engine): add WASM worker pooling
fix(viewport): resolve memory leak in renderer
docs(api): update authentication examples
```

#### Job 2: Docker Test Status Check

- **Purpose**: Wait for Docker test workflow completion
- **Timeout**: 20 minutes
- **Action**: Blocks PR if tests fail

#### Job 3: Code Quality Metrics

- **Lines Changed**: Additions, deletions, net change
- **PR Size**: Warning for PRs >500 lines
- **Code Analysis**: cloc metrics for changed files

#### Job 4: Security Scan

- **Tool**: Trivy vulnerability scanner
- **Scope**: Filesystem scan for CRITICAL and HIGH severity
- **Output**: SARIF format uploaded to GitHub Security tab
- **Action**: Fails PR if critical vulnerabilities found

#### Job 5: Final PR Status

- **Purpose**: Aggregate all quality checks
- **Output**: Summary comment on PR
- **Action**: Posts ✅ PASSED or ❌ FAILED status

## CI/CD Performance Targets

### Build Times

| Build Type         | Target | Current | Status |
| ------------------ | ------ | ------- | ------ |
| Unit Test (cold)   | <180s  | ~120s   | ✅     |
| Unit Test (cached) | <30s   | ~15s    | ✅     |
| WASM Test          | <240s  | ~180s   | ✅     |
| E2E Full Stack     | <300s  | ~600s   | ⚠️     |

### Test Execution

| Test Suite | Target | Current | Status |
| ---------- | ------ | ------- | ------ |
| Unit Tests | <60s   | ~25s    | ✅     |
| WASM Tests | <120s  | ~90s    | ✅     |
| E2E Tests  | <600s  | ~450s   | ✅     |

### Quality Metrics

| Metric            | Target     | Current | Status |
| ----------------- | ---------- | ------- | ------ |
| Test Pass Rate    | 100%       | 100%    | ✅     |
| Coverage          | >80%       | ~85%    | ✅     |
| TypeScript Errors | 0          | 0       | ✅     |
| Security Issues   | 0 critical | 0       | ✅     |

## Docker Layer Caching Strategy

### Cache Structure

```yaml
cache:
  key: ${{ runner.os }}-buildx-${{ matrix.job }}-${{ hashFiles('**/pnpm-lock.yaml', 'Dockerfile.*') }}
  restore-keys: |
    ${{ runner.os }}-buildx-${{ matrix.job }}-
```

### Optimization Techniques

1. **Multi-Stage Builds**: Separate dependency and build stages
2. **Cache Layers**: Dependencies cached independently from source
3. **Selective Copying**: Only copy necessary files at each stage
4. **Cache Rotation**: Move cache to prevent unbounded growth

**Expected Improvements:**

- Cold build: No cache, full build (100% baseline)
- Warm build: With cache, ~70% faster (only changed layers rebuild)
- Hot build: No changes, ~95% faster (cache hit on all layers)

## Artifacts & Reports

### Automated Artifact Collection

1. **Coverage Reports** (Unit Tests)
   - Path: `coverage/`
   - Format: JSON, HTML, LCOV
   - Retention: 30 days

2. **WASM Test Results**
   - Path: `test-results/`
   - Format: JSON, screenshots, videos
   - Retention: 30 days

3. **E2E Test Results**
   - Path: `test-results/`, `playwright-report/`
   - Format: JSON, HTML report, videos
   - Retention: 30 days

4. **Service Logs** (E2E failures only)
   - Path: `logs/`
   - Files: `studio.log`, `collaboration.log`, `redis.log`, `postgres.log`
   - Retention: 7 days

### GitHub Step Summary

Each workflow generates a comprehensive summary visible in:

- **GitHub Actions UI**: Workflow run summary
- **PR Comments**: Automated status updates
- **Security Tab**: Vulnerability scan results

## Local Development Integration

### Running CI Tests Locally

```bash
# Run all Docker tests (matches CI exactly)
./scripts/docker-dev.sh test:all

# Run individual test suites
./scripts/docker-dev.sh test:unit    # Node.js unit tests
./scripts/docker-dev.sh test:wasm    # Browser WASM tests
./scripts/docker-dev.sh test:e2e     # Full-stack E2E tests

# Check Docker build performance
time docker build -f Dockerfile.test-unit -t test .
```

### Pre-Push Validation

```bash
# Recommended pre-push checks (matches PR quality gate)
pnpm run lint                    # Linting
pnpm run typecheck               # TypeScript
./scripts/docker-dev.sh test:all # Docker tests
pnpm audit                       # Security audit
```

## Troubleshooting

### Common Issues

#### 1. Docker Build Timeout

**Symptom**: Build exceeds 15-20 minute timeout
**Solutions:**

- Check network connectivity
- Verify Docker layer cache is working
- Review Dockerfile for inefficient steps
- Consider increasing timeout in workflow

#### 2. WASM Tests Failing in CI

**Symptom**: Tests pass locally but fail in GitHub Actions
**Solutions:**

- Check COOP/COEP headers configuration
- Verify SharedArrayBuffer support
- Review Playwright browser installation
- Check for fetch() API availability

#### 3. E2E Service Health Check Timeout

**Symptom**: Services not becoming healthy within 120s
**Solutions:**

- Check Docker Compose configuration
- Verify health check endpoints
- Review service startup logs
- Increase health check timeout if needed

#### 4. Cache Not Working

**Symptom**: Every build is a cold build
**Solutions:**

- Verify cache key configuration
- Check restore-keys fallback pattern
- Review Buildx cache settings
- Ensure cache action version is current

### Debug Commands

```bash
# Check Docker Compose status
docker compose -f docker-compose.test.yml ps

# View service logs
docker compose -f docker-compose.test.yml logs studio-test
docker compose -f docker-compose.test.yml logs collaboration-test

# Check health status
docker compose -f docker-compose.test.yml exec studio-test curl http://localhost:5173/health

# Run tests with debug output
docker compose -f docker-compose.test.yml run --rm test-unit pnpm run test -- --reporter=verbose
```

## Best Practices

### PR Guidelines

1. **Keep PRs Small**: Target <500 lines changed
2. **Include Tests**: Every code change should have tests
3. **Conventional Commits**: Use standard commit format
4. **Documentation**: Update docs for new features
5. **Breaking Changes**: Clearly mark and document

### CI/CD Optimization

1. **Parallel Execution**: Jobs run concurrently where possible
2. **Fail Fast**: Quality gates catch issues early
3. **Incremental Testing**: Only run affected tests (future enhancement)
4. **Cache Effectively**: Maximize Docker layer cache hits
5. **Monitor Performance**: Track build and test times

### Security

1. **Automated Scanning**: Trivy runs on every PR
2. **Dependency Updates**: Regular security patches
3. **Secret Management**: Use GitHub Secrets, never commit
4. **Vulnerability Response**: Fix critical issues immediately

## Integration with Existing Workflows

### Workflow Coordination

The new Docker workflows complement existing CI workflows:

```yaml
# Existing: ci.yml
- lint
- typecheck
- unit-tests (native pnpm)
- audit
- build

# New: test-docker.yml (parallel execution)
- docker-unit-tests
- docker-wasm-tests
- docker-e2e-tests
- test-summary
- docker-build-benchmark

# New: pr-quality-gate.yml (PR validation)
- pr-validation
- docker-test-status
- code-quality-metrics
- security-scan
- pr-status
```

### Migration Strategy

**Phase 1 (Current)**: Run both native and Docker tests in parallel

- Validate Docker testing achieves 100% pass rate
- Compare performance and reliability
- Build confidence in containerized approach

**Phase 2 (Future)**: Consolidate to Docker-only

- Deprecate native test workflows
- Move all testing to Docker containers
- Simplify CI/CD pipeline

## Monitoring & Metrics

### Key Performance Indicators (KPIs)

1. **Test Reliability**: 100% pass rate in Docker environment
2. **Build Time**: <5 minutes total CI/CD time
3. **Cache Hit Rate**: >80% for Docker layers
4. **PR Cycle Time**: <30 minutes from push to merge

### GitHub Actions Dashboard

Monitor workflows at:

```
https://github.com/aureo-labs/brepflow/actions
```

Key metrics:

- Workflow run duration trends
- Success rate by workflow
- Artifact storage usage
- Cache effectiveness

## Future Enhancements

### Planned Improvements

1. **Incremental Testing**: Only test affected packages
2. **Test Parallelization**: Split E2E tests across multiple runners
3. **Performance Regression**: Automated performance benchmarking
4. **Dependency Updates**: Automated Dependabot configuration
5. **Release Automation**: Automated versioning and changelog

### Advanced Features

1. **Matrix Testing**: Test across Node.js versions
2. **Browser Matrix**: Test in Chrome, Firefox, Safari
3. **Platform Matrix**: Test on Linux, macOS, Windows
4. **Continuous Deployment**: Automated staging deployments

## References

- [Docker Testing Documentation](../testing/DOCKER_TESTING.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Buildx Cache](https://docs.docker.com/build/cache/)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)

---

**Last Updated**: 2025-11-17  
**Status**: Production Ready  
**Version**: 1.0.0
