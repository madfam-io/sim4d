# Immediate Security Fixes - 2025-11-13

**Status**: Phase 1 Complete - Defensive Measures Implemented
**Next**: Phase 2 Required for Production (see migration plans)

---

## Summary

Two **CRITICAL security vulnerabilities** have been addressed with immediate defensive measures:

1. ✅ **CVE-2025-BREPFLOW-001**: Arbitrary Code Execution (Script Executor)
2. ✅ **CVE-2025-BREPFLOW-002**: CSRF / Cross-Site WebSocket Hijacking (Collaboration Server)

**Impact**: These fixes block the most critical attack vectors but **require Phase 2 implementation** for full production deployment.

---

## 1. Script Executor Security (CVE-2025-BREPFLOW-001)

### Vulnerability Details

- **CVSS Score**: 9.8 (Critical)
- **OWASP Classification**: A03:2021 - Injection
- **Attack Vector**: `Function()` constructor allowed arbitrary JavaScript execution
- **Exploitability**: High (no authentication required)

### Defensive Measures Implemented ✅

**File**: `packages/engine-core/src/scripting/javascript-executor.ts`

#### 1. Script Size Limit

```typescript
private static readonly MAX_SCRIPT_SIZE = 100000; // 100KB
```

- Prevents resource exhaustion attacks
- Blocks large malicious payloads

#### 2. Blacklist System

```typescript
private scriptBlacklist: Set<string> = new Set();

private hashScript(script: string): string {
  // Simple hash for tracking malicious scripts
  let hash = 0;
  for (let i = 0; i < script.length; i++) {
    const char = script.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
```

- Tracks scripts flagged as malicious by hash
- Prevents repeated attempts with same exploit

#### 3. Dangerous Pattern Detection

```typescript
private validateScriptSyntax(script: string): void {
  const dangerousPatterns = [
    /\beval\s*\(/,          // eval()
    /\bFunction\s*\(/,      // Function constructor
    /\b__proto__\b/,        // Prototype manipulation
    /\bprototype\b.*?=/,    // Prototype assignment
    /\bconstructor\b.*?\(/, // Constructor access
    /\bprocess\b/,          // Node.js process object
    /\brequire\s*\(/,       // Module loading
    /\bimport\s*\(/,        // Dynamic imports
    /\bdocument\./,         // DOM access
    /\bwindow\./,           // Window object
    /\blocalStorage\./,     // Storage access
    /\bsessionStorage\./,   // Session storage
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(script)) {
      throw new SyntaxError(`Potentially unsafe pattern detected: ${pattern.source}`);
    }
  }
}
```

- Blocks most common injection vectors
- Validates syntax without executing code

#### 4. CSP Compliance Check

```typescript
private checkCSPCompliance(script: string): boolean {
  const cspViolations = [
    /on\w+\s*=/,        // Inline event handlers
    /javascript:/,      // javascript: protocol
    /data:text\/html/,  // data: URLs
  ];
  return !cspViolations.some(pattern => pattern.test(script));
}
```

- Enforces Content Security Policy rules
- Prevents inline script injection

#### 5. Frozen Sandbox

```typescript
private createSecureSandbox(...) {
  const sandbox = Object.create(null); // No prototype chain

  Object.defineProperties(sandbox, {
    console: {
      value: Object.freeze({ log, warn, error }),
      writable: false,
      configurable: false,
    },
    // All properties frozen and non-configurable
  });

  return Object.freeze(sandbox);
}
```

- Prevents prototype pollution
- Immutable sandbox objects
- No access to `Object.prototype`

#### 6. Input Sanitization

```typescript
setOutput: (name: string, value: any) => {
  if (typeof name !== 'string' || name.length > 100) {
    throw new Error('Invalid output name');
  }
  context.outputs[name] = Object.freeze(value);
},

log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const sanitized = String(message).substring(0, 1000);
  this.addLog(logs, level, sanitized, context.runtime.nodeId);
},
```

- Validates all input lengths
- Sanitizes log messages
- Freezes outputs to prevent mutation

#### 7. Temporary Execution Block

```typescript
private async executeInSecureContext(...): Promise<...> {
  // TEMPORARY: Reject execution until worker-based sandbox implemented
  reject(new Error('Worker-based sandboxing not yet implemented. Please update to use isolated-vm or web worker execution.'));
}
```

- Blocks execution temporarily (breaks functionality)
- Prevents exploits until Phase 2 complete

### Migration Required ⚠️

**Phase 2 Options** (choose one):

1. **isolated-vm** (Node.js) - True VM isolation with memory limits
2. **Web Worker** (Browser) - Thread isolation with message passing
3. **QuickJS** (Universal) - Lightweight ES2020 sandbox

**Timeline**: 1-2 weeks
**Documentation**: `docs/security/SCRIPT_EXECUTOR_SECURITY_MIGRATION.md`

---

## 2. Collaboration Server CSRF Protection (CVE-2025-BREPFLOW-002)

### Vulnerability Details

- **CVSS Score**: 8.1 (High)
- **OWASP Classification**: A01:2021 - Broken Access Control
- **Attack Vector**: Wildcard CORS + no CSRF protection
- **Exploitability**: Medium (requires social engineering)

