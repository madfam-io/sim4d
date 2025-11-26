# Security Testing Guide

## Overview

Sim4D implements a comprehensive security testing strategy covering dependency vulnerabilities, secrets scanning, code analysis, worker sandboxing, and CSP enforcement.

## Quick Start

```bash
# Run full security audit
./scripts/security-audit.sh

# Run with HTML report generation
./scripts/security-audit.sh --report

# Quick scan (skip slow checks)
./scripts/security-audit.sh --quick

# CI mode (strict exit codes)
./scripts/security-audit.sh --ci
```

## Security Testing Components

### 1. Dependency Vulnerability Scanning

**Tool**: npm audit + check-security-vulnerabilities.js

**What it checks**:

- Critical/high/moderate/low severity vulnerabilities in dependencies
- Outdated packages with security fixes
- Transitive dependency vulnerabilities

**Running locally**:

```bash
# Basic audit
npm audit

# Generate detailed report
npm audit --json > security-reports/npm-audit.json

# Check against thresholds
node scripts/check-security-vulnerabilities.js

# Strict mode (zero tolerance)
node scripts/check-security-vulnerabilities.js --strict
```

**Thresholds**:

- Critical: 0 (zero tolerance)
- High: 0 (zero tolerance)
- Moderate: ≤ 5 (with review)
- Low: ≤ 20 (with monitoring)

**CI/CD Integration**:

```yaml
# .github/workflows/security-scan.yml
- name: Check vulnerabilities
  run: node scripts/check-security-vulnerabilities.js
  # Exits with code 1 on critical, 2 on high
```

**Remediation**:

```bash
# Automatic fixes
npm audit fix

# Force fixes (may cause breaking changes)
npm audit fix --force

# Manual review
npm audit
```

### 2. Secrets Scanning

**Tool**: Gitleaks

**What it checks**:

- API keys, tokens, passwords in code
- AWS/GCP/Azure credentials
- Private keys and certificates
- Database connection strings
- Generic high-entropy strings

**Running locally**:

```bash
# Full repository scan
gitleaks detect --no-git

# Generate report
gitleaks detect --no-git --report-path security-reports/gitleaks.json

# Check recent commits only
gitleaks detect --log-opts "-10"
```

**Installation**:

```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**CI/CD Integration**:

```yaml
# Runs automatically on every push/PR
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
```

**False Positives**:
Create `.gitleaksignore` for false positives:

```
# Example: Test fixtures with dummy secrets
tests/fixtures/dummy-api-key.json:12
examples/config-sample.ts:45
```

### 3. Static Application Security Testing (SAST)

**Tool**: CodeQL + ESLint Security Plugins

**What it checks**:

- SQL injection vulnerabilities
- XSS attack vectors
- Command injection risks
- Path traversal vulnerabilities
- Insecure cryptography
- eval() usage
- Unsafe regex patterns

**ESLint Security Rules**:

```json
{
  "plugins": ["security", "no-secrets"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-pseudoRandomBytes": "error",
    "no-secrets/no-secrets": "error"
  }
}
```

**Running locally**:

```bash
# Run ESLint with security rules
pnpm run lint

# Check security issues only
pnpm exec eslint . --ext .ts,.tsx --format json | jq '[.[] | .messages[] | select(.ruleId | test("security"))]'
```

**CodeQL Scanning**:

```bash
# Runs automatically in CI
# View results: https://github.com/<org>/sim4d/security/code-scanning
```

### 4. License Compliance

**Tool**: license-checker

**What it checks**:

- GPL/AGPL/LGPL licenses (copyleft)
- SSPL licenses (restrictive)
- Unlicensed packages
- License compatibility

**Running locally**:

```bash
# Check all licenses
npx license-checker --json

# Production dependencies only
npx license-checker --json --production

# Find problematic licenses
npx license-checker --json | jq -r 'to_entries[] | select(.value.licenses | tostring | test("GPL|AGPL|LGPL|SSPL")) | "\(.key): \(.value.licenses)"'
```

**Problematic Licenses**:

- **GPL/AGPL/LGPL**: Copyleft - requires open-sourcing derivative works
- **SSPL**: Server Side Public License - restrictive for SaaS
- **Unlicensed**: Unknown legal status

**Remediation**:

1. Find alternative packages with MIT/Apache/BSD licenses
2. Request dual-licensing from maintainers
3. Legal review for GPL compatibility

### 5. WASM Worker Sandboxing

**Tests**: `tests/security/wasm-sandboxing.test.ts`

**What it validates**:

- Workers isolated from main thread DOM
- No access to localStorage/sessionStorage
- Memory isolation (no shared state)
- Worker crashes don't affect main thread
- SharedArrayBuffer security (COOP/COEP headers)
- Resource limits (memory, timeout, worker count)

**Running tests**:

```bash
# Run security tests
pnpm --filter @sim4d/engine-core run test tests/security/

