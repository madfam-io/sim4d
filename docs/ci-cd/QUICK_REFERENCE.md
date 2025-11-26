# CI/CD Quick Reference

Quick reference guide for Sim4D's Docker-based CI/CD workflows.

## Workflows Overview

| Workflow              | Triggers         | Duration   | Purpose                                |
| --------------------- | ---------------- | ---------- | -------------------------------------- |
| `test-docker.yml`     | Push, PR, Manual | ~15-25 min | Docker-based testing (unit, WASM, E2E) |
| `pr-quality-gate.yml` | PR open/sync     | ~10-15 min | PR validation and quality checks       |
| `ci.yml`              | Push, PR         | ~10-15 min | Lint, typecheck, native tests, build   |
| `e2e-tests.yml`       | Push, PR         | ~15-20 min | Native E2E tests with Playwright       |
| `container-build.yml` | Weekly, Manual   | ~5-10 min  | Container build verification           |

## Quick Commands

### Local Development

```bash
# Docker testing (matches CI exactly)
./scripts/docker-dev.sh test:all     # All Docker tests
./scripts/docker-dev.sh test:unit    # Unit tests only
./scripts/docker-dev.sh test:wasm    # WASM tests only
./scripts/docker-dev.sh test:e2e     # E2E tests only

# Native testing
pnpm run test                        # Unit tests
pnpm run test:e2e                    # E2E tests
pnpm run test:all                    # All tests

# Quality checks (pre-push)
pnpm run lint                        # Linting
pnpm run typecheck                   # TypeScript
pnpm run format                      # Code formatting
pnpm audit                           # Security audit
```

### CI/CD Workflows

```bash
# Trigger manual workflow run
gh workflow run test-docker.yml

# View workflow status
gh workflow view test-docker.yml

# List recent runs
gh run list --workflow=test-docker.yml

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

## Test Execution Matrix

### Docker Unit Tests

- **Container**: `Dockerfile.test-unit` (Node.js 20 Alpine)
- **Duration**: 2-5 minutes
- **Artifacts**: Coverage reports (JSON, HTML, LCOV)
- **Cache**: Docker layers, pnpm dependencies
- **Local**: `./scripts/docker-dev.sh test:unit`

### Docker WASM Tests

- **Container**: `Dockerfile.test-wasm` (Playwright + Chromium)
- **Duration**: 5-10 minutes
- **Artifacts**: Test results, screenshots, videos
- **Features**: Real browser, fetch() API, SharedArrayBuffer
- **Local**: `./scripts/docker-dev.sh test:wasm`

### Docker E2E Tests

- **Services**: Studio, Collaboration, Redis, PostgreSQL
- **Duration**: 10-15 minutes
- **Artifacts**: Playwright reports, service logs
- **Health Checks**: Automated service readiness validation
- **Local**: `./scripts/docker-dev.sh test:e2e`

## Quality Gate Checklist

### PR Requirements

- [ ] **Title**: Conventional commit format (feat|fix|docs|etc)
- [ ] **Description**: At least 20 characters with Changes/Testing sections
- [ ] **Tests**: All Docker tests passing (100% pass rate)
- [ ] **Coverage**: Maintained or improved
- [ ] **Security**: No critical vulnerabilities (Trivy scan)
- [ ] **Code Quality**: No new lint/typecheck errors
- [ ] **Size**: <500 lines changed (recommended)

### Pre-Merge Validation

```bash
# Run full quality gate locally
pnpm run lint && \
pnpm run typecheck && \
./scripts/docker-dev.sh test:all && \
pnpm audit --audit-level=high
```

## Performance Targets

### Build Times (with cache)

| Build         | Target | Current  |
| ------------- | ------ | -------- |
| Unit (cold)   | <180s  | ~120s ✅ |
| Unit (cached) | <30s   | ~15s ✅  |
| WASM          | <240s  | ~180s ✅ |
| E2E           | <300s  | ~600s ⚠️ |

### Test Execution

| Suite | Target | Current  |
| ----- | ------ | -------- |
| Unit  | <60s   | ~25s ✅  |
| WASM  | <120s  | ~90s ✅  |
| E2E   | <600s  | ~450s ✅ |

### Quality Metrics

| Metric         | Target     | Current |
| -------------- | ---------- | ------- |
| Test Pass Rate | 100%       | 100% ✅ |
| Coverage       | >80%       | ~85% ✅ |
| TS Errors      | 0          | 0 ✅    |
| Security       | 0 critical | 0 ✅    |

## Artifacts & Reports

### Automatic Collection

| Artifact      | Workflow            | Path                 | Retention       |
| ------------- | ------------------- | -------------------- | --------------- |
| Coverage      | test-docker.yml     | `coverage/`          | 30 days         |
| WASM Results  | test-docker.yml     | `test-results/`      | 30 days         |
| E2E Reports   | test-docker.yml     | `playwright-report/` | 30 days         |
| Service Logs  | test-docker.yml     | `logs/`              | 7 days          |
| Security Scan | pr-quality-gate.yml | SARIF                | GitHub Security |

### Accessing Artifacts

```bash
# List artifacts for a run
gh run view <run-id> --log

