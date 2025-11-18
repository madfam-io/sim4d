# Security Policy

## Overview

BrepFlow takes security seriously. This document outlines our security architecture, threat model, and responsible disclosure process.

## Security Architecture

### Script Execution Sandbox (Horizon 0 - Complete ✅)

**Status**: Production-ready with isolated-vm true sandboxing

**Implementation**:

- **isolated-vm**: V8 isolate-based sandboxing for complete isolation
- **No eval() or Function()**: All unsafe code execution methods removed
- **Memory Limits**: Configurable per-script (default: 10MB)
- **CPU Timeouts**: Strict timeout enforcement (default: 5 seconds)
- **API Whitelisting**: Only explicitly allowed APIs accessible

**Protected Against**:

- ✅ Prototype pollution attacks
- ✅ Global scope access (process, require, import)
- ✅ Code injection via eval() or Function()
- ✅ Sandbox escape via constructor chain
- ✅ Memory exhaustion attacks
- ✅ CPU exhaustion (infinite loops)
- ✅ ReDoS (Regular Expression Denial of Service)

**Files**:

- `packages/engine-core/src/scripting/isolated-vm-executor.ts` - Secure executor
- `packages/engine-core/src/scripting/javascript-executor.ts` - Updated to delegate to isolated-vm
- `packages/engine-core/src/scripting/script-engine.ts` - Updated to use secure execution

### XSS Prevention (Horizon 0 - Complete ✅)

**Status**: Production-ready with React auto-escaping + CSP headers

**Last Audit**: 2025-11-18 - Zero XSS vulnerabilities found

BrepFlow is protected against XSS attacks through:

1. **React Auto-Escaping**: All user-generated content rendered via React JSX (automatic escaping)
2. **No Direct HTML Injection**: Zero uses of `dangerouslySetInnerHTML` in production code
3. **Controlled DOM Manipulation**: Limited `.innerHTML` usage (4 instances, all in test/tutorial files with static content only)
4. **Input Sanitization**: All form inputs validated and sanitized before processing
5. **CSP Headers**: Strict Content Security Policy prevents inline script execution

**Content Security Policy**:

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
worker-src 'self' blob:;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' https:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**HTML Sanitization**:

- **DOMPurify**: Industry-standard HTML sanitizer
- **Context-Aware**: Different sanitization rules for different contexts
- **Auto-Applied**: Sanitization applied to all user-generated content

**Protected Against**:

- ✅ Script injection (<script> tags)
- ✅ Event handler injection (onclick, onload, etc.)
- ✅ JavaScript protocol (javascript:)
- ✅ Data URL attacks (data:text/html)
- ✅ Iframe injection
- ✅ SVG-based XSS

**Files**:

- `packages/types/src/sanitization.ts` - Sanitization utilities
- `apps/studio/vite.config.ts` - CSP headers configuration
- `apps/studio/public/_headers` - Production CSP headers

### WASM Security

**SharedArrayBuffer Isolation**:

- **COOP**: Cross-Origin-Opener-Policy: same-origin
- **COEP**: Cross-Origin-Embedder-Policy: require-corp
- **Worker Isolation**: WASM runs in dedicated Web Workers
- **Memory Safety**: WASM provides memory-safe execution

**Protected Against**:

- ✅ Spectre/Meltdown timing attacks (via COOP/COEP)
- ✅ Cross-origin data leakage
- ✅ Worker-to-main-thread attacks

### CSRF Protection

**Current Status**: Implemented in collaboration features

**Mechanism**:

- Token-based CSRF protection
- SameSite cookies
- Origin validation

**Files**:

- `packages/collaboration/src/csrf-protection.ts`

### Rate Limiting

**Current Status**: Implemented for API endpoints

**Mechanism**:

- Per-IP rate limiting
- Per-user rate limiting
- Adaptive throttling

**Files**:

- `packages/collaboration/src/rate-limiter.ts`

## Threat Model

### In-Scope Threats

1. **Code Injection**
   - Script injection via user nodes
   - Prototype pollution
   - Constructor chain attacks
   - **Status**: Protected ✅

2. **Cross-Site Scripting (XSS)**
   - Stored XSS via node metadata
   - Reflected XSS via URL parameters
   - DOM-based XSS
   - **Status**: Protected ✅

3. **Denial of Service**
   - Memory exhaustion
   - CPU exhaustion
   - ReDoS attacks
   - **Status**: Protected ✅

4. **Data Exfiltration**
   - Via malicious scripts
   - Via network requests
   - **Status**: Protected ✅

### Out-of-Scope Threats

- Physical access attacks
- Social engineering
- Supply chain attacks (to be addressed in Phase 1)
- Browser vulnerabilities (rely on browser security)

## Security Testing

### Automated Testing

**Unit Tests**: 20+ security-focused test cases

- Prototype pollution prevention
- Global scope access prevention
- eval()/Function() prevention
- Memory limit enforcement
- Timeout enforcement
- XSS vector neutralization

**Files**:

- `packages/engine-core/src/scripting/__tests__/security.test.ts`
- `packages/types/src/__tests__/sanitization.test.ts`

### Manual Testing

**Penetration Testing Checklist**:

- [ ] Prototype pollution attempts
- [ ] Sandbox escape via constructor chain
- [ ] Global scope access (process, require, import)
- [ ] DOM access (document, window, localStorage)
- [ ] Memory exhaustion
- [ ] CPU exhaustion (infinite loops)
- [ ] ReDoS attacks
- [ ] XSS via node metadata
- [ ] XSS via template content
- [ ] XSS via console logs
- [ ] CSP bypass attempts
- [ ] Worker message injection

