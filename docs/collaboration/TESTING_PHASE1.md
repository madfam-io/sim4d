# Phase 1 CSRF Testing Guide

**Status**: Testing Phase
**Date**: 2025-11-13
**Objective**: Validate CSRF protection implementation before production deployment

---

## Manual Testing Checklist

### 1. CSRF Token Generation ✓

**Test**: Verify token endpoint returns valid tokens

```bash
# Terminal 1: Start collaboration server (if not running)
cd packages/collaboration
pnpm run server

# Terminal 2: Test CSRF token endpoint
curl -v http://localhost:8080/api/collaboration/csrf-token \
  --cookie-jar cookies.txt

# Expected Response:
# {
#   "csrfToken": "valid-hmac-token-string",
#   "sessionId": "session-id-string"
# }
```

**Validation**:

- [ ] Status: 200 OK
- [ ] Response contains `csrfToken` field
- [ ] Response contains `sessionId` field
- [ ] Token is a valid HMAC-SHA256 string
- [ ] Session cookie set in response

---

### 2. Token Caching ✓

**Test**: Verify frontend caches tokens correctly

```typescript
// In browser console (http://localhost:5173)
import { collaborationAPI } from './api/collaboration';

// First call - should fetch from server
const token1 = await collaborationAPI.getCSRFToken();
console.log('Token 1:', token1);

// Second call - should return cached token
const token2 = await collaborationAPI.getCSRFToken();
console.log('Token 2:', token2);

// Tokens should be identical
console.log('Cached:', token1.csrfToken === token2.csrfToken);
```

**Validation**:

- [ ] First call makes network request
- [ ] Second call uses cached token (no network request)
- [ ] Both tokens are identical
- [ ] No unnecessary API calls

---

### 3. Token Auto-Refresh ✓

**Test**: Verify token refreshes before expiration

```typescript
// In browser console
import { collaborationAPI } from './api/collaboration';

// Enable auto-refresh and set short expiration for testing
collaborationAPI.updateConfig({ autoRefreshToken: true });

// Get initial token
const token1 = await collaborationAPI.getCSRFToken();
console.log('Initial token:', token1.csrfToken);

// Wait 55 minutes (5 min before expiration)
// For testing, you can modify the refresh threshold in collaboration.ts
// Change: const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // To: 5 * 1000 for 5 seconds

// After threshold, token should auto-refresh
setTimeout(async () => {
  const token2 = await collaborationAPI.getCSRFToken();
  console.log('Refreshed token:', token2.csrfToken);
  console.log('Token changed:', token1.csrfToken !== token2.csrfToken);
}, 6000);
```

**Validation**:

- [ ] Token refreshes before expiration
- [ ] Refresh happens in background
- [ ] New token different from old token
- [ ] No user-facing errors during refresh

---

### 4. WebSocket Connection with CSRF ✓

**Test**: Verify WebSocket includes CSRF token in auth

```typescript
// In browser console
import { SecureWebSocketClient } from './services/secure-websocket-client';

const client = new SecureWebSocketClient();
await client.connect();

// Check auth object
const socket = client.getSocket();
console.log('Auth object:', socket?.auth);
console.log('Has CSRF token:', !!socket?.auth?.csrfToken);
```

**Validation**:

- [ ] WebSocket connects successfully
- [ ] Auth object contains `csrfToken`
- [ ] Token is valid HMAC string
- [ ] Connection authenticated by server

---

### 5. Invalid Token Rejection ✓

**Test**: Verify server rejects invalid CSRF tokens

```bash
# Try to connect with invalid token
# Use browser DevTools to modify WebSocket auth
```

```typescript
// In browser console - manually create Socket.IO with bad token
import { io } from 'socket.io-client';

const badSocket = io('http://localhost:8080', {
  auth: { csrfToken: 'invalid-token-12345' },
  withCredentials: true,
});

badSocket.on('connect_error', (error) => {
  console.log('Expected error:', error.message);
});
```

**Validation**:

- [ ] Connection fails with invalid token
- [ ] Server logs security warning
- [ ] Error message mentions CSRF token
- [ ] Client handles error gracefully

---

### 6. Token Expiration Handling ✓

**Test**: Verify expired tokens trigger refresh

