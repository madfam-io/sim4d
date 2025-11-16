# 🎯 Comprehensive User Journey Integration Tests

Real-time browser-based validation of complete user workflows with visual regression, performance tracking, and error handling.

## 📋 Test Overview

### Test Suite: `user-journeys.test.ts`

**Total Journeys**: 10 comprehensive scenarios + 3 monitoring tests

**Execution Time**: ~5-10 minutes for complete suite

**Coverage**: End-to-end user workflows from first visit to production export

---

## 🚀 Quick Start

### Prerequisites

1. **Development Server Running**

   ```bash
   pnpm --filter @brepflow/studio run dev
   # Server: http://localhost:5173
   ```

2. **Collaboration Server Running** (if testing session sharing)

   ```bash
   ./scripts/docker-dev.sh up
   # OR
   node packages/collaboration/dist/server/standalone-server.js
   # Server: http://localhost:8080
   ```

3. **Dependencies Installed**
   ```bash
   pnpm install
   npx playwright install chromium
   ```

### Run Tests

#### Full Test Suite (All 13 Tests)

```bash
npx playwright test --config=playwright.user-journeys.config.ts --project=chromium
```

#### With Headed Browser (Watch Tests Execute)

```bash
npx playwright test --config=playwright.user-journeys.config.ts --project=chromium --headed
```

#### Single Test Journey

```bash
npx playwright test --config=playwright.user-journeys.config.ts --project=chromium --grep "Journey 1"
```

#### With UI Mode (Interactive Debugging)

```bash
npx playwright test --config=playwright.user-journeys.config.ts --ui
```

---

## 📊 Test Journeys

### Journey 1: First-Time User → Create Geometry → Export

**Purpose**: Validates complete new user workflow
**Duration**: ~60s
**Steps**:

1. Navigate to application
2. Verify session auto-creation
3. Verify UI components loaded
4. Add Box node
5. Export STEP file
6. Export STL file
7. Test share functionality

**Assertions**:

- Session URL pattern: `/session/[uuid]`
- ReactFlow canvas visible
- SessionControls component visible
- STEP download successful
- STL download successful
- Share button shows "Copied!" feedback

---

### Journey 2: Parametric Design → Modify → Re-export

**Purpose**: Validates parameter modification and re-export workflow
**Duration**: ~45s
**Steps**:

1. Create new session
2. Add parametric Box node
3. Modify parameter values
4. Export modified geometry

**Assertions**:

- Parameter controls functional
- Modified geometry exports successfully
- File size > 0 bytes

---

### Journey 3: Collaboration → Share → Join Session

**Purpose**: Validates session sharing and multi-user access
**Duration**: ~30s
**Steps**:

1. User 1 creates session
2. User 1 adds content
3. User 1 copies share link
4. User 2 joins via shared URL
5. User 2 sees same session ID

**Assertions**:

- Session URL matches across users
- Content visible to both users
- Same session state maintained

---

### Journey 4: Complex Workflow → Multiple Nodes → Boolean Operations

**Purpose**: Validates complex multi-node geometry workflows
**Duration**: ~120s
**Steps**:

1. Create new session
2. Add Box, Cylinder, and Union nodes
3. Connect nodes to create complex geometry
4. Export final result

**Assertions**:

- Multiple nodes added successfully
- Complex graph evaluates
- Export completes within timeout

---

### Journey 5: Error Handling → Invalid Operations → Recovery

**Purpose**: Validates error handling and recovery mechanisms
**Duration**: ~45s
**Steps**:

1. Attempt export with empty graph
2. Verify error message or prevention
3. Add valid geometry
4. Retry export successfully

**Assertions**:

- Empty graph export handled gracefully
- Recovery workflow successful
- User-friendly error messages

---

### Journey 6: Performance → Large Graph → Real-time Updates

**Purpose**: Validates performance with larger graphs
**Duration**: ~180s
**Steps**:

1. Add 5+ nodes sequentially
2. Measure node addition time
3. Export geometry
4. Measure export time

**Assertions**:

- Node addition responsive (<2s per node)
- Export completes in <30s
- No memory leaks
- UI remains responsive

---

### Journey 7: Session Persistence → Refresh → State Recovery

**Purpose**: Validates session persistence across page refreshes
**Duration**: ~30s
**Steps**:

1. Create session with content
2. Note node count
3. Refresh page
4. Verify session and content

**Assertions**:

- Session URL preserved after refresh
- Session state handled appropriately (MVP: may reset)

---

### Journey 8: Multi-Format Export → STEP + STL → Validation

**Purpose**: Validates multiple export formats with file validation
**Duration**: ~60s
**Steps**:

1. Create exportable geometry
2. Export STEP format
3. Verify STEP file size > 0
4. Export STL format
5. Verify STL file size > 0

**Assertions**:

- Both formats export successfully
- File sizes are non-zero
- Filenames follow convention

---

### Journey 9: Accessibility → Keyboard Navigation → Screen Reader

**Purpose**: Validates keyboard navigation and accessibility features
**Duration**: ~30s
**Steps**:

1. Navigate with keyboard (Tab)
2. Check focus indicators
3. Verify ARIA labels
4. Check semantic heading structure

**Assertions**:

- Keyboard focus works
- ARIA labels present
- Semantic HTML structure

---

### Journey 10: End-to-End Production Workflow

**Purpose**: Complete production workflow simulation
**Duration**: ~120s
**Steps**:

1. App load (measure performance)
2. Session creation
3. Design creation (Box + Cylinder)
4. Parameter modification
5. STEP export
6. STL export
7. Share link generation

**Assertions**:

- App loads in <5s
- All operations complete successfully
- Performance metrics acceptable
- Complete workflow validated

---

