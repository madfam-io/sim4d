#!/usr/bin/env bash
# CI/CD Cache Manager Script
# Monitor and manage Docker build cache for optimal performance

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CACHE_WARNING_THRESHOLD_GB=10
CACHE_CRITICAL_THRESHOLD_GB=20

echo "════════════════════════════════════════════════════════════════"
echo "          BrepFlow CI/CD Cache Manager"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check Docker availability
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null 2>&1; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    exit 1
fi

# Function to get cache size in GB
get_cache_size_gb() {
    if docker buildx du &> /dev/null; then
        # Parse buildx du output
        local size_str=$(docker buildx du 2>/dev/null | grep "Total:" | awk '{print $2}')

        if [ -n "$size_str" ]; then
            # Convert to GB (handle MB, GB, KB)
            if [[ "$size_str" == *"GB"* ]]; then
                echo "${size_str%GB}"
            elif [[ "$size_str" == *"MB"* ]]; then
                local mb=${size_str%MB}
                echo "scale=2; $mb / 1024" | bc
            elif [[ "$size_str" == *"KB"* ]]; then
                echo "0.00"
            else
                echo "0"
            fi
        else
            echo "0"
        fi
    else
        echo "0"
    fi
}

# Function to display cache status
show_cache_status() {
    echo -e "${BLUE}📊 Docker Build Cache Status${NC}"
    echo "────────────────────────────────────────────────────────────────"

    if docker buildx du &> /dev/null; then
        docker buildx du 2>/dev/null || echo "Unable to retrieve cache information"

        local cache_size=$(get_cache_size_gb)
        echo ""
        echo "Total Cache Size: ${cache_size} GB"

        # Determine health status
        if (( $(echo "$cache_size > $CACHE_CRITICAL_THRESHOLD_GB" | bc -l) )); then
            echo -e "${RED}⚠️  Status: CRITICAL - Cache exceeds ${CACHE_CRITICAL_THRESHOLD_GB}GB${NC}"
            echo -e "${RED}   Action required: Run 'ci-cache-manager.sh prune'${NC}"
        elif (( $(echo "$cache_size > $CACHE_WARNING_THRESHOLD_GB" | bc -l) )); then
            echo -e "${YELLOW}⚠️  Status: WARNING - Cache exceeds ${CACHE_WARNING_THRESHOLD_GB}GB${NC}"
            echo -e "${YELLOW}   Consider running: 'ci-cache-manager.sh prune'${NC}"
        else
            echo -e "${GREEN}✅ Status: HEALTHY${NC}"
        fi
    else
        echo "Docker Buildx not available"
    fi
    echo ""
}

# Function to show cache details
show_cache_details() {
    echo -e "${BLUE}🔍 Detailed Cache Information${NC}"
    echo "────────────────────────────────────────────────────────────────"

    if docker buildx du --verbose &> /dev/null; then
        docker buildx du --verbose 2>/dev/null || echo "Unable to retrieve detailed cache information"
    else
        echo "Detailed cache information not available"
    fi
    echo ""
}

# Function to prune cache (interactive)
prune_cache_interactive() {
    echo -e "${YELLOW}⚠️  Interactive Cache Cleanup${NC}"
    echo "────────────────────────────────────────────────────────────────"
    echo ""

    # Show current size
    local before_size=$(get_cache_size_gb)
    echo "Current cache size: ${before_size} GB"
    echo ""

    # Options
    echo "Cleanup options:"
    echo "  1) Prune unused cache (safe, keeps recent builds)"
    echo "  2) Prune all cache (aggressive, clears everything)"
    echo "  3) Cancel"
    echo ""
    read -p "Select option [1-3]: " option

    case $option in
        1)
            echo ""
            echo -e "${BLUE}Pruning unused cache...${NC}"
            docker buildx prune -f
            ;;
        2)
            echo ""
            read -p "Are you sure? This will clear ALL build cache [y/N]: " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                echo -e "${BLUE}Pruning all cache...${NC}"
                docker buildx prune -af
            else
                echo "Cancelled"
                return
            fi
            ;;
        3)
            echo "Cancelled"
            return
            ;;
        *)
            echo "Invalid option"
            return
            ;;
    esac

    # Show results
    local after_size=$(get_cache_size_gb)
    local saved=$(echo "$before_size - $after_size" | bc)

    echo ""
    echo -e "${GREEN}✅ Cache cleanup complete${NC}"
    echo "Before: ${before_size} GB"
    echo "After:  ${after_size} GB"
    echo "Saved:  ${saved} GB"
    echo ""
}

# Function to prune cache (automatic)
prune_cache_auto() {
    local mode="${1:-safe}"

    echo -e "${BLUE}🧹 Automatic Cache Cleanup (${mode} mode)${NC}"
    echo "────────────────────────────────────────────────────────────────"

    local before_size=$(get_cache_size_gb)
    echo "Current cache size: ${before_size} GB"
    echo ""

    if [ "$mode" = "aggressive" ]; then
        echo "Pruning all cache..."
        docker buildx prune -af
    else
        echo "Pruning unused cache..."
        docker buildx prune -f
    fi

    local after_size=$(get_cache_size_gb)
    local saved=$(echo "$before_size - $after_size" | bc)

    echo ""
    echo -e "${GREEN}✅ Cache cleanup complete${NC}"
    echo "Before: ${before_size} GB"
    echo "After:  ${after_size} GB"
    echo "Saved:  ${saved} GB"
    echo ""
}

