# Collaboration Server Setup Guide

**Status**: Production-Ready with CSRF Protection
**Security**: OWASP A01:2021 Compliant (CSRF/CORS Hardening)
**Last Updated**: 2025-11-13

---

## Quick Start

### 1. Install Dependencies

```bash
pnpm add @sim4d/collaboration express express-session socket.io
pnpm add -D @types/express @types/express-session
```

### 2. Basic Server Setup

```typescript
// server.ts
import express from 'express';
import session from 'express-session';
import http from 'http';
import { CollaborationServer, setupAPIRoutes } from '@sim4d/collaboration/server';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Create collaboration server with CSRF protection
const collaborationServer = new CollaborationServer(server, {
  // REQUIRED: Specify allowed origins (NO wildcards!)
  corsOrigin: [
    'http://localhost:5173', // Development
    'https://studio.sim4d.com', // Production
  ],

  // REQUIRED: CSRF token secret (use environment variable)
  csrfTokenSecret: process.env.CSRF_TOKEN_SECRET || 'change-me-in-production',

  // Optional: Rate limiting configuration
  enableRateLimiting: true,
  maxConnectionsPerIP: 10, // 10 connections per IP per hour

  // Optional: Connection limits
  maxConnectionsPerDocument: 100,
  operationHistoryLimit: 1000,
  presenceTimeout: 30000, // 30 seconds
});

// Setup API routes for CSRF token generation
setupAPIRoutes(app, collaborationServer, {
  basePath: '/api/collaboration',
  enableSessions: true,
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Collaboration server listening on port ${PORT}`);
});
```

---

## Environment Variables

Create a `.env` file:

```bash
# Development
NODE_ENV=development
PORT=8080
SESSION_SECRET=dev-session-secret-change-in-production
CSRF_TOKEN_SECRET=dev-csrf-secret-change-in-production

# Production
# NODE_ENV=production
# PORT=8080
# SESSION_SECRET=<strong-random-secret>  # Generate with: openssl rand -base64 32
# CSRF_TOKEN_SECRET=<strong-random-secret>  # Generate with: openssl rand -base64 32
```

**⚠️ IMPORTANT**: Never commit secrets to version control. Use a secrets manager in production (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## Frontend Integration

### 1. Configure API Base URL

```typescript
// apps/studio/src/api/collaboration.ts
import { collaborationAPI } from './collaboration';

// Update server URL based on environment
const serverUrl =
  process.env.NODE_ENV === 'production' ? 'https://collab.sim4d.com' : 'http://localhost:8080';

collaborationAPI.updateConfig({ serverUrl });
```

### 2. Use Collaboration Hook

```typescript
// apps/studio/src/components/YourComponent.tsx
import { useCollaboration } from '../hooks/useCollaboration';

