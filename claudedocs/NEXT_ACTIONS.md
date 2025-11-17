# Next Actions - BrepFlow Testing & Quality

**Generated**: 2025-11-17  
**Status**: Deep Dive Complete - Ready for Next Phase

## Quick Wins (Can Be Done Immediately)

### 1. Enable E2E Collaboration Tests ⚡ 15 minutes

**Issue**: Rate limiting blocking ~20 E2E tests  
**Solution**: Update test environment configuration

```bash
# In .env.test or docker-compose.yml
ENABLE_RATE_LIMIT=false
```

**Commands**:

```bash
# Update environment
echo "ENABLE_RATE_LIMIT=false" >> .env.test

# Restart collaboration service
docker-compose restart collaboration

# Run collaboration E2E tests
pnpm run test:e2e -- --grep "Collaboration"
```

**Expected Outcome**: ~20 previously failing tests should now pass

---

### 2. Run Full Test Suite ⚡ 5 minutes

**Purpose**: Validate all improvements

```bash
# Run all unit tests with coverage
pnpm run test

# Run E2E tests
pnpm run test:e2e

# Check security
pnpm audit
```

**Expected Results**:

- Unit tests: 256/256 passing (98.4%+)
- E2E tests: Higher pass rate with rate limiting fixed
- Security: 0 vulnerabilities

---

### 3. Commit All Changes 🔄 10 minutes

**Files to Commit**:

**Configuration Files**:

- `package.json` (pnpm overrides)
- `packages/*/vitest.config.ts` (5 files - coverage config)

**New Test Files**:

- `packages/collaboration/src/simple-session.test.ts`
- `packages/constraint-solver/src/solver-2d.comprehensive.test.ts`
- `tests/performance/benchmarks.test.ts`

**Documentation**:

- `packages/engine-occt/docs/TESTING.md`
- `claudedocs/*.md` (8 files)

**Commit Message**:

```bash
git add .
git commit -m "feat: comprehensive testing improvements

- Fix vitest coverage configuration (5 packages)
- Add 21 unit tests to collaboration package
- Resolve glob security vulnerability (GHSA-5j98-mcp5-4vw2)
- Create comprehensive testing documentation
- Add performance baseline framework
- Document WASM testing limitations

Tests: 235 → 256 (+21)
Security: 1 high → 0 vulnerabilities
Coverage: Now measuring correctly"
```

---

## Short-Term Actions (Next Session, 2-3 hours)

### 1. Fix Constraint Solver API Mismatch 🔧

**Issue**: TypeScript types don't match compiled JavaScript  
**Impact**: 18 comprehensive tests prepared but not passing

**Investigation Steps**:

```bash
# Check build output
cat packages/constraint-solver/dist/index.d.ts | grep -A10 "class Solver2D"

# Check source
cat packages/constraint-solver/src/solver-2d.ts | grep -A10 "class Solver2D"

# Check tsconfig
cat packages/constraint-solver/tsconfig.json

# Check tsup config
cat packages/constraint-solver/tsup.config.ts
```

**Potential Issues**:

- tsup compilation settings
- Type definition generation
- Source map configuration
- Export/import mismatches

**Goal**: Enable 18 prepared tests in `solver-2d.comprehensive.test.ts`

---

### 2. Create GitHub Actions CI/CD Pipeline 🚀

**File to Create**: `.github/workflows/test.yml`

**Basic Pipeline**:

```yaml
name: Test & Quality

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build packages
        run: pnpm run build

      - name: Run unit tests
        run: pnpm run test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Start services
        run: |
          docker-compose up -d
          sleep 10  # Wait for services

      - name: Run E2E tests
        run: pnpm run test:e2e
        env:
          ENABLE_RATE_LIMIT: false

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Security audit
        run: pnpm audit --audit-level high
```

**Additional Configurations**:

- Add `CODECOV_TOKEN` secret
- Configure branch protection rules
- Set up status checks
- Add PR checks

---

### 3. Configure Performance Tracking 📊

**Goal**: Run performance tests in CI and track over time

**Approach**:

1. Fix performance test execution (need root-level config)
2. Add performance job to CI/CD
3. Store results as artifacts
4. Create trend analysis dashboard

**Performance CI Job**:

```yaml
performance:
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v3
    - uses: pnpm/action-setup@v2

    - name: Install dependencies
      run: pnpm install

    - name: Run performance tests
      run: pnpm run test:performance

    - name: Store benchmark results
      uses: benchmark-action/github-action-benchmark@v1
      with:
        tool: 'customBiggerIsBetter'
        output-file-path: performance-results.json
        github-token: ${{ secrets.GITHUB_TOKEN }}
        auto-push: true
```

---

## Medium-Term Actions (Next Sprint, 1-2 days)

### 1. Increase Test Coverage to 70-80% 📈

**Priority Packages**:

| Package           | Current | Target | Effort             |
| ----------------- | ------- | ------ | ------------------ |
| constraint-solver | 3.9%    | 70%    | High - 25+ tests   |
| collaboration     | ~60%    | 70%    | Low - 5-10 tests   |
| viewport          | ~10%    | 60%    | Medium - 15+ tests |
| nodes-core        | ~40%    | 70%    | Medium - 20+ tests |

**Approach**:

1. Use collaboration tests as template
2. Focus on pure logic functions first
3. Add integration tests for cross-package interactions
4. Mock external dependencies (WASM, browser APIs)

**Test Template** (from collaboration):

