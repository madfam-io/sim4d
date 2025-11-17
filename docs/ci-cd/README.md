# CI/CD Documentation

Documentation for BrepFlow's Docker-based CI/CD pipeline with GitHub Actions.

## Quick Links

- **🚀 Quick Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Daily commands and shortcuts
- **📘 Full Guide**: [DOCKER_CI_CD.md](./DOCKER_CI_CD.md) - Comprehensive CI/CD documentation
- **🐳 Docker Testing**: [../testing/DOCKER_TESTING.md](../testing/DOCKER_TESTING.md) - Docker test infrastructure
- **📊 Monitoring**: [MONITORING.md](./MONITORING.md) - Monitoring and maintenance guide
- **💬 Slack Setup**: [SLACK_SETUP.md](./SLACK_SETUP.md) - Optional Slack notifications

## Overview

BrepFlow uses a Docker-based CI/CD pipeline that provides:

- ✅ **100% Test Pass Rate**: All tests passing in containerized environment
- ✅ **Automated Quality Gates**: PR validation and quality enforcement
- ✅ **Parallel Execution**: Fast feedback through concurrent testing
- ✅ **Performance Monitoring**: Build time tracking and optimization
- ✅ **Security Scanning**: Automated vulnerability detection

## Getting Started

### For Developers

**Run tests locally (matches CI exactly):**

```bash
./scripts/docker-dev.sh test:all
```

**Pre-push checklist:**

```bash
pnpm run lint && \
pnpm run typecheck && \
./scripts/docker-dev.sh test:all
```

**Monitor your PR:**

```bash
gh pr checks <pr-number>
gh run watch
```

### For Reviewers

**Check PR status:**

```bash
gh pr view <pr-number> --web
```

**Download test artifacts:**

```bash
gh run download <run-id>
```

## Workflows

### Active Workflows

| Workflow                                                           | Purpose                          | Triggers         | Duration   |
| ------------------------------------------------------------------ | -------------------------------- | ---------------- | ---------- |
| [test-docker.yml](../../.github/workflows/test-docker.yml)         | Docker testing (unit, WASM, E2E) | Push, PR, Manual | ~15-25 min |
| [pr-quality-gate.yml](../../.github/workflows/pr-quality-gate.yml) | PR validation & quality          | PR open/sync     | ~10-15 min |
| [ci.yml](../../.github/workflows/ci.yml)                           | Lint, typecheck, native tests    | Push, PR         | ~10-15 min |
| [e2e-tests.yml](../../.github/workflows/e2e-tests.yml)             | Native E2E testing               | Push, PR         | ~15-20 min |

### Quality Gates

PRs must pass all quality gates before merge:

- ✅ **All tests passing** (185/185 Docker tests)
- ✅ **No TypeScript errors**
- ✅ **No linting violations**
- ✅ **No critical security vulnerabilities**
- ✅ **Coverage maintained or improved**
- ✅ **PR title/description requirements met**

## Performance

### Current Metrics (2025-11-17)

| Metric         | Target | Current | Status |
| -------------- | ------ | ------- | ------ |
| Test Pass Rate | 100%   | 100%    | ✅     |
| Unit Tests     | <60s   | ~25s    | ✅     |
| WASM Tests     | <120s  | ~90s    | ✅     |
| E2E Tests      | <600s  | ~450s   | ✅     |
| Total CI/CD    | <25min | ~20min  | ✅     |

### Build Performance

| Build Type    | Target | Current | Status |
| ------------- | ------ | ------- | ------ |
| Unit (cold)   | <180s  | ~120s   | ✅     |
| Unit (cached) | <30s   | ~15s    | ✅     |
| WASM          | <240s  | ~180s   | ✅     |

## Documentation Structure

```
docs/ci-cd/
├── README.md                 # This file - overview and navigation
├── QUICK_REFERENCE.md        # Daily commands and shortcuts
└── DOCKER_CI_CD.md          # Comprehensive CI/CD guide

Related:
├── docs/testing/DOCKER_TESTING.md    # Docker test infrastructure
└── .github/workflows/                # Workflow definitions
    ├── test-docker.yml               # Docker testing workflow
    └── pr-quality-gate.yml           # PR quality gate workflow
```

## Common Tasks

### Running Tests

```bash
# All Docker tests (matches CI exactly)
./scripts/docker-dev.sh test:all

# Individual test suites
./scripts/docker-dev.sh test:unit    # Fast unit tests
./scripts/docker-dev.sh test:wasm    # Browser WASM tests
./scripts/docker-dev.sh test:e2e     # Full-stack E2E

# Native tests (alternative)
pnpm run test                        # Unit tests
pnpm run test:e2e                    # E2E tests
```

