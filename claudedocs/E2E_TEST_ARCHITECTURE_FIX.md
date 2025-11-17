# E2E Test Architecture Fix Plan

**Date**: 2025-11-17  
**Status**: Implementation Plan

## Problem Analysis

### Root Cause

E2E collaboration tests have **architectural mismatch** between test expectations and actual React implementation:

1. **Tests expect**: `window.collaborationAPI` global object
2. **App provides**: React `CollaborationProvider` context with hooks
3. **Test approach**: Programmatic API calls via `page.evaluate()`
4. **Correct approach**: UI-driven testing via user interactions

### Evidence from Codebase

**App Architecture** (`apps/studio/src/App.tsx:694`):

```typescript
<CollaborationProvider
  options={{
    serverUrl: collaborationServerUrl,
    documentId: sessionId,
    user: { id, name, color },
    ...
  }}
  apiBaseUrl={collaborationApiUrl}
  sessionId={sessionId}
  onOperation={(operation) => {}}
  onConflict={(conflict) => {}}
  onError={(error) => {}}
  onCSRFError={(error) => {}}
>
  <AppContent />
</CollaborationProvider>
```

**Test Expectations** (`tests/e2e/collaboration-csrf.test.ts:65`):

```typescript
// ❌ WRONG: React hooks can't be called in page.evaluate()
await page.evaluate(async () => {
  const { useCollaboration } = await import('./hooks/useCollaboration');
  const [, actions] = useCollaboration(); // ❌ Can't call hooks outside React
});
```

**Test Comments Acknowledge Problem**:

```typescript
// FIXME: Test assumes window.collaborationAPI exists but it doesn't - needs rewrite
// FIXME: Cannot import React hooks in page.evaluate() - architectural limitation
```

## Solution: Option A (Recommended)

### Update Tests to Match React Architecture

**Rationale**:

- App architecture is **correct** (React patterns, context providers)
- Tests should validate **user-facing behavior**, not internal APIs
- E2E tests should interact via **UI elements** (buttons, forms, etc.)
- More realistic testing approach (tests what users actually do)

### Implementation Strategy

#### 1. CSRF Token Test (Already Working)

```typescript
test('should fetch CSRF token on app load', async ({ page }) => {
  const csrfTokenRequest = page.waitForRequest((request) =>
    request.url().includes('/api/collaboration/csrf-token')
  );

  await page.reload();
  const request = await csrfTokenRequest;
  expect(request.url()).toContain('/api/collaboration/csrf-token');

  const response = await request.response();
  expect(response?.status()).toBe(200);
});
```

**Status**: ✅ This test is correctly written and should work once collaboration server issues are resolved

#### 2. Session Creation Test (Needs Rewrite)

**Current (❌ Wrong)**:

```typescript
await page.evaluate(async () => {
  const { useCollaboration } = await import('./hooks/useCollaboration');
  const [, actions] = useCollaboration();
  await actions.createSession(user);
});
```

**Fixed (✅ Correct)**:

```typescript
test('should create collaboration session via UI', async ({ page }) => {
  // Wait for session controls to load
  await page.waitForSelector('[data-testid="session-controls"]');

  // Click "Enable Collaboration" button
  await page.click('[data-testid="enable-collaboration-btn"]');

  // Verify WebSocket connection established
  const wsConnected = page.waitForEvent('websocket', (ws) => {
    return ws.url().includes('localhost:8080');
  });

  // Verify UI shows connected state
  await expect(page.locator('[data-testid="collaboration-status"]')).toHaveText(/Connected|Active/);

  // Verify session ID is displayed
  await expect(page.locator('[data-testid="session-id"]')).not.toBeEmpty();
});
```

#### 3. Presence Broadcast Test (UI-Driven)

**Fixed (✅ Correct)**:

```typescript
test('should broadcast cursor position via mouse movement', async ({ page }) => {
  await page.click('[data-testid="enable-collaboration-btn"]');
  await page.waitForSelector('[data-testid="collaboration-status"]:has-text("Connected")');

  // Listen for WebSocket frames with cursor data
  let cursorBroadcast = false;
  page.on('websocket', (ws) => {
    ws.on('framesent', (event) => {
      if (typeof event.payload === 'string' && event.payload.includes('cursor')) {
        cursorBroadcast = true;
      }
    });
  });

  // Move mouse over node editor
  const canvas = page.locator('canvas').first();
  await canvas.hover({ position: { x: 100, y: 100 } });
  await canvas.hover({ position: { x: 200, y: 200 } });

  // Wait for debounced broadcast
  await page.waitForTimeout(100);

  expect(cursorBroadcast).toBe(true);
});
```

#### 4. Selection Broadcast Test (UI-Driven)

