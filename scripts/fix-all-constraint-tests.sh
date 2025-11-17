#!/usr/bin/env bash
# Fix all Point2D usages in constraint-solver tests

FILE="packages/constraint-solver/src/solver-2d.comprehensive.test.ts"

# Replace all Point2D declarations with createPointEntity calls
sed -i.bak -E 's/const (p[0-9]+): Point2D = \{ id: '\''([^'\'']+'\''), x: ([^,]+), y: ([^}]+) \};/const \1 = createPointEntity('\''\2'\'', \3, \4);/g' "$FILE"

# Clean up backup file
rm -f "${FILE}.bak"

echo "Fixed Point2D declarations in $FILE"