### Checking Status

```bash
# List recent workflow runs
gh run list --workflow=test-docker.yml

# Watch current run
gh run watch

# View specific run details
gh run view <run-id>

# Check PR status
gh pr checks <pr-number>
```

### Debugging Failures

```bash
# View workflow logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>

# Run tests locally with same Docker setup
./scripts/docker-dev.sh test:all

# Check specific test suite
docker compose -f docker-compose.test.yml run --rm test-unit
```

## Troubleshooting

### Common Issues

#### Tests pass locally but fail in CI

- Ensure you're using Docker tests: `./scripts/docker-dev.sh test:all`
- Check for environment-specific issues (Node.js vs browser)
- Review GitHub Actions logs for details

#### Docker build timeout

- Check Docker layer cache: `docker buildx du`
- Clear cache if needed: `docker buildx prune -f`
- Verify network connectivity

#### Quality gate failing

1. Check which specific check failed
2. Review GitHub Actions summary
3. Fix issues locally
4. Run pre-push validation before pushing

### Getting Help

- **Documentation**: Read [DOCKER_CI_CD.md](./DOCKER_CI_CD.md) for detailed guidance
- **Quick Reference**: Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for commands
- **GitHub Issues**: Search existing issues or create new one
- **Team**: Ask in development channel

## Best Practices

### PR Workflow

1. **Create feature branch**: `git checkout -b feat/my-feature`
2. **Make changes**: Implement with tests
3. **Test locally**: `./scripts/docker-dev.sh test:all`
4. **Commit**: Use conventional commit format
5. **Push**: `git push origin feat/my-feature`
6. **Create PR**: Include description (Changes, Testing)
7. **Monitor CI**: All checks must pass
8. **Address feedback**: Make changes if needed
9. **Merge**: Once approved and checks pass

### Optimization

- **Leverage cache**: Docker layers cached automatically
- **Keep PRs small**: <500 lines for faster review
- **Run tests first**: Catch issues before pushing
- **Monitor performance**: Track build/test times
- **Fix quickly**: Address CI failures immediately

### Security

- **Scan regularly**: Trivy runs on every PR
- **Update dependencies**: Keep security patches current
- **Review alerts**: Check GitHub Security tab
- **No secrets in code**: Use GitHub Secrets only

## Monitoring

### Key Metrics

Track these metrics in GitHub Actions dashboard:

- **Success Rate**: Should be >95%
- **Duration**: Should meet targets (<25 min total)
- **Cache Hit Rate**: Should be >80%
- **Test Pass Rate**: Must be 100%

### Dashboards

- **Actions**: https://github.com/aureo-labs/brepflow/actions
- **Security**: https://github.com/aureo-labs/brepflow/security
- **Insights**: https://github.com/aureo-labs/brepflow/pulse

## Recent Changes

### 2025-11-17 - Initial Implementation + Week 1 Monitoring

- ✅ Created Docker testing workflow (`test-docker.yml`)
- ✅ Created PR quality gate workflow (`pr-quality-gate.yml`)
- ✅ Achieved 100% test pass rate (185/185 tests)
- ✅ Implemented Docker layer caching
- ✅ Added automated quality gates
- ✅ Created comprehensive documentation
- ✅ **Week 1**: Added monitoring dashboard (`ci-monitor.sh`)
- ✅ **Week 1**: Added health check script (`ci-health-check.sh`)
- ✅ **Week 1**: Added cache manager (`ci-cache-manager.sh`)
- ✅ **Week 1**: Added GitHub Actions status badges to README
- ✅ **Week 1**: Optional Slack notification integration

## Future Enhancements

### Planned Features

- [ ] Coverage badges in README
- [ ] Slack notifications on failures
- [ ] Automated dependency updates (Dependabot)
- [ ] Performance regression testing
- [ ] Matrix testing (Node.js versions)
- [ ] Incremental testing (affected packages only)

## Contributing

When making CI/CD changes:

1. **Test locally first**: Verify workflow changes work
2. **Document changes**: Update relevant documentation
3. **Monitor impact**: Check performance after changes
4. **Get review**: CI/CD changes need team review

## Resources

### External Documentation

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Buildx Cache](https://docs.docker.com/build/cache/)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
- [Playwright Testing](https://playwright.dev/)

### Internal Documentation

- [Architecture](../technical/ARCHITECTURE.md)
- [Testing Strategy](../testing/)
- [Development Setup](../development/SETUP.md)
- [Contributing Guide](../development/CONTRIBUTING.md)

---

**Last Updated**: 2025-11-17  
**Status**: Production Ready ✅  
**Maintainers**: DevOps Team