## 📈 Monitoring Tests

### Monitor: Network Performance & API Response Times

**Purpose**: Track API performance and response times
**Metrics**:

- API call count
- Average response time
- Status code distribution

**Assertions**:

- Average API response < 5s
- No 500 errors on critical endpoints

---

### Monitor: Memory Usage & Resource Cleanup

**Purpose**: Track memory consumption and detect leaks
**Metrics**:

- Initial JS heap size
- Final JS heap size
- Memory growth delta

**Assertions**:

- Memory growth < 100 MB for typical operations
- No exponential memory growth

---

### Monitor: Console Errors & Warnings

**Purpose**: Detect console errors and warnings during execution
**Metrics**:

- Error count
- Warning count
- Critical error classification

**Assertions**:

- Zero critical console errors
- Warnings documented and expected

---

## 📸 Visual Regression

### Screenshot Capture

All tests automatically capture screenshots at key milestones:

**Location**: `test-results/screenshots/`

**Naming Convention**: `{journey-name}-{step-number}-{description}-{timestamp}.png`

**Examples**:

- `journey1-01-landing-1731564123456.png`
- `journey1-02-ui-loaded-1731564125789.png`
- `journey1-03-box-added-1731564127012.png`

### Using Screenshots

1. **Visual Inspection**: Review screenshots for UI regressions
2. **Debugging**: Identify exact failure point
3. **Documentation**: Create user guides from screenshots
4. **Regression Testing**: Compare across test runs

---

## 🐛 Debugging Failed Tests

### View Test Results

```bash
# Open HTML report
npx playwright show-report playwright-report/user-journeys

# View JSON results
cat test-results/user-journeys-results.json | jq
```

### Debug Specific Test

```bash
# Run with debug mode
npx playwright test --config=playwright.user-journeys.config.ts --debug --grep "Journey 1"

# Run with trace viewer
npx playwright test --config=playwright.user-journeys.config.ts --trace on --grep "Journey 1"
npx playwright show-trace trace.zip
```

### Common Issues

#### 1. Session Creation Fails

**Symptom**: URL doesn't match `/session/[uuid]`
**Fix**: Verify useSession hook and routing configuration

#### 2. Export Downloads Fail

**Symptom**: Download timeout or 500 error
**Fix**:

- Check collaboration server is running
- Verify OCCT WASM is loaded
- Check browser console for errors

#### 3. Nodes Don't Appear

**Symptom**: addNode() returns false
**Fix**:

- Verify node palette implementation
- Check node registration
- Review console for component errors

---

## 🎨 Test Customization

### Add New Journey

```typescript
test('Journey 11: Your Custom Workflow', async ({ page }) => {
  test.setTimeout(TEST_TIMEOUT);

  console.log('🧪 Testing: Your custom workflow');

  await page.goto(BASE_URL);
  await waitForAppReady(page);

  // Your test steps
  await captureScreenshot(page, 'journey11-01-step1');

  // Assertions
  expect(something).toBeDefined();

  console.log('✅ Journey 11 Complete');
});
```

### Modify Timeouts

```typescript
// In playwright.user-journeys.config.ts
timeout: 60000, // Global test timeout
expect: {
  timeout: 15000, // Assertion timeout
},
```

### Add New Assertions

```typescript
// Performance assertion
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(5000);

// Visual assertion
await expect(page.locator('.my-element')).toBeVisible();

// Download assertion
const download = await page.waitForEvent('download');
expect(download.suggestedFilename()).toMatch(/\.step$/);
```

---

## 📊 CI/CD Integration

### GitHub Actions Example

```yaml
name: User Journey Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install chromium

      - name: Start dev server
        run: pnpm --filter @brepflow/studio run dev &

      - name: Run user journey tests
        run: npx playwright test --config=playwright.user-journeys.config.ts

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/user-journeys
```

---

## 🎯 Performance Benchmarks

### Target Metrics

| Metric           | Target  | Critical |
| ---------------- | ------- | -------- |
| App Load Time    | < 3s    | < 5s     |
| Session Creation | < 2s    | < 5s     |
| Node Addition    | < 1s    | < 2s     |
| STEP Export      | < 15s   | < 30s    |
| STL Export       | < 10s   | < 20s    |
| API Response     | < 2s    | < 5s     |
| Memory Growth    | < 50 MB | < 100 MB |

### Actual Measurements

Run tests and review console output for performance metrics:

```
✓ App loaded in 2456ms
✓ Export completed in 12345ms
✓ Performance acceptable (< 30s)
Average API response time: 1234ms
```

---

## 🔧 Maintenance

### Update Tests for New Features

1. Add new test journey for feature
2. Update existing journeys if UI changes
3. Add screenshots for new UI states
4. Update documentation

### Regular Review

- **Weekly**: Review test results and screenshots
- **Monthly**: Update benchmarks and timeouts
- **Quarterly**: Full test suite audit and optimization

---

## 📚 Additional Resources

- **Playwright Docs**: https://playwright.dev/docs/intro
- **BrepFlow Architecture**: docs/technical/ARCHITECTURE.md
- **Testing Strategy**: docs/development/TESTING.md
- **CI/CD Guide**: docs/deployment/CICD.md

---

## ✅ Test Checklist

Before releasing new features:

- [ ] All 10 user journeys pass
- [ ] All 3 monitoring tests pass
- [ ] Screenshots reviewed for visual regressions
- [ ] Performance metrics within targets
- [ ] Zero critical console errors
- [ ] Accessibility tests pass
- [ ] Multi-browser validation (Chrome + Firefox)
- [ ] Test documentation updated

---

**Last Updated**: 2025-11-13
**Test Suite Version**: 1.0.0
**Playwright Version**: 1.55.0
