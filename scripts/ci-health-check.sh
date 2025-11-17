#!/usr/bin/env bash
# CI/CD Health Check Script
# Validates workflow configuration and identifies potential issues

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "════════════════════════════════════════════════════════════════"
echo "          BrepFlow CI/CD Health Check"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check 1: Workflow files exist
check_workflow_files() {
    echo -e "${BLUE}🔍 Checking workflow files...${NC}"

    local workflows=(
        ".github/workflows/test-docker.yml"
        ".github/workflows/pr-quality-gate.yml"
        ".github/workflows/ci.yml"
        ".github/workflows/e2e-tests.yml"
    )

    for workflow in "${workflows[@]}"; do
        if [ -f "$workflow" ]; then
            echo -e "  ${GREEN}✅${NC} Found: $workflow"
        else
            echo -e "  ${RED}❌${NC} Missing: $workflow"
            ((ERRORS++))
        fi
    done
    echo ""
}

# Check 2: Docker files exist
check_docker_files() {
    echo -e "${BLUE}🐳 Checking Docker configuration...${NC}"

    local dockerfiles=(
        "Dockerfile.test-unit"
        "Dockerfile.test-wasm"
        "docker-compose.test.yml"
    )

    for dockerfile in "${dockerfiles[@]}"; do
        if [ -f "$dockerfile" ]; then
            echo -e "  ${GREEN}✅${NC} Found: $dockerfile"
        else
            echo -e "  ${RED}❌${NC} Missing: $dockerfile"
            ((ERRORS++))
        fi
    done
    echo ""
}

# Check 3: Required scripts exist
check_scripts() {
    echo -e "${BLUE}📜 Checking required scripts...${NC}"

    local scripts=(
        "scripts/docker-dev.sh"
        "scripts/ci-monitor.sh"
    )

    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                echo -e "  ${GREEN}✅${NC} Executable: $script"
            else
                echo -e "  ${YELLOW}⚠️${NC}  Not executable: $script (run: chmod +x $script)"
                ((WARNINGS++))
            fi
        else
            echo -e "  ${RED}❌${NC} Missing: $script"
            ((ERRORS++))
        fi
    done
    echo ""
}

# Check 4: Documentation exists
check_documentation() {
    echo -e "${BLUE}📚 Checking documentation...${NC}"

    local docs=(
        "docs/ci-cd/DOCKER_CI_CD.md"
        "docs/ci-cd/QUICK_REFERENCE.md"
        "docs/ci-cd/README.md"
        "docs/testing/DOCKER_TESTING.md"
    )

    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            echo -e "  ${GREEN}✅${NC} Found: $doc"
        else
            echo -e "  ${YELLOW}⚠️${NC}  Missing: $doc"
            ((WARNINGS++))
        fi
    done
    echo ""
}

# Check 5: GitHub CLI availability
check_gh_cli() {
    echo -e "${BLUE}🔧 Checking GitHub CLI...${NC}"

    if command -v gh &> /dev/null; then
        local gh_version=$(gh --version | head -n 1)
        echo -e "  ${GREEN}✅${NC} $gh_version"

        if gh auth status &> /dev/null; then
            echo -e "  ${GREEN}✅${NC} Authenticated with GitHub"
        else
            echo -e "  ${YELLOW}⚠️${NC}  Not authenticated (run: gh auth login)"
            ((WARNINGS++))
        fi
    else
        echo -e "  ${RED}❌${NC} GitHub CLI not installed"
        echo "     Install from: https://cli.github.com/"
        ((ERRORS++))
    fi
    echo ""
}

# Check 6: Docker availability
check_docker() {
    echo -e "${BLUE}🐳 Checking Docker setup...${NC}"

    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version)
        echo -e "  ${GREEN}✅${NC} $docker_version"

        if docker info &> /dev/null; then
            echo -e "  ${GREEN}✅${NC} Docker daemon running"

            # Check Docker Buildx
            if docker buildx version &> /dev/null; then
                echo -e "  ${GREEN}✅${NC} Docker Buildx available"
            else
                echo -e "  ${YELLOW}⚠️${NC}  Docker Buildx not available (needed for caching)"
                ((WARNINGS++))
            fi
        else
            echo -e "  ${YELLOW}⚠️${NC}  Docker daemon not running"
            ((WARNINGS++))
        fi
    else
        echo -e "  ${YELLOW}⚠️${NC}  Docker not installed (needed for local Docker testing)"
        ((WARNINGS++))
    fi
    echo ""
}