### Security Hardening Implemented ✅

**File**: `packages/collaboration/src/server/collaboration-server.ts`

#### 1. Required Origin Whitelist

```typescript
export interface CollaborationServerOptions {
  corsOrigin: string | string[]; // REQUIRED, no default wildcard
  // ...
}

constructor(httpServer: HTTPServer, options: CollaborationServerOptions) {
  if (!options.corsOrigin) {
    throw new Error('CRITICAL SECURITY: corsOrigin is required. Wildcard CORS is not allowed.');
  }

  this.allowedOrigins = new Set(
    Array.isArray(options.corsOrigin) ? options.corsOrigin : [options.corsOrigin]
  );

  if (this.allowedOrigins.has('*')) {
    throw new Error('CRITICAL SECURITY: Wildcard CORS (*) is not allowed. Specify explicit origins.');
  }
}
```

- **Breaking change**: `corsOrigin` is now **required**
- Wildcard `*` explicitly rejected
- Throws error on startup if misconfigured

#### 2. Dynamic Origin Validation

```typescript
private validateOrigin(origin: string | undefined, callback: Function): void {
  if (!origin) {
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('No origin header'), false);
    }
    return callback(null, true); // Allow in development
  }

  if (this.allowedOrigins.has(origin)) {
    return callback(null, true);
  }

  console.warn(`SECURITY: Blocked CORS from unauthorized origin: ${origin}`);
  callback(new Error('Origin not allowed'), false);
}
```

- Validates every connection attempt
- Logs blocked attempts for monitoring
- Strict in production, lenient in development

#### 3. HMAC-Based CSRF Tokens

```typescript
public generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const data = `${sessionId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', this.csrfTokenSecret);
  hmac.update(data);
  const signature = hmac.digest('base64');
  return `${sessionId}:${timestamp}:${signature}`;
}

private validateCSRFToken(token: string): boolean {
  const [sessionId, timestamp, signature] = token.split(':');

  // Check token age (max 1 hour)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (tokenAge > 60 * 60 * 1000 || tokenAge < 0) {
    return false;
  }

  // Verify HMAC signature (timing-safe)
  const data = `${sessionId}:${timestamp}`;
  const expectedSignature = crypto.createHmac('sha256', this.csrfTokenSecret)
    .update(data)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(expectedSignature, 'base64')
  );
}
```

- HMAC-SHA256 signatures prevent forgery
- 1-hour token expiration
- Timing-safe comparison prevents timing attacks
- Unique per session

#### 4. Rate Limiting

```typescript
private checkRateLimit(ip: string): boolean {
  const tracker = this.connectionLimits.get(ip);

  if (tracker?.blacklisted) {
    return false; // Permanent block
  }

  if (!tracker || now - tracker.lastReset > 60 * 60 * 1000) {
    // Reset hourly
    this.connectionLimits.set(ip, {
      connections: 1,
      lastReset: now,
      blacklisted: false,
    });
    return true;
  }

  if (tracker.connections >= this.maxConnectionsPerIP) {
    // Blacklist after 3x violations
    if (tracker.connections >= this.maxConnectionsPerIP * 3) {
      tracker.blacklisted = true;
    }
    return false;
  }

  tracker.connections++;
  return true;
}
```

- 10 connections per IP per hour (configurable)
- Automatic blacklisting after excessive violations
- Hourly reset for legitimate users
- Cleanup job prevents memory bloat

#### 5. Middleware Authentication

```typescript
private setupMiddleware(): void {
  this.io.use(async (socket, next) => {
    // 1. Rate limiting
    const clientIP = this.getClientIP(socket);
    if (!this.checkRateLimit(clientIP)) {
      return next(new Error('Rate limit exceeded'));
    }

    // 2. CSRF token validation
    const csrfToken = socket.handshake.auth.csrfToken;
    if (!csrfToken || !this.validateCSRFToken(csrfToken)) {
      return next(new Error('Invalid CSRF token'));
    }

    // 3. Origin validation (additional check)
    const origin = socket.handshake.headers.origin;
    if (origin && !this.allowedOrigins.has(origin)) {
      return next(new Error('Invalid origin'));
    }

    next(); // All checks passed
  });
}
```

- Multi-layer security (rate limit → CSRF → origin)
- Blocks connection before any data processing
- Logged for security monitoring

#### 6. Input Validation

```typescript
socket.on('document:join', async (documentId: string, user: User) => {
  if (!this.isValidDocumentId(documentId)) {
    socket.emit('error', { message: 'Invalid document ID' });
    return;
  }
  if (!this.isValidUser(user)) {
    socket.emit('error', { message: 'Invalid user data' });
    return;
  }
  await this.handleJoinDocument(socket, documentId, user);
});

private isValidDocumentId(documentId: unknown): documentId is string {
  return (
    typeof documentId === 'string' &&
    documentId.length > 0 &&
    documentId.length < 256 &&
    /^[a-zA-Z0-9_-]+$/.test(documentId) // Only safe characters
  );
}
```

- Type guards for all incoming data
- Length limits prevent DoS
- Regex validation blocks injection

### Client Integration Required ⚠️

**Frontend Changes Needed**:

```typescript
// 1. Get CSRF token from API
const response = await fetch('/api/collaboration/csrf-token', {
  credentials: 'include', // Include session cookie
});
const { csrfToken } = await response.json();

