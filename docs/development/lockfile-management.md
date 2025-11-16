# Lockfile Management Guide

## Overview

This document outlines best practices for managing `pnpm-lock.yaml` to prevent deployment failures and ensure consistent dependency resolution across environments.

## The Problem

**Error**: `ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"`

This occurs when:

- `package.json` has dependencies that don't match `pnpm-lock.yaml` entries
- Common in monorepos where workspace packages are modified independently
- Vercel and other CI/CD platforms use `--frozen-lockfile` for security and reproducibility

## Prevention Strategies

### 1. Pre-commit Hook (Recommended)

The `.husky/pre-commit` hook automatically:

- Detects package.json changes
- Validates lockfile synchronization
- Auto-commits updated lockfile if needed

**Setup**: Already configured in `.husky/pre-commit`

### 2. Package Scripts

Use these commands for lockfile management:

```bash
# Check if lockfile is synchronized (CI-safe)
pnpm lockfile:check

# Update lockfile to match package.json changes
pnpm lockfile:update

# Pre-deployment validation
pnpm pre-deploy
```

### 3. Development Workflow

**When adding dependencies:**

```bash
# 1. Add dependency to package.json
pnpm add uuid @types/uuid --workspace apps/studio

# 2. Verify lockfile is updated
git status

# 3. Commit both files together
git add apps/studio/package.json pnpm-lock.yaml
git commit -m "feat: add uuid for monitoring system"
```

### 4. Team Guidelines

1. **Always commit lockfile changes** with package.json modifications
2. **Run `pnpm install`** after pulling changes that include package.json updates
3. **Use `pnpm lockfile:check`** before pushing to catch issues early
4. **Never edit pnpm-lock.yaml manually** - always regenerate with `pnpm install`

## Troubleshooting

### Immediate Fix for Deployment Failures

```bash
# 1. Regenerate lockfile
pnpm install

# 2. Commit the updated lockfile
git add pnpm-lock.yaml
git commit -m "fix: update lockfile to match package.json dependencies"

# 3. Push to trigger new deployment
git push
```

### Verifying Fix

```bash
# Test deployment readiness
pnpm lockfile:check && echo "✅ Ready for deployment"

# Check specific package
pnpm list uuid --depth=0
```

## Root Cause Analysis Template

When lockfile issues occur:

1. **Check recent commits** for package.json changes without lockfile updates
2. **Compare lockfile entries** with package.json specifications
3. **Identify missing dependencies** in lockfile importers section
4. **Verify workspace dependencies** are properly linked

## Monitoring

The monitoring system now includes UUID dependencies:

- `uuid@^9.0.0` for unique metric identifiers
- `@types/uuid@^9.0.0` for TypeScript support

These were the missing dependencies that caused the deployment failure.

## References

- [PNPM Lockfile Documentation](https://pnpm.io/pnpm-lock.yaml)
- [Vercel Deployment Configuration](https://vercel.com/docs/concepts/deployments/builds)
- [Monorepo Best Practices](https://pnpm.io/workspaces)
