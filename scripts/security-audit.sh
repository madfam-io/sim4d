#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# BrepFlow Security Audit Script
# ═══════════════════════════════════════════════════════════════════════════
#
# Comprehensive security scanning for dependencies, code, secrets, and headers
#
# Usage:
#   ./scripts/security-audit.sh              # Full audit
#   ./scripts/security-audit.sh --quick      # Skip slow checks
#   ./scripts/security-audit.sh --ci         # CI mode (exit codes)
#   ./scripts/security-audit.sh --report     # Generate HTML report
#
# Exit Codes:
#   0 = No security issues found
#   1 = Critical vulnerabilities detected
#   2 = High vulnerabilities detected
#   3 = Medium vulnerabilities detected
#

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECURITY_DIR="$PROJECT_ROOT/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Severity thresholds
CRITICAL_THRESHOLD=0
HIGH_THRESHOLD=0
MEDIUM_THRESHOLD=5

# Flags
QUICK_MODE=false
CI_MODE=false
GENERATE_REPORT=false
EXIT_CODE=0

# ═══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

section_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_warning "$1 not found. Install with: $2"
        return 1
    fi
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
# Parse Arguments
# ═══════════════════════════════════════════════════════════════════════════

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --help|-h)
            cat << EOF
BrepFlow Security Audit Script

Usage:
  ./scripts/security-audit.sh [OPTIONS]

Options:
  --quick         Skip slow checks (secrets scanning, SAST)
  --ci            CI mode (strict exit codes, no interactive)
  --report        Generate HTML security report
  --help, -h      Show this help message

Exit Codes:
  0 = No security issues found
  1 = Critical vulnerabilities detected
  2 = High vulnerabilities detected
  3 = Medium vulnerabilities detected (above threshold)

Examples:
  ./scripts/security-audit.sh              # Full audit
  ./scripts/security-audit.sh --quick      # Quick scan
  ./scripts/security-audit.sh --ci         # CI pipeline
  ./scripts/security-audit.sh --report     # With HTML report

EOF
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Run with --help for usage information"
            exit 1
            ;;
    esac
done

# ═══════════════════════════════════════════════════════════════════════════
# Setup
# ═══════════════════════════════════════════════════════════════════════════

cd "$PROJECT_ROOT"

# Create security reports directory
mkdir -p "$SECURITY_DIR"

# Initialize report data
REPORT_FILE="$SECURITY_DIR/audit_${TIMESTAMP}.json"
echo '{"timestamp":"'$(date -Iseconds)'","checks":[]}' > "$REPORT_FILE"

log_info "BrepFlow Security Audit - $(date)"
log_info "Project: $PROJECT_ROOT"
log_info "Mode: $([ "$CI_MODE" = true ] && echo "CI" || echo "Interactive")"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Check 1: Dependency Vulnerabilities (npm audit)
# ═══════════════════════════════════════════════════════════════════════════

section_header "1. Dependency Vulnerability Scan (npm audit)"

if check_command "npm" "curl -fsSL https://nodejs.org/dist/latest/install.sh | bash"; then
    log_info "Running npm audit..."

    # Run npm audit and capture output
    if npm audit --json > "$SECURITY_DIR/npm-audit_${TIMESTAMP}.json" 2>&1; then
        log_success "No vulnerabilities found"
    else
        # Parse npm audit results
        CRITICAL=$(jq -r '.metadata.vulnerabilities.critical // 0' "$SECURITY_DIR/npm-audit_${TIMESTAMP}.json" 2>/dev/null || echo "0")
        HIGH=$(jq -r '.metadata.vulnerabilities.high // 0' "$SECURITY_DIR/npm-audit_${TIMESTAMP}.json" 2>/dev/null || echo "0")
        MODERATE=$(jq -r '.metadata.vulnerabilities.moderate // 0' "$SECURITY_DIR/npm-audit_${TIMESTAMP}.json" 2>/dev/null || echo "0")
        LOW=$(jq -r '.metadata.vulnerabilities.low // 0' "$SECURITY_DIR/npm-audit_${TIMESTAMP}.json" 2>/dev/null || echo "0")

        echo ""
        echo "Vulnerability Summary:"
        echo "  Critical: $CRITICAL"
        echo "  High:     $HIGH"
        echo "  Moderate: $MODERATE"
        echo "  Low:      $LOW"
        echo ""

        # Check against thresholds
        if [ "$CRITICAL" -gt "$CRITICAL_THRESHOLD" ]; then
            log_error "Critical vulnerabilities found: $CRITICAL (threshold: $CRITICAL_THRESHOLD)"
            EXIT_CODE=1
        elif [ "$HIGH" -gt "$HIGH_THRESHOLD" ]; then
            log_error "High vulnerabilities found: $HIGH (threshold: $HIGH_THRESHOLD)"
            [ "$EXIT_CODE" -lt 2 ] && EXIT_CODE=2
        elif [ "$MODERATE" -gt "$MEDIUM_THRESHOLD" ]; then
            log_warning "Moderate vulnerabilities found: $MODERATE (threshold: $MEDIUM_THRESHOLD)"
            [ "$EXIT_CODE" -lt 3 ] && EXIT_CODE=3
        else
            log_success "Vulnerabilities within acceptable thresholds"
        fi

        # Show fix command
        if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
            echo ""
            log_info "Run 'npm audit fix' to automatically fix vulnerabilities"
            log_info "For detailed report: npm audit"
        fi
    fi
