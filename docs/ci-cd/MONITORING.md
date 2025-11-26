# CI/CD Monitoring Guide

Comprehensive guide for monitoring and maintaining Sim4D's CI/CD infrastructure.

## Overview

This guide covers monitoring tools, health checks, and maintenance procedures to ensure optimal CI/CD performance.

## Monitoring Tools

### 1. CI Monitor Dashboard (`scripts/ci-monitor.sh`)

Real-time workflow status and performance metrics.

#### Usage

```bash
# Show workflow status (default)
./scripts/ci-monitor.sh status

# Show performance metrics
./scripts/ci-monitor.sh metrics

# Check Docker cache
./scripts/ci-monitor.sh cache

# Continuous monitoring (30s refresh)
./scripts/ci-monitor.sh watch

# Help
./scripts/ci-monitor.sh help
```

#### Output Examples

**Status View:**

```
════════════════════════════════════════════════════════════════
           Sim4D CI/CD Monitoring Dashboard
════════════════════════════════════════════════════════════════

📊 Docker Testing
────────────────────────────────────────────────────────────────
  ✅ Run #12345 - 2025-11-17 14:30
     Title: feat(engine): add WASM worker pooling
  ✅ Run #12344 - 2025-11-17 13:15
     Title: fix(viewport): resolve memory leak

📈 Overall Success Rate (Last 7 days)
────────────────────────────────────────────────────────────────
  ✅ test-docker: 98% (49/50)
  ✅ pr-quality-gate: 100% (25/25)
  ✅ ci: 96% (48/50)
```

**Metrics View:**

```
⏱️  Performance Metrics: Docker Testing
────────────────────────────────────────────────────────────────
  Average Duration: 18 minutes 45 seconds
  Min Duration: 15 minutes 30 seconds
  Max Duration: 22 minutes 10 seconds
  Sample Size: 10 runs
```

### 2. Health Check Script (`scripts/ci-health-check.sh`)

Validates CI/CD infrastructure configuration.

#### Usage

```bash
# Run health check
./scripts/ci-health-check.sh
```

#### Checks Performed

1. ✅ **Workflow files exist** - All required .yml files present
2. ✅ **Docker files exist** - Dockerfiles and compose files present
3. ✅ **Scripts executable** - Required scripts have +x permissions
4. ✅ **Documentation complete** - All guides available
5. ✅ **GitHub CLI configured** - gh command available and authenticated
6. ✅ **Docker available** - Docker daemon running
7. ✅ **Node.js and pnpm** - Development tools installed
8. ✅ **Workflow syntax valid** - No YAML errors
9. ✅ **Cache configured** - BuildKit cache enabled
10. ✅ **Performance targets** - Workflows meet time targets

#### Output Example

```
════════════════════════════════════════════════════════════════
                     Health Check Summary
════════════════════════════════════════════════════════════════
✅ All checks passed! CI/CD infrastructure is healthy.
```

### 3. Cache Manager (`scripts/ci-cache-manager.sh`)

Monitor and manage Docker build cache.

#### Usage

```bash
# Show cache status
./scripts/ci-cache-manager.sh status

# Detailed cache information
./scripts/ci-cache-manager.sh details

# Interactive cleanup
./scripts/ci-cache-manager.sh prune

# Safe automatic cleanup
./scripts/ci-cache-manager.sh prune-safe

# Aggressive cleanup (all cache)
./scripts/ci-cache-manager.sh prune-all

# Optimize cache (remove dangling)
./scripts/ci-cache-manager.sh optimize

# Comprehensive health check
./scripts/ci-cache-manager.sh health
```

#### Cache Health Thresholds

| Status      | Cache Size | Action           |
| ----------- | ---------- | ---------------- |
| ✅ Healthy  | < 10 GB    | No action needed |
| ⚠️ Warning  | 10-20 GB   | Consider cleanup |
| 🚨 Critical | > 20 GB    | Cleanup required |

## Monitoring Best Practices

### Daily Checks

**Morning Routine** (5 minutes):

```bash
# 1. Check workflow status
./scripts/ci-monitor.sh status

# 2. Review any failures
gh run list --workflow=test-docker.yml --limit=5

# 3. Check cache health
./scripts/ci-cache-manager.sh health
```

### Weekly Maintenance

**Weekly Review** (15 minutes):

```bash
# 1. Performance metrics
./scripts/ci-monitor.sh metrics

# 2. Success rate trends
./scripts/ci-monitor.sh status

# 3. Cache optimization
./scripts/ci-cache-manager.sh optimize

# 4. Health check
./scripts/ci-health-check.sh
```

### Monthly Audit

**Monthly Audit** (30 minutes):

```bash
# 1. Full health check
./scripts/ci-health-check.sh

# 2. Review last 30 days
gh run list --workflow=test-docker.yml --limit=100

# 3. Cache cleanup
./scripts/ci-cache-manager.sh prune-safe

# 4. Update documentation if needed
# Review docs/ci-cd/ for accuracy
```

## Key Performance Indicators (KPIs)

### Success Metrics

| Metric                          | Target  | Good    | Warning    | Critical |
| ------------------------------- | ------- | ------- | ---------- | -------- |
| **Success Rate**                | 100%    | >95%    | 90-95%     | <90%     |
| **Mean Time to Detect (MTTD)**  | <5 min  | <10 min | 10-20 min  | >20 min  |
| **Mean Time to Resolve (MTTR)** | <30 min | <60 min | 60-120 min | >120 min |
| **Build Duration**              | <20 min | <25 min | 25-30 min  | >30 min  |

### Performance Metrics