### Security Audits

**Last Audit**: 2025-11-17 (Horizon 0 Security Migration)

**Next Scheduled**: Q1 2026

## Responsible Disclosure

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, please email security@brepflow.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Triage**: Within 3 business days
- **Fix Timeline**: Varies by severity
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: 60 days

### Bug Bounty

**Status**: Not currently offered

We plan to launch a bug bounty program in 2026 after public release.

## Security Best Practices for Developers

### Custom Node Development

**DO**:

- ✅ Use ctx.script.getInput() for inputs
- ✅ Use ctx.script.setOutput() for outputs
- ✅ Use Math operations safely
- ✅ Validate all inputs
- ✅ Handle errors gracefully

**DON'T**:

- ❌ Use eval() or Function()
- ❌ Access **proto** or prototype
- ❌ Use constructor property
- ❌ Create infinite loops
- ❌ Allocate excessive memory
- ❌ Access global scope (process, window, etc.)

**Example Safe Script**:

```javascript
async function evaluate(ctx, inputs, params) {
  // ✅ Safe: Use whitelisted APIs
  const distance = ctx.script.getParameter('distance', 10);
  const shape = ctx.script.getInput('shape');

  // ✅ Safe: Math operations
  const scaledDistance = Math.max(0, distance * 2);

  // ✅ Safe: Geometry API
  const result = await ctx.geom.invoke('MAKE_EXTRUDE', {
    face: shape,
    distance: scaledDistance,
  });

  // ✅ Safe: Set output
  ctx.script.setOutput('result', result);

  return { result };
}
```

**Example Unsafe Script** (Will be rejected):

```javascript
// ❌ UNSAFE: eval() usage
eval('console.log("malicious code")');

// ❌ UNSAFE: Function() constructor
const fn = new Function('return process.env');

// ❌ UNSAFE: Prototype pollution
Object.prototype.polluted = true;

// ❌ UNSAFE: Constructor access
({}).constructor('return this')();

// ❌ UNSAFE: Infinite loop
while (true) {}
```

### Template Development

**DO**:

- ✅ Sanitize all metadata fields
- ✅ Limit description length
- ✅ Validate tag inputs
- ✅ Use plain text for names

**DON'T**:

- ❌ Include HTML in node names
- ❌ Include links in descriptions
- ❌ Use excessive formatting

### UI Development

**DO**:

- ✅ Use sanitizeHTML() for all user content
- ✅ Use sanitizeText() for plain text display
- ✅ Validate URLs before rendering links
- ✅ Apply CSP-compliant styles

**DON'T**:

- ❌ Use dangerouslySetInnerHTML
- ❌ Render unsanitized user input
- ❌ Include inline event handlers
- ❌ Use javascript: URLs

## Security Headers

### Development Server

Headers configured in `apps/studio/vite.config.ts`:

- Content-Security-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Embedder-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Production Deployment

Headers configured in `apps/studio/public/_headers`:

- All development headers
- Strict-Transport-Security
- X-DNS-Prefetch-Control

## Compliance

### Data Protection

- **GDPR**: No personal data stored in scripts or templates
- **COPPA**: N/A (not targeted at children)
- **CCPA**: User data handling in collaboration features

### Security Standards

- **OWASP Top 10**: Addressed
- **CWE/SANS Top 25**: Addressed
- **NIST**: Baseline security controls implemented

## Security Roadmap

### Phase 0: Horizon 0 Security (Complete ✅)

- ✅ Remove unsafe eval() usage
- ✅ Implement isolated-vm sandboxing
- ✅ Add CSP headers
- ✅ Implement HTML sanitization
- ✅ Comprehensive security tests

### Phase 1: Supply Chain Security (Planned)

- [ ] Dependency scanning (Snyk/Dependabot)
- [ ] SBOM (Software Bill of Materials)
- [ ] Signed releases (GPG)
- [ ] Plugin signature verification

### Phase 2: Advanced Security (Planned)

- [ ] Security monitoring/logging
- [ ] Intrusion detection
- [ ] Runtime security checks
- [ ] Automated penetration testing

### Phase 3: Certification (Planned)

- [ ] SOC 2 Type II
- [ ] ISO 27001
- [ ] Penetration testing report
- [ ] Bug bounty program

## Resources

### Documentation

- [Architecture Overview](docs/technical/ARCHITECTURE.md)
- [API Security](docs/api/SECURITY_API.md)
- [Script Engine Security](packages/engine-core/src/scripting/README.md)

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [isolated-vm Security](https://github.com/laverdet/isolated-vm#security)
- [DOMPurify](https://github.com/cure53/DOMPurify)

## Changelog

### 2025-11-17 - Horizon 0 Security Migration

- ✅ Removed all unsafe eval() and Function() usage
- ✅ Implemented isolated-vm true sandboxing
- ✅ Added comprehensive CSP headers
- ✅ Implemented HTML sanitization with DOMPurify
- ✅ Added 20+ security-focused test cases
- ✅ Updated security documentation

### Previous

- 2025-11-14: Initial CSRF protection
- 2025-11-14: Rate limiting implementation
- 2025-11-13: COOP/COEP headers for WASM

---

**Last Updated**: 2025-11-17  
**Security Contact**: security@brepflow.com  
**PGP Key**: [To be added]