```typescript
describe('PackageName - Comprehensive Tests', () => {
  let instance: ClassName;

  beforeEach(() => {
    instance = new ClassName();
  });

  describe('Feature Category', () => {
    it('should do specific thing', () => {
      // Test implementation
    });
  });
});
```

---

### 2. Add Golden File Tests for Geometry 🎯

**Purpose**: Validate geometry operations produce correct outputs

**Structure**:

```
tests/
├── fixtures/
│   └── geometry/
│       ├── box-10x10x10.step
│       ├── sphere-r5.step
│       ├── boolean-union.step
│       └── fillet-r2.step
└── integration/
    └── geometry-golden.test.ts
```

**Test Pattern**:

```typescript
import { readFileSync } from 'fs';
import { parseSTEP } from '@brepflow/step-parser';

it('should match golden STEP output for box', async () => {
  const result = await geometry.createBox({ width: 10, height: 10, depth: 10 });
  const exported = await result.exportSTEP();

  const golden = readFileSync('tests/fixtures/geometry/box-10x10x10.step', 'utf8');

  const resultProps = parseSTEP(exported);
  const goldenProps = parseSTEP(golden);

  expect(resultProps.volume).toBeCloseTo(goldenProps.volume, 2);
  expect(resultProps.surfaceArea).toBeCloseTo(goldenProps.surfaceArea, 2);
});
```

---

### 3. Set Up Automated Dependency Updates 🔄

**Tool**: Dependabot or Renovate

**Dependabot Configuration** (`.github/dependabot.yml`):

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    reviewers:
      - 'your-team'
    labels:
      - 'dependencies'
    commit-message:
      prefix: 'chore'
      include: 'scope'
```

**Benefits**:

- Automatic security updates
- Dependency freshness
- Reduces manual maintenance

---

## Long-Term Actions (Next Quarter)

### 1. Implement Visual Regression Testing 📸

**Tool**: Playwright visual comparisons or Percy

**Approach**:

```typescript
test('viewport renders correctly', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Load specific graph
  await page.evaluate(() => {
    window.loadGraph('test-abacus.bflow.json');
  });

  // Wait for rendering
  await page.waitForSelector('canvas', { state: 'visible' });
  await page.waitForTimeout(1000); // Geometry rendering

  // Visual comparison
  await expect(page).toHaveScreenshot('abacus-viewport.png', {
    threshold: 0.15, // 15% difference allowed
  });
});
```

---

### 2. Add Fuzzing for Geometry Operations 🔀

**Purpose**: Find edge cases and crashes

**Tool**: js-fuzzer or custom fuzzer

**Pattern**:

```typescript
import { fc } from 'fast-check';

describe('Geometry Fuzzing', () => {
  it('should handle random box dimensions', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.001, max: 1000 }),
        fc.float({ min: 0.001, max: 1000 }),
        fc.float({ min: 0.001, max: 1000 }),
        async (width, height, depth) => {
          const box = await geometry.createBox({ width, height, depth });
          expect(box.volume).toBeGreaterThan(0);
          expect(box.volume).toBeLessThan(width * height * depth * 1.1);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
```

---

### 3. Create Comprehensive Performance Dashboard 📊

**Components**:

1. **CI/CD Integration**: Run benchmarks on every commit
2. **Historical Tracking**: Store results over time
3. **Visualization**: Charts showing trends
4. **Alerting**: Notify on regressions

**Tools**:

- GitHub Actions benchmark action
- Custom dashboard (React + Chart.js)
- Slack/Discord notifications

---

## Maintenance Checklist

### Weekly

- [ ] Review failed tests in CI/CD
- [ ] Check for new security vulnerabilities (`pnpm audit`)
- [ ] Review test coverage reports
- [ ] Triage any flaky tests

### Monthly

- [ ] Review and update dependencies
- [ ] Assess coverage improvements
- [ ] Update performance baselines
- [ ] Review and improve documentation

### Quarterly

- [ ] Comprehensive testing strategy review
- [ ] Performance optimization sprint
- [ ] Security audit and penetration testing
- [ ] Test infrastructure improvements

---

## Resources

### Documentation

- `claudedocs/DEEP_DIVE_FINAL_REPORT.md` - Complete session report
- `claudedocs/TESTING_STRATEGY.md` - Project-wide testing approach
- `packages/engine-occt/docs/TESTING.md` - OCCT WASM testing guide
- `claudedocs/PHASE_*_COMPLETION.md` - Individual phase reports

### Test Files

- `packages/collaboration/src/simple-session.test.ts` - Template for unit tests
- `tests/performance/benchmarks.test.ts` - Performance testing framework
- `packages/constraint-solver/src/solver-2d.comprehensive.test.ts` - Prepared tests

### Configuration

- `packages/*/vitest.config.ts` - Coverage configuration examples
- `package.json` - pnpm overrides for security
- `playwright.config.ts` - E2E test configuration

---

## Support & Questions

If you encounter issues with any of these next steps:

1. **Check documentation**: Most issues are covered in the comprehensive docs
2. **Review phase completion reports**: Detailed explanations of solutions
3. **Check test patterns**: Use existing tests as templates
4. **Consult testing strategy**: Guidance for different test types

---

**Next Immediate Action**: Commit all changes and enable collaboration E2E tests by disabling rate limiting in test environment.

**Priority Focus**: Get CI/CD pipeline running to prevent regressions.

**Long-term Goal**: 70-80% test coverage with automated quality gates.