# Function to optimize cache
optimize_cache() {
    echo -e "${BLUE}⚡ Cache Optimization${NC}"
    echo "────────────────────────────────────────────────────────────────"
    echo ""

    echo "1. Checking for dangling images..."
    local dangling=$(docker images -f "dangling=true" -q | wc -l)
    if [ "$dangling" -gt 0 ]; then
        echo "   Found $dangling dangling images"
        docker image prune -f
        echo -e "   ${GREEN}✅ Removed dangling images${NC}"
    else
        echo -e "   ${GREEN}✅ No dangling images${NC}"
    fi
    echo ""

    echo "2. Checking for unused volumes..."
    local unused_volumes=$(docker volume ls -qf dangling=true | wc -l)
    if [ "$unused_volumes" -gt 0 ]; then
        echo "   Found $unused_volumes unused volumes"
        docker volume prune -f
        echo -e "   ${GREEN}✅ Removed unused volumes${NC}"
    else
        echo -e "   ${GREEN}✅ No unused volumes${NC}"
    fi
    echo ""

    echo "3. Checking for old containers..."
    local old_containers=$(docker ps -aq -f status=exited | wc -l)
    if [ "$old_containers" -gt 0 ]; then
        echo "   Found $old_containers exited containers"
        docker container prune -f
        echo -e "   ${GREEN}✅ Removed exited containers${NC}"
    else
        echo -e "   ${GREEN}✅ No exited containers${NC}"
    fi
    echo ""

    echo -e "${GREEN}✅ Cache optimization complete${NC}"
    echo ""
}

# Function to check cache health
check_cache_health() {
    echo -e "${BLUE}🏥 Cache Health Check${NC}"
    echo "────────────────────────────────────────────────────────────────"
    echo ""

    local cache_size=$(get_cache_size_gb)
    local health_score=100
    local issues=()

    # Check 1: Cache size
    if (( $(echo "$cache_size > $CACHE_CRITICAL_THRESHOLD_GB" | bc -l) )); then
        health_score=$((health_score - 40))
        issues+=("Cache size critical: ${cache_size}GB > ${CACHE_CRITICAL_THRESHOLD_GB}GB")
    elif (( $(echo "$cache_size > $CACHE_WARNING_THRESHOLD_GB" | bc -l) )); then
        health_score=$((health_score - 20))
        issues+=("Cache size warning: ${cache_size}GB > ${CACHE_WARNING_THRESHOLD_GB}GB")
    fi

    # Check 2: Dangling images
    local dangling=$(docker images -f "dangling=true" -q | wc -l)
    if [ "$dangling" -gt 10 ]; then
        health_score=$((health_score - 15))
        issues+=("$dangling dangling images")
    fi

    # Check 3: Exited containers
    local exited=$(docker ps -aq -f status=exited | wc -l)
    if [ "$exited" -gt 20 ]; then
        health_score=$((health_score - 15))
        issues+=("$exited exited containers")
    fi

    # Check 4: Unused volumes
    local volumes=$(docker volume ls -qf dangling=true | wc -l)
    if [ "$volumes" -gt 5 ]; then
        health_score=$((health_score - 10))
        issues+=("$volumes unused volumes")
    fi

    # Display results
    echo "Health Score: $health_score/100"
    echo ""

    if [ ${#issues[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed - cache is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Issues found:${NC}"
        for issue in "${issues[@]}"; do
            echo "  • $issue"
        done
        echo ""
        echo -e "${BLUE}Recommendation:${NC}"
        if [ $health_score -lt 60 ]; then
            echo "  Run: $0 optimize && $0 prune"
        elif [ $health_score -lt 80 ]; then
            echo "  Run: $0 optimize"
        else
            echo "  Cache health is acceptable, no action needed"
        fi
    fi
    echo ""
}

# Main execution
main() {
    case "${1:-status}" in
        status)
            show_cache_status
            ;;
        details)
            show_cache_details
            ;;
        prune)
            prune_cache_interactive
            ;;
        prune-safe)
            prune_cache_auto "safe"
            ;;
        prune-all)
            prune_cache_auto "aggressive"
            ;;
        optimize)
            optimize_cache
            ;;
        health)
            check_cache_health
            ;;
        help)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  status       - Show cache status (default)"
            echo "  details      - Show detailed cache information"
            echo "  prune        - Interactive cache cleanup"
            echo "  prune-safe   - Automatic safe cleanup (unused only)"
            echo "  prune-all    - Automatic aggressive cleanup (all cache)"
            echo "  optimize     - Remove dangling images/containers/volumes"
            echo "  health       - Comprehensive cache health check"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                  # Show cache status"
            echo "  $0 health           # Check cache health"
            echo "  $0 optimize         # Optimize cache"
            echo "  $0 prune-safe       # Safe cleanup"
            echo ""
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