# Run specific sandboxing tests
pnpm --filter @sim4d/engine-core run test tests/security/wasm-sandboxing.test.ts
```

**Security Requirements**:

- COOP header: `Cross-Origin-Opener-Policy: same-origin`
- COEP header: `Cross-Origin-Embedder-Policy: require-corp`
- Max workers: 8 (based on CPU cores)
- Worker timeout: 30 seconds
- Max WASM heap: 2GB

### 6. Content Security Policy (CSP)

**Tests**: `tests/security/csp-enforcement.test.ts`

**What it enforces**:

- No inline scripts (except with nonce)
- No eval() or Function() constructor
- Restrict resource loading to trusted origins
- Worker sources limited to self and blob:
- WASM requires 'wasm-unsafe-eval' only

**CSP Policy**:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' blob:;
  style-src 'self' 'unsafe-inline';
  worker-src 'self' blob: data:;
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self' ws: wss:;
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

**Running tests**:

```bash
# Run CSP tests
pnpm run test tests/security/csp-enforcement.test.ts

# Check Vite CSP configuration
grep -A 5 "headers" apps/studio/vite.config.ts
```

**Development vs Production**:

- **Development**: `Content-Security-Policy-Report-Only` (log violations, don't block)
- **Production**: `Content-Security-Policy` (enforce, block violations)

### 7. Security Headers Validation

**Headers Checked**:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Content-Security-Policy: ...`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`

**Validation**:

```bash
# Check Vite config for headers
./scripts/security-audit.sh