| Workflow          | Target  | Current | Status |
| ----------------- | ------- | ------- | ------ |
| Docker Unit Tests | <5 min  | ~3 min  | ✅     |
| Docker WASM Tests | <10 min | ~8 min  | ✅     |
| Docker E2E Tests  | <15 min | ~12 min | ✅     |
| Total Pipeline    | <25 min | ~20 min | ✅     |

### Cache Metrics

| Metric             | Target  | Description                     |
| ------------------ | ------- | ------------------------------- |
| **Cache Hit Rate** | >80%    | % of builds using cached layers |
| **Cache Size**     | <10 GB  | Total Docker build cache size   |
| **Cache Age**      | <7 days | Average age of cached layers    |

## Alerting Strategy

### Critical Alerts (Immediate Action)

**Trigger**: Workflow failure on main branch
**Action**: Investigate immediately, fix within 1 hour
**Notification**: Slack (if configured)

```bash
# Quick investigation
gh run view <run-id> --log
gh run download <run-id>
```

### Warning Alerts (Action Within 24h)

**Trigger**:

- Success rate drops below 95%
- Build time exceeds 30 minutes
- Cache size exceeds 15 GB

**Action**: Review and optimize within 24 hours

### Info Alerts (Monitor)

**Trigger**:

- PR with failing checks
- Performance trending up
- Cache size approaching 10 GB

**Action**: Monitor, no immediate action required

## Troubleshooting Workflows

### Workflow Failures

**1. Identify the failure:**

```bash
# List recent failures
gh run list --workflow=test-docker.yml --json conclusion,status,displayTitle \
  --jq '.[] | select(.conclusion == "failure")'

# View specific run
gh run view <run-id> --log
```

**2. Download artifacts:**

```bash
# Download all artifacts
gh run download <run-id>

# Review test results
cat test-results/*.json
cat playwright-report/index.html
```

**3. Reproduce locally:**

```bash
# Run same tests in Docker
./scripts/docker-dev.sh test:all
```

**4. Fix and verify:**

```bash
# Make fixes
# ...

# Run tests
./scripts/docker-dev.sh test:all

# Push and monitor
git push origin <branch>
gh run watch
```

### Cache Issues

**Symptom**: Slow builds despite warm cache

**Investigation:**

```bash
# Check cache health
./scripts/ci-cache-manager.sh health

# View cache details
./scripts/ci-cache-manager.sh details

# Check for fragmentation
docker buildx du
```

**Solution:**

```bash
# Optimize cache
./scripts/ci-cache-manager.sh optimize

# If needed, prune and rebuild
./scripts/ci-cache-manager.sh prune-safe

# Verify improvement
./scripts/ci-monitor.sh metrics
```

### Performance Degradation

**Symptom**: Build times increasing over time

**Investigation:**

```bash
# Check trend
./scripts/ci-monitor.sh metrics

# Review cache
./scripts/ci-cache-manager.sh status

# Check for large changes
gh pr list --json additions,deletions
```

**Common Causes:**

1. **Cache miss**: Dependencies changed, rebuild needed
2. **Large PRs**: Many files changed, more to test
3. **Infrastructure**: GitHub Actions runner issues
4. **Resource contention**: Multiple workflows running

**Solutions:**

1. **Optimize cache**: `./scripts/ci-cache-manager.sh optimize`
2. **Split PRs**: Smaller PRs = faster tests
3. **Retry**: Sometimes infrastructure issue resolves itself
4. **Review Dockerfile**: Optimize layer ordering

## Advanced Monitoring

### Custom Metrics Collection

**Create metrics collector:**

```bash
#!/bin/bash
# scripts/collect-metrics.sh

gh run list --workflow=test-docker.yml --limit=100 --json createdAt,updatedAt,conclusion |
  jq -r '.[] | select(.conclusion == "success") |
    [((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)), .createdAt] |
    @tsv' > metrics/build-times.tsv
```

**Analyze trends:**

```bash
# Average build time last 7 days
awk '{sum+=$1; count++} END {print sum/count/60 " minutes"}' metrics/build-times.tsv
```

### Integration with External Tools

**Prometheus/Grafana:**

- Export metrics from GitHub Actions
- Visualize trends over time
- Set up alerting based on thresholds

**DataDog/New Relic:**

- CI/CD monitoring dashboards
- Performance trends
- Anomaly detection

### GitHub Actions Insights

**View in GitHub:**

1. Go to repository **Actions** tab
2. Click **Insights** (if available)
3. Review:
   - Workflow runs over time
   - Success/failure rates
   - Duration trends
   - Usage statistics

## Maintenance Schedule

### Daily (Automated)

- ✅ Workflow execution monitoring (automatic)
- ✅ Failure notifications (Slack if configured)
- ✅ Performance tracking (GitHub Actions)

### Weekly (5-10 minutes)

- [ ] Review success rates
- [ ] Check performance metrics
- [ ] Optimize Docker cache if needed
- [ ] Review PR quality gate effectiveness

### Monthly (30-60 minutes)

- [ ] Full health check
- [ ] Performance trend analysis
- [ ] Cache cleanup and optimization
- [ ] Documentation review and updates
- [ ] Dependency updates (Dependabot)

### Quarterly (2-4 hours)

- [ ] Comprehensive CI/CD audit
- [ ] Performance optimization review
- [ ] Security audit (dependencies, actions)
- [ ] Workflow optimization opportunities
- [ ] Team feedback and improvements

## References

- **Scripts**: `scripts/ci-monitor.sh`, `scripts/ci-health-check.sh`, `scripts/ci-cache-manager.sh`
- **Workflows**: `.github/workflows/`
- **Documentation**: [DOCKER_CI_CD.md](./DOCKER_CI_CD.md), [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **GitHub Actions Docs**: https://docs.github.com/en/actions

---

**Last Updated**: 2025-11-17  
**Version**: 1.0.0