function YourComponent() {
  const [collaborationState, collaborationActions] = useCollaboration();

  const handleJoinSession = async () => {
    try {
      const user = {
        id: 'user-123',
        name: 'John Doe',
        color: '#3B82F6',
      };

      // WebSocket connection with CSRF token is automatic
      await collaborationActions.joinSession('session-id', user);

      console.log('Joined session:', collaborationState.sessionId);
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  return (
    <div>
      <button onClick={handleJoinSession}>Join Collaboration</button>
      {collaborationState.isConnected && <p>Connected!</p>}
    </div>
  );
}
```

---

## Security Configuration

### Production Checklist

- [ ] **Strong Secrets**: Generate cryptographically secure secrets

  ```bash
  # Generate strong secrets
  openssl rand -base64 32  # SESSION_SECRET
  openssl rand -base64 32  # CSRF_TOKEN_SECRET
  ```

- [ ] **HTTPS Only**: Enable `secure` flag on cookies

  ```typescript
  cookie: {
    secure: true, // HTTPS only
    sameSite: 'strict',
    httpOnly: true,
  }
  ```

- [ ] **Explicit Origins**: No wildcard CORS

  ```typescript
  corsOrigin: ['https://studio.sim4d.com', 'https://app.sim4d.com'];
  // NEVER: corsOrigin: '*'
  ```

- [ ] **Rate Limiting**: Prevent DoS attacks

  ```typescript
  enableRateLimiting: true,
  maxConnectionsPerIP: 10, // Adjust based on usage patterns
  ```

- [ ] **Input Validation**: All WebSocket messages validated
- [ ] **Monitoring**: Log all security events
- [ ] **Secrets Management**: Use vault (AWS Secrets Manager, etc.)

### Development vs Production

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const collaborationServer = new CollaborationServer(server, {
  corsOrigin: isDevelopment
    ? ['http://localhost:5173', 'http://localhost:3000']
    : ['https://studio.sim4d.com'],

  csrfTokenSecret: process.env.CSRF_TOKEN_SECRET!,

  enableRateLimiting: !isDevelopment, // Disabled in dev for easier testing

  maxConnectionsPerIP: isDevelopment ? 100 : 10,
});
```

---

## Testing

### Test CSRF Protection

```bash
# Terminal 1: Start server
pnpm run server

# Terminal 2: Test endpoints
# 1. Get CSRF token
curl -v http://localhost:8080/api/collaboration/csrf-token \
  -H "Cookie: connect.sid=<session-cookie>" \
  --cookie-jar cookies.txt

# 2. Try to connect without token (should fail)
# See console logs for "Invalid CSRF token" error

# 3. Connect with valid token (should succeed)
# Use the csrfToken from step 1 in WebSocket connection
```

### Test Rate Limiting

```bash
# Send 15 rapid connection attempts from same IP
for i in {1..15}; do
  curl http://localhost:8080/api/collaboration/health &
done

# Should see "Rate limit exceeded" after 10th attempt
```

### Test Multiple Origins

```typescript
// Test different origins in frontend
const origins = [
  'http://localhost:5173', // Should work (whitelisted)
  'http://localhost:3000', // Should work (whitelisted)
  'http://malicious.com', // Should fail (not whitelisted)
];

for (const origin of origins) {
  const response = await fetch(`${origin}/api/collaboration/csrf-token`, {
    credentials: 'include',
  });
  console.log(`${origin}:`, response.status);
}
```

---

## Monitoring & Logging

### Security Events

All security events are logged to console. Integrate with your logging system:

```typescript
// Example: Winston logger integration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Replace console.warn with logger
console.warn = (message, ...args) => {
  if (message.includes('SECURITY:')) {
    logger.warn({ message, ...args, timestamp: new Date().toISOString() });
  }
};
```

### Key Metrics to Monitor

- **CSRF Failures**: `Invalid or missing CSRF token`
- **Rate Limiting**: `Rate limit exceeded for IP:`
- **Unauthorized Origins**: `Blocked CORS from unauthorized origin:`
- **Connection Patterns**: Unusual spike in connections
- **Token Refresh Rate**: Should be ~1/hour per active user

---

## Troubleshooting

### Issue: "CSRF token required"

**Cause**: Frontend not sending CSRF token
**Solution**: Ensure `useCollaboration` hook is properly initialized

```typescript
// Verify token is fetched
const { csrfToken } = await collaborationAPI.getCSRFToken();
console.log('Token:', csrfToken); // Should print token
```

### Issue: "Invalid or expired CSRF token"

**Cause**: Token expired (>1 hour old) or corrupted
**Solution**: Token auto-refreshes 5 minutes before expiration

```typescript
// Manual refresh if needed
await collaborationAPI.getCSRFToken(true); // force=true
```

### Issue: "Origin not allowed"

**Cause**: Client origin not in whitelist
**Solution**: Add origin to `corsOrigin` array

```typescript
corsOrigin: [
  'http://localhost:5173',
  'http://localhost:3000', // Add this
],
```

### Issue: "Rate limit exceeded"

**Cause**: Too many connections from single IP
**Solution**: Increase limit or implement user-based rate limiting

```typescript
maxConnectionsPerIP: 50, // Increase from default 10
```

---

## Advanced Configuration

### Custom CSRF Token Storage

```typescript
import Redis from 'ioredis';

const redis = new Redis();

// Store tokens in Redis instead of memory
app.get('/api/collaboration/csrf-token', async (req, res) => {
  const sessionId = req.session.id || generateSessionId();
  const csrfToken = collaborationServer.generateCSRFToken(sessionId);

  // Store in Redis with 1-hour expiration
  await redis.setex(`csrf:${sessionId}`, 3600, csrfToken);

  res.json({ csrfToken, sessionId });
});
```

### Load Balancing

```typescript
// Use Redis adapter for Socket.IO across multiple servers
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Custom Authentication

```typescript
// Extend CSRF validation with additional auth
import { requireCSRFToken } from '@sim4d/collaboration/server';

const customAuth = async (req, res, next) => {
  // 1. Verify CSRF token
  await requireCSRFToken(collaborationServer)(req, res, () => {});

  // 2. Verify user JWT
  const token = req.headers.authorization?.split(' ')[1];
  const user = await verifyJWT(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
};

app.post('/api/collaboration/join', customAuth, async (req, res) => {
  // Protected route with both CSRF and JWT auth
});
```

---

## Migration from Insecure Setup

If upgrading from an insecure collaboration server:

### 1. Update Server Code

```diff
const collaborationServer = new CollaborationServer(server, {
-  // OLD: No CSRF protection
+  corsOrigin: ['http://localhost:5173'], // REQUIRED
+  csrfTokenSecret: process.env.CSRF_TOKEN_SECRET, // REQUIRED
+  enableRateLimiting: true, // RECOMMENDED
});
```

### 2. Update Frontend

```diff
- // OLD: Direct WebSocket connection
- const socket = io('http://localhost:8080');

+ // NEW: Secure WebSocket with CSRF token (handled by hook)
+ const [state, actions] = useCollaboration();
+ await actions.joinSession(sessionId, user);
```

### 3. Test Migration

```bash
# 1. Start updated server
pnpm run server

# 2. Test old client (should fail)
# 3. Test new client (should succeed)
# 4. Monitor logs for security events
```

---

## Resources

- **OWASP CSRF Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- **Socket.IO Security**: https://socket.io/docs/v4/security/
- **Express Session Guide**: https://github.com/expressjs/session
- **Sim4D Security Audit**: `docs/reports/COMPREHENSIVE_AUDIT_2025-11-13.md`

---

**Contact**: security@sim4d.com
**Status**: Production-Ready
**Next Review**: After load testing (1 week)