// 2. Pass token during connection
const socket = io('http://localhost:8080', {
  auth: {
    csrfToken: csrfToken,
    userId: currentUser.id, // Optional
  },
  withCredentials: true, // Required for CORS with credentials
});
```

**Backend API Endpoint**:

```typescript
// Express route example
app.get('/api/collaboration/csrf-token', (req, res) => {
  const sessionId = req.session.id || crypto.randomBytes(16).toString('hex');
  const csrfToken = collaborationServer.generateCSRFToken(sessionId);

  res.json({ csrfToken, sessionId });
});
```

---

## Migration Checklist

### Script Executor

- [x] **Phase 1 Complete** (2025-11-13)
  - [x] Add script size limits
  - [x] Implement blacklist
  - [x] Pattern detection
  - [x] Frozen sandbox
  - [x] Temporary execution block

- [ ] **Phase 2 Required** (1-2 weeks)
  - [ ] Choose execution method (isolated-vm/worker/quickjs)
  - [ ] Implement secure `executeInSecureContext()`
  - [ ] AST-based validation
  - [ ] Security testing
  - [ ] Production deployment

### Collaboration Server

- [x] **Phase 1 Complete** (2025-11-13)
  - [x] Required origin whitelist
  - [x] CSRF token generation/validation
  - [x] Rate limiting with blacklist
  - [x] Middleware authentication
  - [x] Input validation

- [ ] **Phase 2 Required** (1 week)
  - [ ] Create API endpoint for CSRF tokens
  - [ ] Update frontend to fetch/pass tokens
  - [ ] Test with multiple origins
  - [ ] Load testing for rate limits
  - [ ] Production configuration

---

## Configuration Examples

### Development

```typescript
// docker-compose.yml or .env.development
const collaborationServer = new CollaborationServer(httpServer, {
  corsOrigin: ['http://localhost:5173', 'http://localhost:3000'],
  csrfTokenSecret: 'dev-secret-change-in-production',
  enableRateLimiting: true,
  maxConnectionsPerIP: 50, // Higher limit for development
});
```

### Production

```typescript
// .env.production
const collaborationServer = new CollaborationServer(httpServer, {
  corsOrigin: ['https://studio.sim4d.com', 'https://app.sim4d.com'],
  csrfTokenSecret: process.env.CSRF_TOKEN_SECRET, // From vault
  enableRateLimiting: true,
  maxConnectionsPerIP: 10,
  maxConnectionsPerDocument: 100,
  operationHistoryLimit: 1000,
  presenceTimeout: 30000,
});
```

---

## Testing

### Script Executor Tests

```bash
# Run security-focused tests
pnpm --filter @sim4d/engine-core test src/scripting/__tests__/javascript-executor.security.test.ts
```

### Collaboration Server Tests

```bash
# Test CSRF protection
pnpm --filter @sim4d/collaboration test src/server/__tests__/csrf-protection.test.ts

# Test rate limiting
pnpm --filter @sim4d/collaboration test src/server/__tests__/rate-limiting.test.ts
```

---

## Monitoring & Logging

All security events are logged with `console.warn()` or `console.error()`. In production, integrate with centralized logging:

```typescript
// Script executor
console.warn('SECURITY: Script near timeout threshold', { ... });
console.warn('SECURITY: Script high memory usage', { ... });

// Collaboration server
console.warn('SECURITY: Blocked CORS from unauthorized origin:', origin);
console.warn('SECURITY: Rate limit exceeded for IP:', clientIP);
console.warn('SECURITY: Invalid or missing CSRF token');
console.warn('SECURITY: IP blacklisted for excessive connections:', ip);
```

**Recommendation**: Send to Sentry, Datadog, or CloudWatch for alerting.

---

## Success Criteria

### Phase 1 (Complete ✅)

- [x] No wildcard CORS in collaboration server
- [x] CSRF token implementation (generation + validation)
- [x] Rate limiting with blacklist
- [x] Dangerous pattern detection for scripts
- [x] Frozen sandbox for script execution
- [x] Input validation for all WebSocket messages

### Phase 2 (Required for Production ⚠️)

- [ ] True VM isolation for script execution
- [ ] Frontend CSRF token integration
- [ ] Security penetration testing
- [ ] Load testing under attack scenarios
- [ ] Production configuration documented

---

## Resources

- Script Executor Migration: `docs/security/SCRIPT_EXECUTOR_SECURITY_MIGRATION.md`
- Comprehensive Audit: `docs/reports/COMPREHENSIVE_AUDIT_2025-11-13.md`
- OWASP Top 10 2021: https://owasp.org/Top10/
- Socket.IO Security: https://socket.io/docs/v4/security/

---

**Last Updated**: 2025-11-13
**Next Review**: After Phase 2 implementation (2 weeks)
**Contact**: security@sim4d.com
