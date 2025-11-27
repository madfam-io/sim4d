#!/usr/bin/env bash
# CI/CD Monitoring Dashboard Script
# Provides real-time status of GitHub Actions workflows and performance metrics

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="${GITHUB_REPO_OWNER:-aureo-labs}"
REPO_NAME="${GITHUB_REPO_NAME:-sim4d}"
DAYS_BACK="${CI_MONITOR_DAYS:-7}"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Warning: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo "════════════════════════════════════════════════════════════════"
echo "           Sim4D CI/CD Monitoring Dashboard"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Function to get workflow status
get_workflow_status() {
    local workflow_name="$1"
    local workflow_file="$2"

    echo -e "${BLUE}📊 $workflow_name${NC}"
    echo "────────────────────────────────────────────────────────────────"

    # Get last 5 runs
    gh run list \
        --workflow="$workflow_file" \
        --limit=5 \
        --json status,conclusion,createdAt,displayTitle,databaseId \
        --jq '.[] | "\(.databaseId)|\(.status)|\(.conclusion // "running")|\(.createdAt)|\(.displayTitle)"' | \
    while IFS='|' read -r id status conclusion created title; do
        # Format timestamp
        created_formatted=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "$created")

        # Determine status emoji and color
        if [ "$conclusion" = "success" ]; then
            status_icon="${GREEN}✅${NC}"
        elif [ "$conclusion" = "failure" ]; then
            status_icon="${RED}❌${NC}"
        elif [ "$status" = "in_progress" ]; then
            status_icon="${YELLOW}⏳${NC}"
        else
            status_icon="${YELLOW}⚠️${NC}"
        fi

        echo -e "  $status_icon Run #$id - $created_formatted"
        echo -e "     Title: ${title:0:60}"
    done
    echo ""
}

# Function to get workflow performance metrics
get_workflow_metrics() {
    local workflow_file="$1"
    local workflow_label="$2"

    echo -e "${BLUE}⏱️  Performance Metrics: $workflow_label${NC}"
    echo "────────────────────────────────────────────────────────────────"

    # Get last 10 successful runs and calculate average duration
    local durations=$(gh run list \
        --workflow="$workflow_file" \
        --limit=10 \
        --json conclusion,createdAt,updatedAt \
        --jq '.[] | select(.conclusion == "success") |
              ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601))')

    if [ -n "$durations" ]; then
        local total=0
        local count=0
        local min=999999
        local max=0

        while read -r duration; do
            total=$((total + duration))
            count=$((count + 1))
            [ $duration -lt $min ] && min=$duration
            [ $duration -gt $max ] && max=$duration
        done <<< "$durations"

        if [ $count -gt 0 ]; then
            local avg=$((total / count))
            echo "  Average Duration: $((avg / 60)) minutes $((avg % 60)) seconds"
            echo "  Min Duration: $((min / 60)) minutes $((min % 60)) seconds"
            echo "  Max Duration: $((max / 60)) minutes $((max % 60)) seconds"
            echo "  Sample Size: $count runs"
        fi
    else
        echo "  No successful runs in recent history"
    fi
    echo ""
}

# Function to get overall success rate
get_success_rate() {
    echo -e "${BLUE}📈 Overall Success Rate (Last $DAYS_BACK days)${NC}"
    echo "────────────────────────────────────────────────────────────────"

    # Calculate date for filtering
    local date_filter=$(date -v-${DAYS_BACK}d -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -d "$DAYS_BACK days ago" -u +"%Y-%m-%dT%H:%M:%SZ")

    for workflow in "test-docker.yml" "pr-quality-gate.yml" "ci.yml"; do
        local total=$(gh run list --workflow="$workflow" --limit=100 --json conclusion --jq 'length')
        local success=$(gh run list --workflow="$workflow" --limit=100 --json conclusion --jq '[.[] | select(.conclusion == "success")] | length')

        if [ $total -gt 0 ]; then
            local rate=$((success * 100 / total))
            local workflow_name=$(basename "$workflow" .yml)

            if [ $rate -ge 90 ]; then
                echo -e "  ${GREEN}✅ $workflow_name: $rate% ($success/$total)${NC}"
            elif [ $rate -ge 70 ]; then
                echo -e "  ${YELLOW}⚠️  $workflow_name: $rate% ($success/$total)${NC}"
            else
                echo -e "  ${RED}❌ $workflow_name: $rate% ($success/$total)${NC}"
            fi
        fi
    done
    echo ""
}

# Function to check for failing PRs
check_failing_prs() {
    echo -e "${BLUE}🔍 PR Status Check${NC}"
    echo "────────────────────────────────────────────────────────────────"

    local failing_prs=$(gh pr list --json number,title,statusCheckRollup --jq '.[] | select(.statusCheckRollup[] | select(.conclusion == "failure")) | .number')

    if [ -n "$failing_prs" ]; then
        echo -e "${YELLOW}⚠️  PRs with failing checks:${NC}"
        while read -r pr_num; do
            local pr_title=$(gh pr view "$pr_num" --json title --jq '.title')
            echo "  PR #$pr_num: ${pr_title:0:50}"
        done <<< "$failing_prs"
    else
        echo -e "${GREEN}✅ All open PRs have passing checks${NC}"
    fi
    echo ""
}

# Function to check Docker cache effectiveness
check_cache_stats() {
    echo -e "${BLUE}🐳 Docker Cache Statistics${NC}"
    echo "────────────────────────────────────────────────────────────────"

    if command -v docker &> /dev/null; then
        if docker buildx inspect &> /dev/null; then
            echo "Local Docker Buildx cache:"
            docker buildx du 2>/dev/null || echo "  Unable to retrieve cache stats"
        else
            echo "  Docker Buildx not configured"
        fi
    else
        echo "  Docker not available on this system"
    fi
    echo ""
}

# Main execution
main() {
    # Parse arguments
    case "${1:-status}" in
        status)
            get_workflow_status "Docker Testing" "test-docker.yml"
            get_workflow_status "PR Quality Gate" "pr-quality-gate.yml"
            get_workflow_status "CI Pipeline" "ci.yml"
            get_success_rate
            check_failing_prs
            ;;
        metrics)
            get_workflow_metrics "test-docker.yml" "Docker Testing"
            get_workflow_metrics "pr-quality-gate.yml" "PR Quality Gate"
            get_workflow_metrics "ci.yml" "CI Pipeline"
            ;;
        cache)
            check_cache_stats
            ;;
        watch)
            while true; do
                clear
                main status
                echo ""
                echo -e "${BLUE}Refreshing in 30 seconds... (Ctrl+C to stop)${NC}"
                sleep 30
            done
            ;;
        help)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  status    - Show workflow status (default)"
            echo "  metrics   - Show performance metrics"
            echo "  cache     - Show Docker cache statistics"
            echo "  watch     - Continuous monitoring (30s refresh)"
            echo "  help      - Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  GITHUB_REPO_OWNER - Repository owner (default: aureo-labs)"
            echo "  GITHUB_REPO_NAME  - Repository name (default: sim4d)"
            echo "  CI_MONITOR_DAYS   - Days of history (default: 7)"
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