```typescript
// In browser console
import { collaborationAPI } from './api/collaboration';

// Get token
const token = await collaborationAPI.getCSRFToken();

// Manually expire token (modify expiresAt in devtools or wait 1 hour)
// Then try to use it
const newToken = await collaborationAPI.getCSRFToken();
console.log('Token refreshed:', token.csrfToken !== newToken.csrfToken);
```

**Validation**:

- [ ] Expired token detected
- [ ] New token fetched automatically
- [ ] WebSocket reconnects with new token
- [ ] No interruption to user experience

---

### 7. Rate Limiting ✓

**Test**: Verify rate limiting blocks excessive connections

```bash
# Send 15 rapid connection attempts from same IP
for i in {1..15}; do
  curl http://localhost:8080/api/collaboration/health &
done
wait

# Expected: First 10 succeed, remaining fail with 429
```

**Validation**:

- [ ] First 10 connections succeed
- [ ] Remaining connections blocked (429 Too Many Requests)
- [ ] Server logs rate limit violations
- [ ] IP added to blacklist after threshold

---

### 8. Multiple Origins ✓

**Test**: Verify CORS whitelist enforcement

```bash
# Test allowed origin
curl http://localhost:8080/api/collaboration/csrf-token \
  -H "Origin: http://localhost:5173" \
  --cookie-jar cookies.txt

# Test blocked origin
curl http://localhost:8080/api/collaboration/csrf-token \
  -H "Origin: http://malicious.com" \
  --cookie-jar cookies.txt
```

**Validation**:

- [ ] Whitelisted origins receive tokens
- [ ] Non-whitelisted origins blocked
- [ ] Server logs security warnings
- [ ] CORS headers correct

---

### 9. WebSocket Reconnection ✓

**Test**: Verify reconnection with fresh token

```typescript
// In browser console
import { SecureWebSocketClient } from './services/secure-websocket-client';

const client = new SecureWebSocketClient();
await client.connect();

// Simulate network interruption
const socket = client.getSocket();
socket?.disconnect();

// Wait for auto-reconnect
setTimeout(() => {
  console.log('Reconnected:', socket?.connected);
  console.log('New auth token:', socket?.auth?.csrfToken);
}, 3000);
```

**Validation**:

- [ ] WebSocket reconnects automatically
- [ ] New CSRF token fetched
- [ ] Reconnection succeeds
- [ ] No data loss during reconnection

---

### 10. Session Persistence ✓

**Test**: Verify session persists across page refreshes

```typescript
// In browser console (page 1)
import { collaborationAPI } from './api/collaboration';

const token1 = await collaborationAPI.getCSRFToken();
console.log('Token before refresh:', token1.csrfToken);
localStorage.setItem('test_token', token1.csrfToken);

// Refresh page (F5 or Cmd+R)
// Then in browser console (page 2)
const token2 = await collaborationAPI.getCSRFToken();
console.log('Token after refresh:', token2.csrfToken);
console.log('Session persisted:', localStorage.getItem('test_token') === token2.csrfToken);
```

**Validation**:

- [ ] Session ID persists across refreshes
- [ ] Same CSRF token returned for same session
- [ ] No unnecessary token regeneration
- [ ] User experience seamless

---

### 11. No Console Errors ✓

**Test**: Verify clean execution without errors

```typescript
// Open browser console, check for errors
// Navigate through collaboration features
// Join session, leave session, update cursor, etc.
```

**Validation**:

- [ ] No console errors during normal use
- [ ] No console warnings (except expected security logs)
- [ ] Network tab shows successful requests
- [ ] No failed CSRF token requests

---

### 12. Health Check Endpoint ✓

**Test**: Verify health endpoint works

```bash
curl http://localhost:8080/api/collaboration/health

# Expected Response:
# {
#   "status": "ok",
#   "uptime": 123.45,
#   "timestamp": 1699900000000
# }
```

**Validation**:

- [ ] Status: 200 OK
- [ ] Response contains `status`, `uptime`, `timestamp`
- [ ] Status is "ok"
- [ ] Uptime is positive number

---

## Integration Test Execution

### Prerequisites

```bash
# Ensure development environment is running
pnpm run dev  # Start Studio app (http://localhost:5173)

# In separate terminal, start collaboration server
cd packages/collaboration
pnpm run server  # Starts on http://localhost:8080
```

### Test Execution Order