# Check 7: Node.js and pnpm
check_node_pnpm() {
    echo -e "${BLUE}📦 Checking Node.js and pnpm...${NC}"

    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        echo -e "  ${GREEN}✅${NC} Node.js $node_version"
    else
        echo -e "  ${RED}❌${NC} Node.js not installed"
        ((ERRORS++))
    fi

    if command -v pnpm &> /dev/null; then
        local pnpm_version=$(pnpm --version)
        echo -e "  ${GREEN}✅${NC} pnpm $pnpm_version"
    else
        echo -e "  ${RED}❌${NC} pnpm not installed"
        ((ERRORS++))
    fi
    echo ""
}

# Check 8: Workflow syntax validation
check_workflow_syntax() {
    echo -e "${BLUE}✅ Validating workflow syntax...${NC}"

    if command -v gh &> /dev/null; then
        local workflows=(
            ".github/workflows/test-docker.yml"
            ".github/workflows/pr-quality-gate.yml"
        )

        for workflow in "${workflows[@]}"; do
            if [ -f "$workflow" ]; then
                # Check for common syntax issues
                if grep -q "uses:.*@v[0-9]" "$workflow"; then
                    echo -e "  ${GREEN}✅${NC} $workflow: Action versions specified"
                else
                    echo -e "  ${YELLOW}⚠️${NC}  $workflow: Some actions may not have versions"
                    ((WARNINGS++))
                fi

                # Check for required fields
                if grep -q "^name:" "$workflow" && grep -q "^on:" "$workflow"; then
                    echo -e "  ${GREEN}✅${NC} $workflow: Required fields present"
                else
                    echo -e "  ${RED}❌${NC} $workflow: Missing required fields"
                    ((ERRORS++))
                fi
            fi
        done
    else
        echo -e "  ${YELLOW}⚠️${NC}  GitHub CLI not available, skipping validation"
        ((WARNINGS++))
    fi
    echo ""
}

# Check 9: Cache configuration
check_cache_config() {
    echo -e "${BLUE}💾 Checking cache configuration...${NC}"

    if [ -f ".github/workflows/test-docker.yml" ]; then
        if grep -q "actions/cache@v" ".github/workflows/test-docker.yml"; then
            echo -e "  ${GREEN}✅${NC} Docker workflow uses GitHub Actions cache"
        else
            echo -e "  ${YELLOW}⚠️${NC}  Docker workflow may not be using cache"
            ((WARNINGS++))
        fi

        if grep -q "cache-from.*type=local" ".github/workflows/test-docker.yml"; then
            echo -e "  ${GREEN}✅${NC} Docker Buildx cache configured"
        else
            echo -e "  ${YELLOW}⚠️${NC}  Docker Buildx cache may not be configured"
            ((WARNINGS++))
        fi
    fi
    echo ""
}

# Check 10: Performance targets
check_performance_targets() {
    echo -e "${BLUE}⏱️  Checking performance targets...${NC}"

    if command -v gh &> /dev/null && gh auth status &> /dev/null 2>&1; then
        # Get last successful run of test-docker workflow
        local last_run=$(gh run list --workflow=test-docker.yml --limit=1 --json conclusion,createdAt,updatedAt --jq '.[] | select(.conclusion == "success")')

        if [ -n "$last_run" ]; then
            local created=$(echo "$last_run" | jq -r '.createdAt')
            local updated=$(echo "$last_run" | jq -r '.updatedAt')

            local created_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created" "+%s" 2>/dev/null || echo "0")
            local updated_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$updated" "+%s" 2>/dev/null || echo "0")

            if [ "$created_epoch" != "0" ] && [ "$updated_epoch" != "0" ]; then
                local duration=$((updated_epoch - created_epoch))
                local duration_min=$((duration / 60))

                echo -e "  Last successful run: ${duration_min} minutes"

                if [ $duration_min -le 25 ]; then
                    echo -e "  ${GREEN}✅${NC} Within 25-minute target"
                else
                    echo -e "  ${YELLOW}⚠️${NC}  Exceeds 25-minute target"
                    ((WARNINGS++))
                fi
            fi
        else
            echo -e "  ${YELLOW}⚠️${NC}  No successful runs found"
        fi
    else
        echo -e "  ${YELLOW}⚠️${NC}  GitHub CLI not available, skipping check"
    fi
    echo ""
}

# Main execution
main() {
    check_workflow_files
    check_docker_files
    check_scripts
    check_documentation
    check_gh_cli
    check_docker
    check_node_pnpm
    check_workflow_syntax
    check_cache_config
    check_performance_targets

    echo "════════════════════════════════════════════════════════════════"
    echo "                     Health Check Summary"
    echo "════════════════════════════════════════════════════════════════"

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed! CI/CD infrastructure is healthy.${NC}"
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. CI/CD will work but some features may be limited.${NC}"
        exit 0
    else
        echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
        echo -e "${RED}   Please fix the errors above before using CI/CD.${NC}"
        exit 1
    fi
}

main "$@"
