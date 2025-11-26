# Rate Limiting Fix for E2E Tests

**Date**: 2025-11-17  
**Status**: ✅ Successfully Fixed

## Problem

E2E collaboration tests were timing out after 1.0-1.1 minutes due to rate limiting blocking rapid test connections.

**Evidence from Docker logs**:

```
SECURITY: Rate limit exceeded for IP: ::ffff:192.168.65.1
```

## Root Cause

The collaboration server had rate limiting hardcoded to `true` in `standalone-server.ts`:

```typescript
enableRateLimiting: true,
maxConnectionsPerIP: 10,
```

This was blocking Playwright E2E tests which create multiple rapid connections to test collaboration features.

## Solution

### 1. Made Rate Limiting Configurable

**File**: `packages/collaboration/src/server/standalone-server.ts`

Changed from hardcoded values to environment variables:

```typescript
const collaborationServer = new CollaborationServer(httpServer, {
  corsOrigin: CORS_ORIGIN,
  csrfTokenSecret: process.env.CSRF_TOKEN_SECRET,
  enableRateLimiting: process.env.ENABLE_RATE_LIMIT !== 'false', // Default: enabled, disable for tests
  maxConnectionsPerIP: parseInt(process.env.MAX_CONNECTIONS_PER_IP || '10', 10),
});
```

### 2. Created Test Environment Configuration

**File**: `.env.test`

```bash
# Collaboration Server - Disable rate limiting for E2E tests
ENABLE_RATE_LIMIT=false
MAX_CONNECTIONS_PER_IP=100

# Other test environment settings
NODE_ENV=test
COLLAB_PORT=8080
CORS_ORIGIN=http://localhost:5173
```

### 3. Updated Docker Compose

**File**: `docker-compose.yml`

Added environment variable pass-through with defaults:

```yaml
collaboration:
  environment:
    - NODE_ENV=${NODE_ENV:-development}
    - ENABLE_RATE_LIMIT=${ENABLE_RATE_LIMIT:-true}
    - MAX_CONNECTIONS_PER_IP=${MAX_CONNECTIONS_PER_IP:-10}
    - CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:5173}
  volumes:
    - ./packages/collaboration/dist:/app/packages/collaboration/dist
```

**Key Changes**:

- Environment variables use `${VAR:-default}` syntax for defaults
- Volume mount for `dist/` directory allows hot-reloading of built code
- Rate limiting **enabled by default** for production safety
- Test environment explicitly sets `ENABLE_RATE_LIMIT=false`

### 4. Playwright Configuration

**File**: `playwright.config.ts`

Already configured to load `.env.test`:

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env.test') });
```

## Usage

### Running E2E Tests with Rate Limiting Disabled

```bash
# Start services with test environment
docker-compose --env-file .env.test up -d

# Run E2E tests
pnpm run test:e2e
```

### Production Mode (Rate Limiting Enabled)

```bash
# Start services normally (uses defaults)
docker-compose up -d

# Or explicitly enable
ENABLE_RATE_LIMIT=true docker-compose up -d
```

## Verification

### 1. Environment Variables Loaded Correctly

```bash
$ docker exec sim4d-collaboration-1 printenv | grep -E "ENABLE_RATE|MAX_CONN"
ENABLE_RATE_LIMIT=false
MAX_CONNECTIONS_PER_IP=100
```

### 2. No Rate Limiting Messages in Logs

```bash
$ docker logs sim4d-collaboration-1 --tail 30 | grep -i "rate\|SECURITY"
(no output = success)
```

### 3. Server Starts Successfully

```bash
$ curl http://localhost:8080/health
{"status":"healthy","timestamp":"2025-11-17T22:06:41.108Z","version":"0.1.0"}
```

## Test Results

**Rate Limiting Fix**: ✅ Successful

- No more "Rate limit exceeded" messages in logs
- Tests can create multiple rapid connections
- One collaboration test passed (test #27)

**Remaining Test Issues**: ⚠️ Tests still timing out

- Issue is **not** rate limiting (confirmed fixed)
- Tests wait for CSRF token request that may not be implemented
- Tests expect `window.collaborationAPI` which doesn't exist
- App uses React `CollaborationProvider`, not global API object

## Next Steps

1. ✅ **Rate limiting fixed** - can be closed
2. ⏳ **E2E test implementation issues** - separate task:
   - Review collaboration test expectations
   - Update tests to match actual React implementation
   - Add proper CSRF token flow to app if needed
   - Consider if tests need to be rewritten or app updated

## Files Modified

1. `packages/collaboration/src/server/standalone-server.ts` - Environment variable configuration
2. `.env.test` - Test environment with rate limiting disabled
3. `docker-compose.yml` - Environment variable pass-through + volume mount
4. `packages/collaboration/dist/server/standalone-server.cjs` - Rebuilt with changes

## Security Considerations

- ✅ Rate limiting **enabled by default** for production safety
- ✅ Tests explicitly disable via `ENABLE_RATE_LIMIT=false`
- ✅ Docker Compose defaults preserve security (`${VAR:-true}`)
- ✅ No security compromise in production deployments

## Performance Impact

- **Production**: No change (rate limiting still enabled)
- **Tests**: Significant improvement - no more timeout failures due to rate limiting
- **Development**: Configurable per environment needs

---

**Conclusion**: Rate limiting fix successfully implemented and verified. E2E tests can now create multiple rapid connections without being blocked. Remaining test failures are due to test implementation issues, not rate limiting.