1. **Basic Functionality**: Tests 1-2 (token generation, caching)
2. **Security Features**: Tests 5, 7-8 (invalid tokens, rate limiting, CORS)
3. **Lifecycle Management**: Tests 3-4, 6, 9-10 (refresh, WebSocket, expiration, reconnection, session)
4. **Quality Validation**: Tests 11-12 (no errors, health check)

### Success Criteria

**All tests must pass** before Phase 1 is considered production-ready:

- ✅ CSRF token generated and validated
- ✅ Token caching reduces API calls
- ✅ Auto-refresh works before expiration
- ✅ WebSocket authenticated with CSRF
- ✅ Invalid tokens rejected
- ✅ Expired tokens trigger refresh
- ✅ Rate limiting blocks attacks
- ✅ CORS whitelist enforced
- ✅ Reconnection works seamlessly
- ✅ Session persists across refreshes
- ✅ No console errors
- ✅ Health check operational

---

## Troubleshooting

### Issue: "CSRF token required"

**Cause**: Frontend not sending CSRF token
**Fix**: Verify `useCollaboration` hook initialized properly

```typescript
// Check in browser console
import { collaborationAPI } from './api/collaboration';
const token = await collaborationAPI.getCSRFToken();
console.log('Token:', token); // Should print valid token
```

### Issue: "Invalid or expired CSRF token"

**Cause**: Token expired or corrupted
**Fix**: Force token refresh

```typescript
await collaborationAPI.getCSRFToken(true); // force=true
```

### Issue: "Origin not allowed"

**Cause**: Client origin not in server whitelist
**Fix**: Add origin to `corsOrigin` array in server config

```typescript
// packages/collaboration/server.ts
const collaborationServer = new CollaborationServer(server, {
  corsOrigin: [
    'http://localhost:5173', // Add your origin
  ],
});
```

### Issue: "Rate limit exceeded"

**Cause**: Too many connections from single IP
**Fix**: Increase limit or wait for blacklist expiration (1 hour)

```typescript
const collaborationServer = new CollaborationServer(server, {
  maxConnectionsPerIP: 50, // Increase from default 10
});
```

### Issue: WebSocket disconnects immediately

**Cause**: Server rejecting connection (likely CSRF failure)
**Fix**: Check server logs for specific error, verify token generation

```bash
# Check server logs
cd packages/collaboration
pnpm run server  # Watch for security warnings
```

---

## Next Steps After Testing

### If All Tests Pass ✅

1. **Document Test Results**: Update this file with actual test execution results
2. **Create Production Deployment Plan**: Follow `SERVER_SETUP.md` for production config
3. **Security Review**: External security audit of CSRF implementation
4. **Load Testing**: Verify rate limiting under real load
5. **Phase 2 Implementation**: Begin Script Executor Phase 2 (isolated-vm sandboxing)

### If Tests Fail ❌

1. **Document Failures**: Record which tests failed and error messages
2. **Root Cause Analysis**: Investigate why tests failed
3. **Fix Issues**: Address failures before production deployment
4. **Re-test**: Run full test suite again after fixes
5. **Iterate**: Repeat until all tests pass

---

## Test Execution Log

**Tester**: **\*\***\_**\*\***
**Date**: **\*\***\_**\*\***
**Environment**: Development / Staging / Production

### Test Results

| Test # | Test Name               | Status     | Notes |
| ------ | ----------------------- | ---------- | ----- |
| 1      | CSRF Token Generation   | ⏳ Pending |       |
| 2      | Token Caching           | ⏳ Pending |       |
| 3      | Token Auto-Refresh      | ⏳ Pending |       |
| 4      | WebSocket with CSRF     | ⏳ Pending |       |
| 5      | Invalid Token Rejection | ⏳ Pending |       |
| 6      | Token Expiration        | ⏳ Pending |       |
| 7      | Rate Limiting           | ⏳ Pending |       |
| 8      | Multiple Origins        | ⏳ Pending |       |
| 9      | WebSocket Reconnection  | ⏳ Pending |       |
| 10     | Session Persistence     | ⏳ Pending |       |
| 11     | No Console Errors       | ⏳ Pending |       |
| 12     | Health Check            | ⏳ Pending |       |

### Overall Result

- **Tests Passed**: \_\_\_ / 12
- **Tests Failed**: \_\_\_ / 12
- **Production Ready**: Yes / No
- **Notes**: **\*\***\_\_\_**\*\***

---

**Last Updated**: 2025-11-13
**Status**: Ready for Testing
**Next Review**: After test execution