else
    log_warning "Skipping npm audit (npm not available)"
fi

# ═══════════════════════════════════════════════════════════════════════════
# Check 2: Outdated Dependencies
# ═══════════════════════════════════════════════════════════════════════════

section_header "2. Outdated Dependencies Check"

if check_command "npm" ""; then
    log_info "Checking for outdated packages..."

    OUTDATED=$(npm outdated --json 2>/dev/null || echo "{}")
    OUTDATED_COUNT=$(echo "$OUTDATED" | jq 'length' 2>/dev/null || echo "0")

    if [ "$OUTDATED_COUNT" -gt 0 ]; then
        log_warning "$OUTDATED_COUNT packages are outdated"
        echo "$OUTDATED" > "$SECURITY_DIR/npm-outdated_${TIMESTAMP}.json"

        # Show major version updates (potential breaking changes)
        MAJOR_UPDATES=$(echo "$OUTDATED" | jq -r 'to_entries[] | select(.value.current != .value.latest and (.value.latest | split(".")[0]) != (.value.current | split(".")[0])) | .key' 2>/dev/null || echo "")

        if [ -n "$MAJOR_UPDATES" ]; then
            echo ""
            log_warning "Packages with major version updates (review carefully):"
            echo "$MAJOR_UPDATES" | while read -r pkg; do
                echo "  - $pkg"
            done
        fi

        echo ""
        log_info "Run 'npm outdated' for detailed version information"
        log_info "Run 'npm update' to update to latest compatible versions"
    else
        log_success "All dependencies are up to date"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# Check 3: Secrets Scanning (gitleaks)
# ═══════════════════════════════════════════════════════════════════════════

if [ "$QUICK_MODE" = false ]; then
    section_header "3. Secrets Scanning (gitleaks)"

    if check_command "gitleaks" "brew install gitleaks"; then
        log_info "Scanning for leaked secrets..."

        if gitleaks detect --no-git --report-path="$SECURITY_DIR/gitleaks_${TIMESTAMP}.json" 2>&1 | tee "$SECURITY_DIR/gitleaks_${TIMESTAMP}.log"; then
            log_success "No secrets detected"
        else
            SECRETS_COUNT=$(jq 'length' "$SECURITY_DIR/gitleaks_${TIMESTAMP}.json" 2>/dev/null || echo "0")

            if [ "$SECRETS_COUNT" -gt 0 ]; then
                log_error "Potential secrets found: $SECRETS_COUNT"
                log_error "Review: $SECURITY_DIR/gitleaks_${TIMESTAMP}.json"
                EXIT_CODE=1

                echo ""
                log_info "Common leak types detected:"
                jq -r '.[].RuleID' "$SECURITY_DIR/gitleaks_${TIMESTAMP}.json" 2>/dev/null | sort | uniq -c | sort -rn
            fi
        fi
    else
        log_warning "Skipping secrets scanning (gitleaks not available)"
        log_info "Install: brew install gitleaks"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# Check 4: License Compliance
# ═══════════════════════════════════════════════════════════════════════════

section_header "4. License Compliance Check"

