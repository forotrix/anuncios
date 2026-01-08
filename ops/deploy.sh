#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

git fetch origin
git checkout main
git pull --ff-only origin main

pnpm install --frozen-lockfile
pnpm -C apps/api build

pm2 startOrReload ops/pm2-ecosystem.config.js
pm2 save