# Test headers in dev server
curl -I http://localhost:5173 | grep -i "cross-origin\|content-security"
```

## CI/CD Security Pipeline

### Workflow Triggers

- **Push to main/develop**: Full security scan
- **Pull requests**: Security gate (blocks on critical)
- **Weekly schedule**: Comprehensive audit (Monday 2 AM UTC)
- **Manual**: On-demand security review

### Workflow Jobs

1. **Dependency Scan** (10 min)
   - npm audit
   - Vulnerability threshold check
   - Artifact: npm-audit.json

2. **Secrets Scan** (10 min)
   - Gitleaks full repository scan
   - Artifact: gitleaks-report.json (on failure)

3. **CodeQL Analysis** (30 min)
   - JavaScript/TypeScript SAST
   - Security query suite
   - Results in Security tab

4. **License Check** (10 min)
   - Production dependency licenses
   - Problematic license detection
   - Artifact: licenses.json

5. **ESLint Security** (10 min)
   - Security-focused linting
   - Artifact: eslint-results.json

6. **Security Headers** (10 min)
   - Vite configuration validation
   - COOP/COEP/CSP checks

7. **Security Report** (10 min)
   - Aggregates all scan results
   - Posts summary to PR
   - Artifact: security-summary.md

### Exit Codes

- **0**: No security issues (pass)
- **1**: Critical vulnerabilities (fail)
- **2**: High vulnerabilities (fail)
- **3**: Medium issues above threshold (warning)

## Automated Updates

### Dependabot Configuration

**Schedule**: Weekly (Monday 2-6 AM UTC)

**Update Groups**:

- Security critical: Separate PRs immediately
- Production dependencies: Grouped minor/patch
- Development dependencies: Grouped minor/patch
- GitHub Actions: Weekly
- Docker: Weekly

**PR Management**:

- Max 10 root dependency PRs
- Max 5 PRs per package
- Labeled: `dependencies`, `automated`
- Auto-run security scan workflow

**Configuration**: `.github/dependabot.yml`

## Security Incident Response

### Severity Classification

| Severity     | Response Time | Examples                             |
| ------------ | ------------- | ------------------------------------ |
| **Critical** | < 4 hours     | RCE, auth bypass, data leak          |
| **High**     | < 24 hours    | XSS, CSRF, SQL injection             |
| **Medium**   | < 1 week      | DoS, weak crypto, info disclosure    |
| **Low**      | < 1 month     | Minor config issues, non-exploitable |

### Response Workflow

1. **Detection**
   - CI/CD security scan failure
   - Dependabot alert
   - Security researcher report
   - Production monitoring alert

2. **Triage** (< 1 hour)
   - Verify vulnerability
   - Assess severity
   - Determine impact scope
   - Assign incident lead

3. **Containment** (< 4 hours for critical)
   - Disable affected feature if needed
   - Apply temporary mitigation
   - Block external access if necessary

4. **Remediation**
   - Develop fix
   - Test thoroughly
   - Deploy to production
   - Verify fix effectiveness

5. **Post-Incident**
   - Root cause analysis
   - Update security tests
   - Document lessons learned
   - Update security policies

### Reporting Security Issues

**Email**: security@sim4d.com (or GitHub Security Advisories)

**Do NOT**:

- Open public GitHub issues for security vulnerabilities
- Disclose vulnerabilities publicly before fix
- Test exploits on production systems

**Expected Response**:

- Acknowledgment: < 24 hours
- Initial assessment: < 3 days
- Fix timeline: < 30 days (depending on severity)

## Best Practices

### For Developers

1. **Never commit secrets**
   - Use environment variables
   - Add `.env` to `.gitignore`
   - Use secret management tools

2. **Review dependencies**
   - Check licenses before adding
   - Prefer well-maintained packages
   - Minimize dependency count

3. **Follow secure coding**
   - No eval(), Function(), or inline event handlers
   - Validate/sanitize all inputs
   - Use parameterized queries
   - Implement proper error handling

4. **Test security locally**
   - Run `./scripts/security-audit.sh` before PR
   - Fix ESLint security warnings
   - Test CSP compliance

### For Reviewers

1. **Security checklist**
   - [ ] No hardcoded secrets
   - [ ] Input validation present
   - [ ] SQL/command injection prevented
   - [ ] XSS attack vectors mitigated
   - [ ] Proper authentication/authorization
   - [ ] Secure error handling

2. **Dependency changes**
   - [ ] License compatible
   - [ ] No known vulnerabilities
   - [ ] Actively maintained
   - [ ] Minimal additional dependencies

3. **Infrastructure changes**
   - [ ] Security headers configured
   - [ ] HTTPS enforced
   - [ ] Rate limiting implemented
   - [ ] Logging/monitoring enabled

## Troubleshooting

### "npm audit found vulnerabilities"

```bash
# 1. Check severity
npm audit

# 2. Try automatic fix
npm audit fix

# 3. If breaking changes needed
npm audit fix --force

# 4. Manual fix
npm update <package-name>

# 5. If no fix available
# - Check for alternative packages
# - Contact package maintainer
# - Consider temporary workaround
```

### "Gitleaks detected secrets"

```bash
# 1. Remove secret from code
# 2. Rotate the compromised secret immediately
# 3. Check git history
git log -p -- path/to/file.ts

# 4. If in history, use git-filter-repo to remove
# (Warning: rewrites history)
git filter-repo --path path/to/file.ts --invert-paths

# 5. Add to .gitleaksignore if false positive
echo "path/to/file.ts:42" >> .gitleaksignore
```

### "ESLint security warnings"

```bash
# 1. Review the warning
pnpm run lint

# 2. Fix automatically if possible
pnpm run lint --fix

# 3. If intentional (rare), add exception
// eslint-disable-next-line security/detect-object-injection
const value = obj[userInput];

# 4. Document why exception is safe
```

### "CSP violations in browser"

```bash
# 1. Check browser console for violations
# Look for: "Refused to execute inline script"

# 2. Identify violation source
# - Inline script? Move to external file
# - Inline style? Use CSS classes
# - External resource? Add to CSP

# 3. Update Vite config
# apps/studio/vite.config.ts

# 4. Use nonce for necessary inline scripts
# (Advanced - requires server-side nonce generation)
```

## Additional Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CSP Reference**: https://content-security-policy.com/
- **npm audit docs**: https://docs.npmjs.com/cli/v8/commands/npm-audit
- **Gitleaks**: https://github.com/gitleaks/gitleaks
- **CodeQL**: https://codeql.github.com/docs/

## Security Contacts

- **Security Issues**: security@sim4d.com
- **Security Team Lead**: [TBD]
- **CISO**: [TBD]
- **Security Advisories**: https://github.com/aureolabs/sim4d/security/advisories
