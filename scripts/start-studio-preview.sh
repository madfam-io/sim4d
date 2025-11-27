#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STUDIO_APP_DIR="$ROOT_DIR/apps/studio"
DIST_DIR="$STUDIO_APP_DIR/dist"
PORT="${PORT:-5173}"
HOST="${1:-127.0.0.1}"
HOST_ARG="${1:-}"
PORT_ARG="${2:-}"

HOST_ENV="${PREVIEW_HOST:-}"
PORT_ENV="${PREVIEW_PORT:-}"

HOST="${HOST_ARG:-${HOST_ENV:-127.0.0.1}}"
PORT="${PORT_ARG:-${PORT_ENV:-5173}}"

# Allow callers to skip the build step when a prebuilt dist is known to be present
SKIP_BUILD="${SKIP_STUDIO_BUILD:-0}"

if [[ "$SKIP_BUILD" != "1" ]]; then
  if [[ ! -d "$DIST_DIR" || -z "$(ls -A "$DIST_DIR" 2>/dev/null)" ]]; then
    echo "[start-studio-preview] dist/ missing or empty – running build"
    pnpm --filter @sim4d/studio run build
  else
    echo "[start-studio-preview] Using existing dist/ (set SKIP_STUDIO_BUILD=1 to bypass check)"
  fi
else
  echo "[start-studio-preview] SKIP_STUDIO_BUILD=1 – trusting existing dist/"
fi

echo "[start-studio-preview] Starting Vite preview on $HOST:$PORT"
# Use pnpm exec so Vite respects the explicit host/port flags without an extra "--" arg
exec pnpm --filter @sim4d/studio exec -- vite preview --host "$HOST" --port "$PORT" --strictPort