if check_command "npx" ""; then
    log_info "Checking license compliance..."

    # Use license-checker to audit licenses
    if npx license-checker --json --production > "$SECURITY_DIR/licenses_${TIMESTAMP}.json" 2>&1; then
        # Check for problematic licenses
        PROBLEMATIC_LICENSES=("GPL" "AGPL" "LGPL" "SSPL")
        ISSUES_FOUND=false

        for license in "${PROBLEMATIC_LICENSES[@]}"; do
            COUNT=$(jq -r 'to_entries[] | select(.value.licenses | tostring | contains("'$license'")) | .key' "$SECURITY_DIR/licenses_${TIMESTAMP}.json" 2>/dev/null | wc -l)
            if [ "$COUNT" -gt 0 ]; then
                log_warning "Found $COUNT packages with $license license"
                ISSUES_FOUND=true
            fi
        done

        if [ "$ISSUES_FOUND" = false ]; then
            log_success "No license compliance issues found"
        else
            log_info "Review: $SECURITY_DIR/licenses_${TIMESTAMP}.json"
            [ "$EXIT_CODE" -lt 3 ] && EXIT_CODE=3
        fi
    else
        log_warning "License check failed"
    fi
else
    log_warning "Skipping license check (npx not available)"
fi

# ═══════════════════════════════════════════════════════════════════════════
# Check 5: Security Headers (for Vite dev server)
# ═══════════════════════════════════════════════════════════════════════════

section_header "5. Security Headers Check"

log_info "Checking Vite security configuration..."

# Check for COOP/COEP headers in vite.config.ts
if grep -q "Cross-Origin-Opener-Policy" apps/studio/vite.config.ts 2>/dev/null; then
    log_success "COOP header configured"
else
    log_warning "COOP header not found in Vite config"
    log_info "Add: headers: { 'Cross-Origin-Opener-Policy': 'same-origin' }"
fi

if grep -q "Cross-Origin-Embedder-Policy" apps/studio/vite.config.ts 2>/dev/null; then
    log_success "COEP header configured"
else
    log_warning "COEP header not found in Vite config"
    log_info "Add: headers: { 'Cross-Origin-Embedder-Policy': 'require-corp' }"
fi

# Check for CSP configuration
if grep -q "Content-Security-Policy" apps/studio/vite.config.ts 2>/dev/null; then
    log_success "CSP configured"
else
    log_warning "CSP not configured in Vite"
    log_info "Consider adding Content-Security-Policy header"
fi

# ═══════════════════════════════════════════════════════════════════════════
# Check 6: ESLint Security Plugins
# ═══════════════════════════════════════════════════════════════════════════

section_header "6. ESLint Security Configuration"

if [ -f "package.json" ]; then
    # Check for security-related ESLint plugins
    SECURITY_PLUGINS=(
        "eslint-plugin-security"
        "eslint-plugin-no-secrets"
        "@microsoft/eslint-plugin-sdl"
    )

    MISSING_PLUGINS=()
    for plugin in "${SECURITY_PLUGINS[@]}"; do
        if ! grep -q "\"$plugin\"" package.json; then
            MISSING_PLUGINS+=("$plugin")
        fi
    done

    if [ ${#MISSING_PLUGINS[@]} -eq 0 ]; then
        log_success "Security ESLint plugins installed"
    else
        log_warning "Missing security ESLint plugins:"
        for plugin in "${MISSING_PLUGINS[@]}"; do
            echo "  - $plugin"
        done
        log_info "Install with: pnpm add -D ${MISSING_PLUGINS[*]}"
    fi
fi

# ═══════════════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════════════

section_header "Security Audit Summary"

echo ""
log_info "Audit completed: $(date)"
log_info "Reports saved to: $SECURITY_DIR/"
echo ""

if [ "$EXIT_CODE" -eq 0 ]; then
    log_success "No critical security issues found"
elif [ "$EXIT_CODE" -eq 1 ]; then
    log_error "Critical vulnerabilities detected - immediate action required"
elif [ "$EXIT_CODE" -eq 2 ]; then
    log_error "High severity vulnerabilities detected - action required"
elif [ "$EXIT_CODE" -eq 3 ]; then
    log_warning "Medium severity issues detected - review recommended"
fi

echo ""
log_info "Next steps:"
echo "  1. Review detailed reports in: $SECURITY_DIR/"
echo "  2. Run 'npm audit fix' to auto-fix dependency vulnerabilities"
echo "  3. Address any secrets found with gitleaks"
echo "  4. Update security headers in vite.config.ts if needed"
echo ""

# Generate HTML report if requested
if [ "$GENERATE_REPORT" = true ]; then
    log_info "Generating HTML report..."
    node scripts/generate-security-report.js "$SECURITY_DIR" "$TIMESTAMP"
fi

# Exit with appropriate code
if [ "$CI_MODE" = true ]; then
    exit $EXIT_CODE
else
    exit 0  # Don't fail local runs
fi