# Download all artifacts
gh run download <run-id>

# Download specific artifact
gh run download <run-id> -n coverage-unit-tests
```

## Troubleshooting

### Common Issues

#### Build Timeout

```bash
# Check Docker cache status
docker buildx du

# Clear build cache if needed
docker buildx prune -f
```

#### Test Failures

```bash
# View detailed logs
docker compose -f docker-compose.test.yml logs test-unit

# Run with verbose output
docker compose -f docker-compose.test.yml run --rm test-unit pnpm run test -- --reporter=verbose
```

#### Service Health Issues

```bash
# Check service status
docker compose -f docker-compose.test.yml ps

# View health check logs
docker compose -f docker-compose.test.yml logs studio-test
```

### Debug Mode

```bash
# Run tests interactively
docker compose -f docker-compose.test.yml run --rm test-unit bash

# Inside container
pnpm run test -- --watch
```

## GitHub Actions UI

### Viewing Results

1. **Navigate to Actions tab**: `https://github.com/aureo-labs/sim4d/actions`
2. **Select workflow**: Click on workflow name
3. **View run**: Click on specific run
4. **Check summary**: Review job summaries and artifacts
5. **Download artifacts**: Click on artifact name to download

### Status Badges

Add to README.md:

```markdown
![Docker Tests](https://github.com/aureo-labs/sim4d/actions/workflows/test-docker.yml/badge.svg)
![PR Quality Gate](https://github.com/aureo-labs/sim4d/actions/workflows/pr-quality-gate.yml/badge.svg)
```

## Best Practices

### PR Workflow

1. **Create feature branch**: `git checkout -b feat/my-feature`
2. **Make changes**: Implement feature with tests
3. **Run local tests**: `./scripts/docker-dev.sh test:all`
4. **Commit**: Use conventional commit format
5. **Push**: `git push origin feat/my-feature`
6. **Create PR**: Add description with Changes/Testing sections
7. **Wait for CI**: All checks must pass
8. **Address feedback**: Make changes if needed
9. **Merge**: Once approved and checks pass

### Optimization Tips

1. **Leverage cache**: Docker layers cached automatically
2. **Run parallel**: Independent tests run concurrently
3. **Fail fast**: Fix issues early in pipeline
4. **Monitor performance**: Track build/test times
5. **Keep PRs small**: Easier to review and test

## Links

- **Full Documentation**: [DOCKER_CI_CD.md](./DOCKER_CI_CD.md)
- **Docker Testing Guide**: [../testing/DOCKER_TESTING.md](../testing/DOCKER_TESTING.md)
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Workflow Files**: `.github/workflows/`

---

**Last Updated**: 2025-11-17  
**Version**: 1.0.0