**Fixed (✅ Correct)**:

```typescript
test('should broadcast selection when node is selected', async ({ page }) => {
  await page.click('[data-testid="enable-collaboration-btn"]');

  let selectionBroadcast = false;
  page.on('websocket', (ws) => {
    ws.on('framesent', (event) => {
      if (typeof event.payload === 'string' && event.payload.includes('selection')) {
        selectionBroadcast = true;
      }
    });
  });

  // Create a node first
  await page.click('[data-testid="node-palette-box"]');
  await page.click('canvas', { position: { x: 300, y: 300 } });

  // Click the node to select it
  const node = page.locator('.react-flow__node').first();
  await node.click();

  await page.waitForTimeout(100);
  expect(selectionBroadcast).toBe(true);
});
```

### Required UI Changes

To make tests work, the app needs **data-testid** attributes:

**`apps/studio/src/components/SessionControls.tsx`**:

```typescript
<div data-testid="session-controls">
  <button
    data-testid="enable-collaboration-btn"
    onClick={handleEnableCollaboration}
  >
    Enable Collaboration
  </button>

  <span data-testid="collaboration-status">
    {isConnected ? 'Connected' : 'Disconnected'}
  </span>

  <span data-testid="session-id">
    {sessionId}
  </span>
</div>
```

**`apps/studio/src/components/node-palette/EnhancedNodePalette.tsx`**:

```typescript
<div
  data-testid={`node-palette-${nodeType.toLowerCase()}`}
  draggable
  onDragStart={(e) => onNodeDragStart(e, nodeType)}
>
  {nodeType}
</div>
```

## Alternative Solutions (Not Recommended)

### Option B: Add Global API Bridge

**Approach**: Create `window.collaborationAPI` that wraps React context

**Why Not**:

- Adds unnecessary API surface
- Creates architectural debt
- Tests still wouldn't match user behavior
- Maintenance burden (keep bridge in sync)

### Option C: Keep Tests Skipped

**Approach**: Leave tests as `.skip()` and document limitations

**Why Not**:

- No E2E coverage for critical collaboration features
- Tests become stale and unmaintained
- Doesn't solve the architectural mismatch

## Implementation Checklist

### Phase 1: Add Test IDs to UI Components (30 min)

- [ ] Add `data-testid` to SessionControls component
- [ ] Add `data-testid` to collaboration status indicators
- [ ] Add `data-testid` to node palette items
- [ ] Add `data-testid` to canvas/editor elements

### Phase 2: Rewrite E2E Tests (2-3 hours)

- [ ] Rewrite session creation test (UI-driven)
- [ ] Rewrite cursor broadcast test (mouse movement)
- [ ] Rewrite selection broadcast test (node click)
- [ ] Rewrite session leave test (button click)
- [ ] Remove all `.skip()` markers from working tests

### Phase 3: Add New E2E Tests (1-2 hours)

- [ ] Multi-user collaboration simulation
- [ ] Conflict resolution UI flow
- [ ] Network interruption recovery
- [ ] CSRF token expiration handling

### Phase 4: Documentation (30 min)

- [ ] Update E2E testing guidelines
- [ ] Document UI interaction patterns
- [ ] Create test helper functions for common flows

## Success Criteria

### Test Pass Criteria

- [ ] All collaboration E2E tests passing (0 skipped)
- [ ] No `page.evaluate()` with React hooks
- [ ] No assumptions about global API objects
- [ ] Tests interact via UI elements only

### Code Quality Criteria

- [ ] All test helpers extracted to `tests/e2e/helpers/`
- [ ] Consistent `data-testid` naming convention
- [ ] Proper wait strategies (no arbitrary timeouts)
- [ ] Clear test descriptions matching user stories

## Timeline

**Immediate (Today)**:

- Phase 1: Add test IDs (30 min)
- Start Phase 2: Rewrite first 2 tests (1 hour)

**Tomorrow**:

- Complete Phase 2: Rewrite remaining tests (1-2 hours)
- Phase 3: Add new tests (1-2 hours)

**Day 3**:

- Phase 4: Documentation (30 min)
- Full E2E test run verification

**Total Estimated Time**: 4-6 hours spread over 3 days

## References

- **App Architecture**: `apps/studio/src/App.tsx` (CollaborationProvider usage)
- **Collaboration Hook**: `apps/studio/src/hooks/useCollaboration.ts`
- **Session Controls**: `apps/studio/src/components/SessionControls.tsx`
- **Current Tests**: `tests/e2e/collaboration-csrf.test.ts` (needs rewrite)
- **Playwright Docs**: https://playwright.dev/docs/test-assertions

---

**Status**: Ready for implementation. Starting with Phase 1 (add test IDs) and Phase 2 (rewrite tests).
