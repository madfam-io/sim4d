#!/bin/bash

# Build script for production deployment (Vercel)
# Only builds the studio app and necessary dependencies

set -e

echo "Building production packages..."

# Build core packages first
pnpm --filter @sim4d/types build
pnpm --filter @sim4d/engine-core build
pnpm --filter @sim4d/engine-occt build
pnpm --filter @sim4d/nodes-core build
pnpm --filter @sim4d/viewport build
pnpm --filter @sim4d/sdk build

# Build the studio app
pnpm --filter @sim4d/studio build

echo "Production build complete!"