#!/bin/bash
# Pre-commit hook to prevent undocumented TODO/FIXME comments
#
# This script ensures that all TODO/FIXME comments are properly documented
# with NOTE comments that explain the issue and provide context.
#
# Usage: Called automatically by lint-staged during pre-commit
# Exit code: 0 if no undocumented TODOs, 1 if found

set -e

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check for TODO or FIXME in staged files
files="$@"
found_todos=false

echo -e "${YELLOW}🔍 Checking for undocumented TODO/FIXME comments...${NC}"

for file in $files; do
  # Skip if file doesn't exist (could be deleted)
  if [ ! -f "$file" ]; then
    continue
  fi

  # Check for TODO or FIXME (case-insensitive)
  if grep -in '\bTODO\b\|\bFIXME\b' "$file" > /dev/null 2>&1; then
    if [ "$found_todos" = false ]; then
      echo -e "${RED}❌ Found undocumented TODO/FIXME comments:${NC}"
      found_todos=true
    fi
    echo -e "${RED}   $file${NC}"
    grep -in '\bTODO\b\|\bFIXME\b' "$file" | while read -r line; do
      echo -e "      ${YELLOW}$line${NC}"
    done
  fi
done

if [ "$found_todos" = true ]; then
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Commit rejected: Undocumented TODO/FIXME comments found${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}Please use one of these alternatives:${NC}"
  echo ""
  echo -e "${GREEN}1. Use NOTE comments for documented limitations:${NC}"
  echo -e "   // NOTE: Feature deferred - requires API refactor (see issue #123)."
  echo ""
  echo -e "${GREEN}2. Use 'Requires:' for future work:${NC}"
  echo -e "   // NOTE: Export disabled due to type issues."
  echo -e "   // Requires: Fix branded types and remove @ts-nocheck."
  echo ""
  echo -e "${GREEN}3. Create a GitHub issue and reference it:${NC}"
  echo -e "   // NOTE: Bbox extraction disabled (issue #456)."
  echo ""
  echo -e "${YELLOW}See CLAUDE.md for full guidelines.${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ No undocumented TODO/FIXME comments found${NC}"
exit 0
